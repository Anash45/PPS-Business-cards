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
    public int $chunkSize = 10;
    public int $companyId;

    public $tries = 3;    // max attempts
    public $timeout = 300; // 5 minutes per job

    public function __construct(array $cardIds, int $companyId)
    {
        $this->cardIds = $cardIds;
        $this->companyId = $companyId;
    }

    public function middleware()
    {
        // Prevent overlapping for same company
        return [(new \Illuminate\Queue\Middleware\WithoutOverlapping('cards-sync-lock-' . $this->companyId))->expireAfter(180)];
    }

    public function handle()
    {
        Log::info("BulkCardWalletSyncJob started for company {$this->companyId} with " . count($this->cardIds) . " cards.");

        $cards = Card::whereIn('id', $this->cardIds)
            ->where('is_syncing', true) // only process cards already marked syncing
            ->take($this->chunkSize)
            ->get();

        if ($cards->isEmpty()) {
            Log::info("No cards to process for company {$this->companyId}.");
            return;
        }

        foreach ($cards as $card) {
            try {
                Log::info("Syncing Card {$card->id}...");
                app(DesignController::class)->buildCardWalletFromCardApi($card);
                Log::info("Card {$card->id} synced successfully.");
            } catch (\Exception $e) {
                Log::error("Card {$card->id} sync failed: " . $e->getMessage());
            }
        }

        // Reset is_syncing in case of failure or completion
        try {
            Card::whereIn('id', $cards->pluck('id'))->update(['is_syncing' => false]);
            Log::info("Reset is_syncing for " . count($cards) . " cards for company {$this->companyId}.");
        } catch (\Exception $e) {
            Log::error("Failed to reset is_syncing: " . $e->getMessage());
        }

        Log::info("BulkCardWalletSyncJob finished for company {$this->companyId}.");
    }
}
