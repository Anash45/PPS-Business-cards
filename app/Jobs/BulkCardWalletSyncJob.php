<?php

namespace App\Jobs;

use App\Http\Controllers\DesignController;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Card;
use Illuminate\Support\Facades\Log;

class BulkCardWalletSyncJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public array $cardIds;
    public int $chunkSize = 15;
    public int $companyId;

    public $tries = 3;
    public $timeout = 300;

    public function __construct(array $cardIds, int $companyId)
    {
        $this->cardIds = $cardIds;
        $this->companyId = $companyId;
    }

    public function middleware()
    {
        // Prevent overlapping per company
        return [
            (new \Illuminate\Queue\Middleware\WithoutOverlapping(
                'cards-sync-lock-' . $this->companyId
            ))->expireAfter(180)
        ];
    }

    public function handle()
    {
        Log::info("BulkCardWalletSyncJob STARTED for company {$this->companyId} with "
            . count($this->cardIds) . " cards.");

        // Fetch cards that are STILL marked as syncing.
        $cards = Card::whereIn('id', $this->cardIds)
            ->where('is_syncing', true)
            ->take($this->chunkSize)
            ->get();

        if ($cards->isEmpty()) {
            Log::info("No pending cards to process for company {$this->companyId}.");
            return;
        }

        foreach ($cards as $card) {
            Log::info("Processing Card {$card->id}...");

            // 🔍 **Re-check 1: Eligibility**
            if (!$card->is_eligible_for_sync['eligible']) {
                Log::warning("Card {$card->id} skipped (NOT eligible). Missing fields: "
                    . json_encode($card->is_eligible_for_sync['missing_fields']));

                $card->update(['is_syncing' => false]);
                continue;
            }

            // 🔍 **Re-check 2: Already synced**
            if ($card->wallet_status['status'] === 'synced') {
                Log::info("Card {$card->id} skipped (already synced).");
                $card->update(['is_syncing' => false]);
                continue;
            }

            // 🔁 **Actual Sync**
            try {
                Log::info("Syncing card {$card->id}...");
                app(DesignController::class)->buildCardWalletFromCardApi($card);
                Log::info("Card {$card->id} synced successfully.");
            } catch (\Throwable $e) {
                Log::error("Card {$card->id} sync FAILED: " . $e->getMessage());
            }

            // Always reset
            try {
                $card->update(['is_syncing' => false]);
            } catch (\Throwable $e) {
                Log::error("Failed to reset is_syncing for Card {$card->id}: " . $e->getMessage());
            }
        }

        Log::info("BulkCardWalletSyncJob FINISHED for company {$this->companyId}.");
    }
}
