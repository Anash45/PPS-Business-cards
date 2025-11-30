<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class TestCronCommand extends Command
{
    protected $signature = 'test:cron';
    protected $description = 'Test cron job every minute';

    public function handle()
    {
        Log::info('TestCronCommand ran successfully at ' . now());
        $this->info('TestCronCommand ran successfully at ' . now());

        return 0;
    }
}
