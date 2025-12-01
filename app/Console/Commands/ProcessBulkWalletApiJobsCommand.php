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
        Log::info('[ProcessBulkWalletApiJobsCommand] Cron command started at ' . now());
        $this->info('Starting ProcessBulkWalletApiJob dispatch...');

        ProcessBulkWalletApiJob::dispatch();

        $this->info('ProcessBulkWalletApiJob dispatched successfully.');
        Log::info('[ProcessBulkWalletApiJobsCommand] Cron command ended at ' . now());
    }
}
