<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\ProcessBulkWalletApiJob;
use Illuminate\Support\Facades\Log;

class ProcessBulkWalletApiJobsCommand extends Command
{
    protected $signature = 'wallet:process-jobs';
    protected $description = 'Process pending Bulk Wallet API jobs in batches';

    public function handle()
    {
        Log::info('[2 ProcessBulkWalletApiJobsCommand] Cron command started at ' . now());
        $this->info('2 Starting ProcessBulkWalletApiJob dispatch...');

        ProcessBulkWalletApiJob::dispatch();

        $this->info('2 ProcessBulkWalletApiJob dispatched successfully.');
        Log::info('[2 ProcessBulkWalletApiJobsCommand] Cron command ended at ' . now());
    }
}
