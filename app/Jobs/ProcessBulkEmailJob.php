<?php

namespace App\Jobs;

use App\Helpers\CardHelper;
use App\Models\BulkEmailJob;
use App\Models\BulkEmailJobItem;
use App\Models\Card;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessBulkEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $batchSize = 50;
    public $maxStuckMinutes = 10; // Consider a job stuck if last_processed_at older than this
    public $maxInactiveMinutes = 30;
    public $jobName = 'ProcessBulkEmailJob';

    public function handle()
    {
        Log::info("[{$this->jobName}] Started at " . now());

        // Fetch next pending or processing job
        $job = BulkEmailJob::whereIn('status', ['pending', 'processing'])
            ->orderBy('created_at', 'asc')
            ->first();

        if (!$job) {
            Log::info("[{$this->jobName}] No email jobs found.");
            return;
        }

        // Stop if last activity > 30 minutes
        if ($job->last_processed_at && $job->last_processed_at < now()->subMinutes($this->maxInactiveMinutes)) {
            $job->update([
                'status' => 'failed',
                'reason' => 'Job expired after 30 minutes of inactivity'
            ]);

            Log::warning("[{$this->jobName}] Job {$job->id} expired.");
            return;
        }

        Log::info("[{$this->jobName}] Working on job_id={$job->id} for company_id={$job->company_id}");

        // Prevent overlapping jobs for same company
        $alreadyProcessing = BulkEmailJob::where('company_id', $job->company_id)
            ->where('status', 'processing')
            ->where('id', '<>', $job->id)
            ->where('last_processed_at', '>=', now()->subMinutes($this->maxStuckMinutes))
            ->exists();

        if ($alreadyProcessing) {
            Log::info("[{$this->jobName}] Another job is already running for company {$job->company_id}. Skipping this run.");
            return;
        }

        // Mark as processing
        $job->update([
            'status' => 'processing',
            'last_processed_at' => now()
        ]);

        // Fetch next batch of email items
        $items = $job->items()
            ->where('status', 'pending')
            ->limit($this->batchSize)
            ->get();

        if ($items->isEmpty()) {
            $job->update(['status' => 'completed']);
            Log::info("[{$this->jobName}] All emails sent for job {$job->id}.");
            return;
        }

        Log::info("[{$this->jobName}] Sending {$items->count()} emails.");

        foreach ($items as $item) {
            // Check if job has been inactive too long during processing
            $job->refresh();
            if ($job->last_processed_at && $job->last_processed_at < now()->subMinutes($this->maxInactiveMinutes)) {
                $job->update([
                    'status' => 'failed',
                    'reason' => 'Job stopped due to inactivity during batch processing'
                ]);
                Log::warning("[{$this->jobName}] Job {$job->id} stopped mid-batch due to inactivity.");
                return;
            }

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

                // 🟢 SEND EMAIL
                CardHelper::sendCardEmail($card->id);

                $item->update(['status' => 'sent']);

                // Update heartbeat after each email
                $job->update(['last_processed_at' => now()]);

                Log::info("[{$this->jobName}] Email sent for card_id={$card->id}");

            } catch (\Exception $e) {
                $item->update([
                    'status' => 'failed',
                    'reason' => $e->getMessage()
                ]);

                Log::error("[{$this->jobName}] Failed to send email for card {$item->card_id}: {$e->getMessage()}");
            }
        }

        // Update counters
        $processed = $job->items()->whereIn('status', ['sent', 'failed'])->count();
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
