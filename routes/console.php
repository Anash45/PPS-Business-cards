<?php

use App\Console\Commands\TestCronCommand;
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
    $this->comment('Dispatching ProcessBulkWalletApiJob...');
    ProcessBulkWalletApiJob::dispatch();
    $this->comment('ProcessBulkWalletApiJob dispatched successfully.');
})->describe('Process pending Bulk Wallet API jobs in batches');