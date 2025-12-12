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
        Log::info('1 TestCronCommand ran successfully at ' . now());
        $this->info('1 TestCronCommand ran successfully at ' . now());

        return 0;
    }
}
