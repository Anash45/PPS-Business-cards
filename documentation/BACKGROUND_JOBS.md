# Background Jobs Documentation

This document explains how to set up and manage background jobs for processing bulk wallet synchronization and bulk email sending.

## Overview

The application uses Laravel's queue system to process background jobs for:
- **Wallet Sync Jobs**: Synchronizing business cards to Apple Wallet and Google Pay
- **Email Jobs**: Sending bulk emails to business card recipients

## Architecture

### Job Classes
- `App\Jobs\ProcessBulkWalletApiJob` - Processes wallet sync operations
- `App\Jobs\ProcessBulkEmailJob` - Processes email sending operations

### Console Commands
- `wallet:process-jobs` - Dispatches wallet sync job processing
- `emails:process-jobs` - Dispatches email job processing

### Models
- `BulkWalletApiJob` - Main wallet job record
- `BulkWalletApiJobItem` - Individual wallet sync items
- `BulkEmailJob` - Main email job record
- `BulkEmailJobItem` - Individual email items

## Configuration

### 1. Queue Connection Setup

The application is configured to use **synchronous** job execution for shared hosting environments.

In your `.env` file:
```env
QUEUE_CONNECTION=sync
```

**Why sync?** 
- Shared hosting environments typically don't support persistent queue workers
- Jobs execute immediately when dispatched
- No need for a separate queue worker process

### 2. Cron Job Configuration

Set up cron jobs to process background jobs every minute:

#### For Wallet Sync Jobs:
```bash
* * * * * /opt/alt/php82/usr/bin/php /home/u801407417/domains/ppsbusinesscards.de/public_html/app/artisan wallet:process-jobs >> /dev/null 2>&1
```

#### For Email Jobs:
```bash
* * * * * /opt/alt/php82/usr/bin/php /home/u801407417/domains/ppsbusinesscards.de/public_html/app/artisan emails:process-jobs >> /dev/null 2>&1
```

**Important Notes:**
- Replace the PHP path with your server's PHP 8.2 binary path
- Replace the artisan path with your actual application path
- Jobs run every minute but will skip if no pending jobs exist
- Logs are written to Laravel's log files

## How It Works

### Wallet Sync Job Flow

1. User triggers bulk wallet sync from the UI
2. `BulkWalletApiJob` record is created with status `pending`
3. Individual `BulkWalletApiJobItem` records are created for each card
4. Cron job runs `wallet:process-jobs` every minute
5. `ProcessBulkWalletApiJob` picks up the first pending/processing job
6. Processes items in batches (10 cards per run)
7. Updates job status and progress after each batch
8. Job continues until all items are processed or failed

### Email Job Flow

1. User triggers bulk email sending from the UI
2. `BulkEmailJob` record is created with status `pending`
3. Individual `BulkEmailJobItem` records are created for each recipient
4. Cron job runs `emails:process-jobs` every minute
5. `ProcessBulkEmailJob` picks up the first pending/processing job
6. Processes items in batches (50 emails per run)
7. Updates job status and progress after each batch
8. Job continues until all items are sent or failed

## Job Processing Features

### Batch Processing
- **Wallet Jobs**: 10 cards per minute
- **Email Jobs**: 50 emails per minute
- Prevents server overload and API rate limiting

### Inactivity Detection
- Jobs expire after **30 minutes** of inactivity
- Prevents stuck jobs from blocking the queue
- Automatic failure status with reason

### Overlapping Prevention
- Only one job per company processes at a time
- Prevents race conditions and duplicate processing
- Jobs older than 10 minutes are considered stuck

### Progress Tracking
- Real-time progress updates in the UI
- Shows processed/total items count
- Visual progress bar
- Last processed timestamp

## Job Statuses

| Status | Description |
|--------|-------------|
| `pending` | Job is waiting to be processed |
| `processing` | Job is currently being processed |
| `completed` | All items processed successfully |
| `failed` | Job failed due to errors or timeout |
| `cancelled` | Job was cancelled by user |

## Monitoring Jobs

### Via Web Interface
Navigate to `/background-jobs` to view:
- All wallet sync jobs
- All email jobs
- Real-time progress updates (auto-refresh every 10 seconds)
- Job status and details

### Via Logs
Check Laravel logs at `storage/logs/laravel.log`:
```bash
tail -f storage/logs/laravel.log | grep "ProcessBulk"
```

Log messages include:
- Job start/end timestamps
- Items processed per batch
- Individual item successes/failures
- Error messages with stack traces

## Cancelling Jobs

### Via Web Interface
1. Navigate to `/background-jobs`
2. Find the job with status `pending` or `processing`
3. Click the "Cancel" button in the Actions column
4. Confirm the cancellation

### What Happens When Cancelled
- Job status changes to `cancelled`
- All pending/processing items are marked as `cancelled`
- Reason is set to "Cancelled by user"
- Job stops processing on next cron run

### Via Database
```sql
-- Cancel a specific job
UPDATE bulk_email_jobs SET status = 'cancelled', reason = 'Cancelled by admin' WHERE id = 123;
UPDATE bulk_email_job_items SET status = 'cancelled', reason = 'Cancelled by admin' WHERE bulk_email_job_id = 123;
```

## Testing Locally

### Test with sync driver (recommended):
```bash
# Make sure .env has QUEUE_CONNECTION=sync
php artisan emails:process-jobs
php artisan wallet:process-jobs
```

### Test with database driver:
```bash
# Set QUEUE_CONNECTION=database in .env
php artisan queue:table
php artisan migrate
php artisan queue:work --stop-when-empty
```

## Troubleshooting

### Jobs not processing
1. **Check .env file**: Ensure `QUEUE_CONNECTION=sync`
2. **Check cron jobs**: Verify cron is running with `crontab -l`
3. **Check logs**: Look for errors in `storage/logs/laravel.log`
4. **Check permissions**: Ensure artisan is executable

### Jobs stuck in processing
- Jobs automatically fail after 30 minutes of inactivity
- Manually reset: `UPDATE bulk_email_jobs SET status = 'pending' WHERE id = X;`

### Emails not sending
1. Check mail configuration in `.env`
2. Verify SMTP credentials
3. Check `CardHelper::sendCardEmail()` method
4. Look for exceptions in logs

### Wallet sync failing
1. Verify Apple/Google API credentials
2. Check network connectivity
3. Review rate limits
4. Check card data validity

## Advanced Configuration

### Adjusting Batch Sizes

**For Email Jobs** (in `ProcessBulkEmailJob.php`):
```php
public $batchSize = 50; // Change to desired batch size
```

**For Wallet Jobs** (in `ProcessBulkWalletApiJob.php`):
```php
public $batchSize = 10; // Change to desired batch size
```

### Adjusting Timeouts

```php
public $maxInactiveMinutes = 30; // Job expiry time
public $maxStuckMinutes = 10;    // Consider job stuck threshold
```

### Using Queue Workers (VPS/Dedicated Server)

If you have access to persistent processes:

1. Update `.env`:
```env
QUEUE_CONNECTION=database
```

2. Run migrations:
```bash
php artisan queue:table
php artisan migrate
```

3. Start queue worker:
```bash
php artisan queue:work --tries=3 --timeout=300
```

4. Use Supervisor to keep worker alive:
```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/worker.log
```

## Best Practices

1. **Monitor logs regularly** for errors and performance issues
2. **Set up alerts** for failed jobs
3. **Test thoroughly** before deploying to production
4. **Keep batch sizes reasonable** to avoid timeouts
5. **Use database backups** before bulk operations
6. **Document custom changes** to job processing logic
7. **Review cancelled jobs** to understand user behavior

## Related Files

- Jobs: `app/Jobs/ProcessBulk*.php`
- Commands: `app/Console/Commands/ProcessBulk*Command.php`
- Models: `app/Models/Bulk*.php`
- Controller: `app/Http/Controllers/BackgroundJobsController.php`
- Routes: `routes/web.php` (background-jobs routes)
- UI: `resources/js/Pages/BackgroundJobs/Index.jsx`

## Support

For issues or questions, check:
- Application logs: `storage/logs/laravel.log`
- Server logs: Check your hosting provider's documentation
- Laravel Queue Documentation: https://laravel.com/docs/queues
