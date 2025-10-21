<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\CardsGroup;
use App\Models\Company;
use Auth;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Str;

class CardsController extends Controller
{
    public function index()
    {
        // Load companies with their owner → subscription → plan relationships
        $companies = Company::with(['owner.subscription.plan', 'cards'])->get();

        // Append total and remaining cards for each company
        $companies = $companies->map(function ($company) {
            $plan = $company->owner?->subscription?->plan;
            $totalCards = $plan?->cards_included ?? 0;
            $usedCards = $company->cards->count();
            $remainingCards = max(0, $totalCards - $usedCards);

            $company->total_cards_allowed = $totalCards;
            $company->used_cards = $usedCards;
            $company->remaining_cards = $remainingCards;

            return $company;
        });

        // Load card groups with counts
        $cardsGroups = CardsGroup::with(['company', 'cards'])
            ->withCount('cards')
            ->orderByDesc('created_at')
            ->get();

        return inertia('Cards/Index', [
            'companies' => $companies,
            'cardsGroups' => $cardsGroups,
        ]);
    }


    /**
     * Create cards for a company in a new group
     */
    public function store(Request $request)
    {
        $request->validate([
            'company_id' => 'required|exists:companies,id',
            'quantity' => 'required|integer|min:1|max:10000',
        ]);

        DB::beginTransaction();

        try {
            // Fetch company
            $company = Company::findOrFail($request->company_id);

            // ✅ Check subscription limits
            $owner = $company->owner; // assuming hasOne relation like company->owner()
            $subscription = $owner?->subscription; // assuming hasOne relation user->subscription
            $plan = $subscription?->plan;

            if (!$plan) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active subscription plan found for this company owner.'
                ], 403);
            }

            // Total allowed cards by plan
            $maxCards = $plan->cards_included ?? 0;

            // Count existing company cards
            $usedCards = $company->cards()->count();

            // Remaining allowed cards
            $remainingCards = max(0, $maxCards - $usedCards);

            // ✅ Validate remaining capacity
            if ($remainingCards <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have reached your card limit. Upgrade your plan to create more cards.',
                    'remaining' => 0,
                ], 403);
            }

            if ($request->quantity > $remainingCards) {
                return response()->json([
                    'success' => false,
                    'message' => "You can only create {$remainingCards} more card(s) under your current plan.",
                    'remaining' => $remainingCards,
                ], 403);
            }

            // ✅ Create a new group
            $group = CardsGroup::create([
                'company_id' => $company->id,
                'uuid' => Str::uuid(),
            ]);

            $cards = [];
            $createdCards = [];
            $now = now();

            for ($i = 0; $i < $request->quantity; $i++) {
                $code = Card::generateCode();

                $cardData = [
                    'company_id' => $company->id,
                    'cards_group_id' => $group->id,
                    'code' => $code,
                    'status' => 'inactive',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                $cards[] = $cardData;

                $createdCards[] = [
                    'code' => $code,
                    'status' => 'inactive',
                    'company' => [
                        'id' => $company->id,
                        'name' => $company->name,
                        'billing_email' => $company->billing_email,
                    ],
                    'group_id' => $group->id,
                    'created_at' => $now->toDateTimeString(),
                    'updated_at' => $now->toDateTimeString(),
                ];
            }

            Card::insert($cards);

            DB::commit();

            return response()->json([
                'success' => true,
                'group_id' => $group->id,
                'cards_created' => $request->quantity,
                'remaining_after_creation' => $remainingCards - $request->quantity,
                'createdCards' => $createdCards,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }



    /**
     * List all cards groups for a company
     */
    public function groups($companyId)
    {
        $groups = CardsGroup::with('cards')
            ->where('company_id', $companyId)
            ->get();

        return response()->json($groups);
    }

    /**
     * Delete a group and all its cards
     */
    public function destroyGroup($groupId)
    {
        $group = CardsGroup::with('cards')->findOrFail($groupId);

        // Check if any card in the group is active
        $hasActiveCards = $group->cards->where('status', 'active')->count() > 0;

        if ($hasActiveCards) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete group. Some cards are still active.'
            ], 400);
        }

        // Safe to delete if no active cards
        $group->delete();

        return response()->json(['success' => true, 'message' => 'Group deleted successfully.']);
    }

    public function downloadGroup($groupId)
    {
        $group = CardsGroup::with(['cards', 'company'])->findOrFail($groupId);

        $filename = "cards_group_{$group->id}.csv";

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($group) {
            $file = fopen('php://output', 'w');

            // CSV header
            fputcsv($file, ['Sr#', 'Card id', 'Company', 'URL', 'Code', 'Created']);

            // Add rows
            foreach ($group->cards as $index => $card) {
                $createdAt = Carbon::parse($card->created_at)->format('d.m.Y H:i');

                fputcsv($file, [
                    $index + 1,
                    $card->id,
                    $group->company->name ?? '',
                    env('LINK_URL') . '/card/' . $card->code, // URL format
                    $card->code,
                    $createdAt,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function companyCards()
    {
        $user = Auth::user();

        // Determine correct company reference
        $company = $user->isCompany() ? $user->companyProfile : $user->company;

        // ✅ Allow both company and editor
        if (!$user->isCompany() && !$user->isEditor()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Only company or editor users can perform this action.',
            ], 403);
        }

        // Get all cards for this company
        $cards = Card::where('company_id', $user->company->id)->get();

        // Pass to Inertia
        return Inertia::render('Cards/Company', [
            'cards' => $cards,
            'isSubscriptionActive' => $company->owner->hasActiveSubscription(),
        ]);
    }

    public function toggleStatus(Request $request, Card $card)
    {
        $user = Auth::user();


        // ✅ Normalize company id for any user type
        $companyId = $user->isCompany()
            ? $user->companyProfile->id   // if user is a company
            : $user->company_id;           // if user belongs to a company


        // ✅ Now safe comparison
        if (
            !$user->isCompany() && (
                !$user->isEditor() || (int) $card->company_id !== (int) $companyId
            )
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action.',
            ], 403);
        }

        // Validate incoming status
        $request->validate([
            'status' => 'required|in:active,inactive',
        ]);

        $card->status = $request->status;
        $card->save();

        return response()->json([
            'success' => true,
            'message' => 'Card status updated successfully.',
            'card' => $card,
        ]);
    }

}
