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
        Log::info('[ProcessBulkEmailJobsCommand] Command started at ' . now());
        $this->info('Dispatching ProcessBulkEmailJob...');

        try {
            ProcessBulkEmailJob::dispatch();
            $this->info('ProcessBulkEmailJob dispatched successfully.');
            Log::info('[ProcessBulkEmailJobsCommand] Job dispatched successfully.');
        } catch (\Exception $e) {
            $this->error('Failed to dispatch email job: ' . $e->getMessage());
            Log::error('[ProcessBulkEmailJobsCommand] Failed: ' . $e->getMessage());
        }

        Log::info('[ProcessBulkEmailJobsCommand] Command finished at ' . now());
    }
}