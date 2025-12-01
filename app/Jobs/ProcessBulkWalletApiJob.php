<?php

namespace App\Jobs;

use App\Models\BulkWalletApiJob;
use App\Models\BulkWalletApiJobItem;
use App\Models\Card;
use App\Http\Controllers\DesignController;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessBulkWalletApiJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $batchSize = 10; // Number of cards per batch
    public $maxStuckMinutes = 10; // Consider a job stuck if last_processed_at older than this
    public $jobName = 'ProcessBulkWalletApiJob';

    public function handle()
    {
        Log::info("[{$this->jobName}] Job execution started at " . now());

        // Get next pending job or stuck job
        $job = BulkWalletApiJob::where(function ($q) {
            $q->where('status', 'pending')
                ->orWhere(function ($q2) {
                    $q2->where('status', 'processing')
                        ->where('last_processed_at', '<', now()->subMinutes($this->maxStuckMinutes));
                });
        })
            ->orderBy('created_at', 'asc')
            ->first();

        if (!$job) {
            Log::info("[{$this->jobName}] No pending or stuck BulkWalletApiJob found.");
            return;
        }

        Log::info("[{$this->jobName}] Found job_id={$job->id} for company_id={$job->company_id}");

        // Prevent overlapping jobs for same company
        $alreadyProcessing = BulkWalletApiJob::where('company_id', $job->company_id)
            ->where('status', 'processing')
            ->where('id', '<>', $job->id)
            ->where('last_processed_at', '>=', now()->subMinutes($this->maxStuckMinutes))
            ->exists();

        if ($alreadyProcessing) {
            Log::info("[{$this->jobName}] Another job is already running for company {$job->company_id}. Skipping this run.");
            return;
        }

        // Mark job as processing
        $job->update(['status' => 'processing', 'last_processed_at' => now()]);

        // Fetch next batch of pending items
        $items = $job->items()->where('status', 'pending')
            ->limit($this->batchSize)
            ->get();

        if ($items->isEmpty()) {
            $job->status = 'completed';
            $job->save();
            Log::info("[{$this->jobName}] All items already processed for job {$job->id}. Marked as completed.");
            return;
        }

        Log::info("[{$this->jobName}] Processing batch of {$items->count()} items for job_id={$job->id}");

        foreach ($items as $item) {
            try {
                $card = Card::find($item->card_id);

                if (!$card) {
                    $item->update([
                        'status' => 'failed',
                        'reason' => 'Card not found'
                    ]);
                    Log::warning("[{$this->jobName}] Card not found, item_id={$item->id}");
                    continue;
                }

                // Check eligibility and already synced
                if ($card->wallet_status['status'] === 'synced') {
                    $item->update([
                        'status' => 'failed',
                        'reason' => 'Already synced'
                    ]);
                    Log::info("[{$this->jobName}] Card already synced, card_id={$card->id}");
                    continue;
                }

                if (!$card->is_eligible_for_sync['eligible']) {
                    $item->update([
                        'status' => 'failed',
                        'reason' => 'Not eligible for sync'
                    ]);
                    Log::info("[{$this->jobName}] Card not eligible for sync, card_id={$card->id}");
                    continue;
                }

                // Call your existing API function
                app(DesignController::class)->buildCardWalletFromCardApi($card);

                $item->update(['status' => 'synced']);
                Log::info("[{$this->jobName}] Card synced successfully, card_id={$card->id}");

            } catch (\Exception $e) {
                $item->update([
                    'status' => 'failed',
                    'reason' => $e->getMessage(),
                ]);
                Log::error("[{$this->jobName}] Failed to sync card {$item->card_id}: {$e->getMessage()}");
            }
        }

        // Update job progress
        $processed = $job->items()->whereIn('status', ['synced', 'failed'])->count();
        $job->processed_items = $processed;

        if ($processed >= $job->total_items) {
            $job->status = 'completed';
        } else {
            $job->status = 'processing';
        }

        // Update heartbeat
        $job->last_processed_at = now();
        $job->save();

        Log::info("[{$this->jobName}] Batch processed: {$items->count()} items for job_id={$job->id}. Processed total: {$processed}/{$job->total_items}");
        Log::info("[{$this->jobName}] Job execution ended at " . now());
    }
}
