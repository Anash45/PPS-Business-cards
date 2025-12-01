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

        Log::info("[{$this->jobName}] Working on job_id={$job->id}");

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
            try {
                $card = Card::find($item->card_id);

                if (!$card) {
                    $item->update([
                        'status' => 'failed',
                        'reason' => 'Card not found'
                    ]);
                    continue;
                }

                // 🟢 SEND EMAIL
                CardHelper::sendCardEmail($card->id);

                $item->update(['status' => 'sent']);

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
            $job->update(['status' => 'completed']);
        } else {
            $job->update(['status' => 'processing']);
        }

        // Heartbeat
        $job->update(['last_processed_at' => now()]);

        Log::info("[{$this->jobName}] Batch complete. {$processed}/{$job->total_items} done.");
    }
}
