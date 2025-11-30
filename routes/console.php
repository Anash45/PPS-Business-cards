<?php

use App\Console\Commands\TestCronCommand;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('test:cron', function () {
    $this->call(TestCronCommand::class);
});