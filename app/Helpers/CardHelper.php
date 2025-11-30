<?php

namespace App\Helpers;

use App\Mail\CardWalletNotificationMail;
use App\Models\Card;
use Illuminate\Support\Facades\Log;
use Mail;

class CardHelper
{
    /**
     * Fetch card download info and log it.
     *
     * @param int $cardId
     * @return array|null
     */
    public static function sendCardEmail(int $cardId): array
    {
        // 1. Check if card exists
        $card = Card::with('cardWallet')->find($cardId);

        if (!$card) {
            Log::warning("CardEmailService: Card {$cardId} not found");
            return [
                'success' => false,
                'message' => 'Card not found.',
            ];
        }

        // 2. Check if eligible
        if (!$card->is_eligible_for_sync['eligible']) {
            Log::info("CardEmailService: Card {$card->id} not eligible for sync");
            return [
                'success' => false,
                'message' => 'Card is not eligible for sync.',
                'errors' => $card->is_eligible_for_sync['missing_fields'],
            ];
        }

        // 3. Check if synced
        if ($card->wallet_status['status'] !== 'synced') {
            Log::info("CardEmailService: Card {$card->id} is not synced yet");
            $card->update(['last_email_sent' => now()]);
            return [
                'success' => false,
                'message' => 'Card wallet is not synced.',
                'status' => $card->wallet_status['status'],
            ];
        }

        // 4. Get links
        $code = $card->code;
        $downloadLink = $card->cardWallet->download_link ?? null;

        $viewCardLink = rtrim(env('LINK_URL'), '/') . "/card/" . $code;

        Log::info("CardEmailService: Ready to send email", [
            'download_link' => $downloadLink,
            'view_card_link' => $viewCardLink,
        ]);

        // 5. Send the email
        Mail::to($card->primary_email)->send(
            new CardWalletNotificationMail($downloadLink, $viewCardLink, $card->first_name)
        );

        // 6. Optionally update last_email_sent
        $card->update(['last_email_sent' => now()]);

        return [
            'success' => true,
            'message' => 'Email sent successfully.',
            'card_id' => $card->id,
            'download_link' => $downloadLink,
            'view_card_link' => $viewCardLink,
        ];
    }

}
