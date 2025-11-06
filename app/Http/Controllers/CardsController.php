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
use Symfony\Component\HttpFoundation\StreamedResponse;

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
                !in_array($user->role, ['editor', 'template_editor'])
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

    public function toggleMultipleStatus(Request $request)
    {
        $user = Auth::user();

        // ✅ Validate input
        $data = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:cards,id',
            'status' => 'required|in:active,inactive',
        ]);

        // ✅ Normalize company id for any user type
        $companyId = $user->isCompany()
            ? $user->companyProfile->id   // if user is a company
            : $user->company_id;           // if user belongs to a company

        // ✅ Fetch cards belonging to this company
        $cardsQuery = Card::whereIn('id', $data['ids'])
            ->where('company_id', $companyId);

        // ✅ Additional security: editors can only affect their own company’s cards
        if (!$user->isCompany() && !in_array($user->role, ['editor', 'template_editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action.',
            ], 403);
        }

        $updatedCount = $cardsQuery->update(['status' => $data['status']]);

        return response()->json([
            'success' => true,
            'message' => "{$updatedCount} card(s) updated successfully.",
            'updated_count' => $updatedCount,
        ]);
    }
    public function incrementDownloadsByCode(Request $request)
    {
        $code = $request->input('code');

        if (!$code) {
            return response()->json([
                'success' => false,
                'message' => 'Card code is required.',
            ], 422);
        }

        $card = Card::where('code', $code)->first();

        if (!$card) {
            return response()->json([
                'success' => false,
                'message' => 'Card not found.',
            ], 404);
        }

        $card->increment('downloads');

        return response()->json([
            'success' => true,
            'message' => 'Download count incremented successfully.',
            'downloads' => $card->downloads,
        ]);
    }

    public function downloadCsv(Request $request): StreamedResponse
    {
        $validated = $request->validate([
            'selected_ids' => 'required|array',
            'selected_ids.*' => 'integer|exists:cards,id',
            'csv_fields' => 'required|array',
            'csv_fields.*' => 'string',
        ]);

        $headers = $validated['csv_fields'];
        $filename = 'base_sample.csv';

        // Fetch cards with all relations
        $cards = Card::whereIn('id', $validated['selected_ids'])
            ->with([
                'cardWebsites',
                'cardEmails',
                'cardPhoneNumbers',
                'cardButtons',
                'cardSocialLinks',
                'cardAddresses',
            ])
            ->get();

        // Direct card fields
        $cardTableFields = [
            'card_code' => 'code',
            'salutation' => 'salutation',
            'title' => 'title',
            'first_name' => 'first_name',
            'last_name' => 'last_name',
            'degree' => 'degree',
            'position' => 'position',
            'department' => 'department',
        ];

        return response()->streamDownload(function () use ($cards, $headers, $cardTableFields) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $headers);

            foreach ($cards as $card) {
                $row = [];

                $websites = $card->cardWebsites->take(4)->values();
                $emails = $card->cardEmails->take(4)->values();
                $phones = $card->cardPhoneNumbers->take(4)->values();
                $buttons = $card->cardButtons->take(4)->values();
                $socials = $card->cardSocialLinks->take(5)->values();
                $addresses = $card->cardAddresses->take(4)->values();

                foreach ($headers as $field) {
                    // 🔹 Direct fields on cards table
                    if (isset($cardTableFields[$field])) {
                        $row[] = $card->{$cardTableFields[$field]} ?? '';

                        // 🔹 Websites
                    } elseif (preg_match('/website_url_(\d+)/', $field, $m)) {
                        $row[] = $websites[$m[1] - 1]->url ?? '';
                    } elseif (preg_match('/website_label_(\d+)/', $field, $m)) {
                        $row[] = $websites[$m[1] - 1]->label ?? '';

                        // 🔹 Emails
                    } elseif (preg_match('/card_email_(\d+)$/', $field, $m)) {
                        $row[] = $emails[$m[1] - 1]->email ?? '';
                    } elseif (preg_match('/card_email_label_(\d+)/', $field, $m)) {
                        $row[] = $emails[$m[1] - 1]->label ?? '';
                    } elseif (preg_match('/card_email_(\d+)_type/', $field, $m)) {
                        $row[] = $emails[$m[1] - 1]->type ?? '';

                        // 🔹 Phones
                    } elseif (preg_match('/card_phone_(\d+)$/', $field, $m)) {
                        $row[] = $phones[$m[1] - 1]->phone_number ?? '';
                    } elseif (preg_match('/card_phone_label_(\d+)/', $field, $m)) {
                        $row[] = $phones[$m[1] - 1]->label ?? '';
                    } elseif (preg_match('/card_phone_(\d+)_type/', $field, $m)) {
                        $row[] = $phones[$m[1] - 1]->type ?? '';

                        // 🔹 Buttons
                    } elseif (preg_match('/card_button_text_(\d+)/', $field, $m)) {
                        $row[] = $buttons[$m[1] - 1]->button_text ?? '';
                    } elseif (preg_match('/card_button_link_(\d+)/', $field, $m)) {
                        $row[] = $buttons[$m[1] - 1]->button_link ?? '';

                        // 🔹 Social Links
                    } elseif (preg_match('/social_link_(\d+)/', $field, $m)) {
                        $row[] = $socials[$m[1] - 1]->url ?? '';

                        // 🔹 Addresses
                    } elseif (preg_match('/address_(\d+)_label/', $field, $m)) {
                        $row[] = $addresses[$m[1] - 1]->label ?? '';
                    } elseif (preg_match('/address_(\d+)_type/', $field, $m)) {
                        $row[] = $addresses[$m[1] - 1]->type ?? '';
                    } elseif (preg_match('/address_(\d+)_street/', $field, $m)) {
                        $row[] = $addresses[$m[1] - 1]->street ?? '';
                    } elseif (preg_match('/address_(\d+)_house_number/', $field, $m)) {
                        $row[] = $addresses[$m[1] - 1]->house_number ?? '';
                    } elseif (preg_match('/address_(\d+)_zip/', $field, $m)) {
                        $row[] = $addresses[$m[1] - 1]->zip ?? '';
                    } elseif (preg_match('/address_(\d+)_city/', $field, $m)) {
                        $row[] = $addresses[$m[1] - 1]->city ?? '';
                    } elseif (preg_match('/address_(\d+)_country/', $field, $m)) {
                        $row[] = $addresses[$m[1] - 1]->country ?? '';

                        // 🔹 Fallback empty cell
                    } else {
                        $row[] = '';
                    }
                }

                fputcsv($handle, $row);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Cache-Control' => 'no-store, no-cache',
        ]);
    }




}
