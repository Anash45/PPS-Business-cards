<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\ProcessBulkEmailJob;
use Illuminate\Support\Facades\Log;

class ProcessBulkEmailJobsCommand extends Command
{
    protected $signature = 'emails:process-jobs';
    protected $description = 'Process pending Bulk Email jobs in batches';

    public function handle()
    {
        Log::info('[3 ProcessBulkEmailJobsCommand] Command started at ' . now());
        $this->info('3 Dispatching ProcessBulkEmailJob...');

        try {
            ProcessBulkEmailJob::dispatch();
            $this->info('3 ProcessBulkEmailJob dispatched successfully.');
            Log::info('[3 ProcessBulkEmailJobsCommand] Job dispatched successfully.');
        } catch (\Exception $e) {
            $this->error('3 Failed to dispatch email job: ' . $e->getMessage());
            Log::error('[3 ProcessBulkEmailJobsCommand] Failed: ' . $e->getMessage());
        }

        Log::info('[3 ProcessBulkEmailJobsCommand] Command finished at ' . now());
    }
}