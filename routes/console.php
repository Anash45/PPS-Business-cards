<?php

use App\Console\Commands\ProcessBulkEmailJobsCommand;
use App\Console\Commands\ProcessBulkWalletApiJobsCommand;
use App\Console\Commands\TestCronCommand;
use App\Jobs\ProcessBulkEmailJob;
use App\Jobs\ProcessBulkWalletApiJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('test:cron', function () {
    $this->call(TestCronCommand::class);
});

Artisan::command('wallet:process-jobs', function () {
    $this->comment('2 Dispatching ProcessBulkWalletApiJob...');
    $this->call(ProcessBulkWalletApiJobsCommand::class);
    $this->comment('2 ProcessBulkWalletApiJob dispatched successfully.');
})->describe('Process pending Bulk Wallet API jobs in batches');

Artisan::command('emails:process-jobs', function () {
    $this->comment('3 Dispatching ProcessBulkEmailJob...');
    $this->call(ProcessBulkEmailJobsCommand::class);
    $this->comment('3 ProcessBulkEmailJob dispatched successfully.');
})->describe('Process pending Bulk Email jobs in batches');