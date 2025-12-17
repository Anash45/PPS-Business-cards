<?php

namespace App\Http\Controllers;

use App\Models\BulkEmailJob;
use App\Models\BulkWalletApiJob;
use App\Models\Card;
use App\Models\CardsGroup;
use App\Models\Company;
use App\Models\NfcCard;
use App\Traits\DataTableTrait;
use Auth;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CardsController extends Controller
{
    use DataTableTrait;
    public function index(Request $request)
    {
        // Load companies with owner → subscription → plan
        $companies = Company::with(['owner.subscription.plan', 'nfcCards'])->get();

        $companies = $companies->map(function ($company) {
            $plan = $company->owner?->subscription?->plan;

            // ------------------------
            // Normal Cards
            // ------------------------
            $totalCards = $plan?->cards_included ?? 0;
            $usedCards = $company->cards()->count(); // only used normal cards
            $remainingCards = max(0, $totalCards - $usedCards);

            $company->total_cards_allowed = $totalCards;
            $company->used_cards = $usedCards;
            $company->remaining_cards = $remainingCards;

            // ------------------------
            // NFC Cards
            // ------------------------
            $totalNfcCards = $plan?->nfc_cards_included ?? 0;
            $nfcUsed = $company->nfcCards()->count(); // only used NFC cards
            $nfcRemaining = max(0, $totalNfcCards - $nfcUsed);

            $company->total_nfc_cards = $totalNfcCards;
            $company->nfc_used = $nfcUsed;
            $company->nfc_remaining = $nfcRemaining;

            return $company;
        });

        // Define searchable columns for cardsGroups
        $searchableColumns = [
            'id',
            'company.name',
            'created_at',
        ];

        // Define sortable columns for cardsGroups
        $sortableColumns = [
            'id',
            'created_at',
            'updated_at',
        ];

        // Start with base query - card groups with relations
        $query = CardsGroup::with([
            'company',
            'cards' => function ($query) {
                $query->orderByDesc('created_at')->take(100);
            },
            'nfcCards' => function ($query) {
                $query->orderByDesc('created_at')->take(100);
            },
        ])->withCount(['cards', 'nfcCards']);

        // Apply DataTable filters (search, sort, pagination)
        $cardsGroups = $this->applyDataTableFilters(
            $query,
            $request,
            $searchableColumns,
            $sortableColumns,
            10 // default per page
        );

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
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'quantity' => 'required|integer|min:0|max:10000',
            'nfc_quantity' => 'required|integer|min:0|max:10000',
        ]);

        // At least one quantity must be > 0
        if ($validated['quantity'] == 0 && $validated['nfc_quantity'] == 0) {
            return response()->json([
                'success' => false,
                'message' => 'You must create at least one normal card or one NFC card.',
            ], 422);
        }

        DB::beginTransaction();

        try {
            $company = Company::findOrFail($request->company_id);
            $owner = $company->owner;
            $subscription = $owner?->subscription;
            $plan = $subscription?->plan;

            if (!$plan) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active subscription plan found for this company owner.'
                ], 403);
            }

            // -------------------
            // Normal Cards Limit
            // -------------------
            $maxCards = $plan->cards_included ?? 0;
            $usedCards = $company->cards()->count();
            $remainingCards = max(0, $maxCards - $usedCards);

            if ($request->quantity > $remainingCards) {
                return response()->json([
                    'success' => false,
                    'message' => "You can only create {$remainingCards} more employee(s) under your current plan.",
                    'remaining' => $remainingCards,
                ], 403);
            }

            // -------------------
            // NFC Cards Limit
            // -------------------
            $maxNfcCards = $plan->nfc_cards_included ?? 0;
            $usedNfc = $company->nfcCards()->count();
            $remainingNfc = max(0, $maxNfcCards - $usedNfc);

            if ($request->nfc_quantity > $remainingNfc) {
                return response()->json([
                    'success' => false,
                    'message' => "You can only create {$remainingNfc} more NFC card(s) under your current plan.",
                    'remaining_nfc' => $remainingNfc,
                ], 403);
            }

            // -------------------
            // Create Card Group
            // -------------------
            $group = CardsGroup::create([
                'company_id' => $company->id,
                'uuid' => Str::uuid(),
            ]);

            $cards = [];
            $createdCards = [];
            $nfcCards = [];
            $createdNfcCards = [];
            $now = now();
            $chunkSize = 1000; // safe batch size

            // Create normal cards
            if ($request->quantity > 0) {
                for ($i = 0; $i < $request->quantity; $i++) {
                    $code = Card::generateCode();

                    $cards[] = [
                        'company_id' => $company->id,
                        'cards_group_id' => $group->id,
                        'code' => $code,
                        'status' => 'inactive',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];

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
                if (!empty($cards)) {
                    foreach (array_chunk($cards, $chunkSize) as $chunk) {
                        Card::insert($chunk);
                    }
                }
            }

            // Create NFC cards
            if ($request->nfc_quantity > 0) {
                for ($i = 0; $i < $request->nfc_quantity; $i++) {
                    $qr = Card::generateCode();

                    $nfcCards[] = [
                        'company_id' => $company->id,
                        'card_code' => null,
                        'qr_code' => $qr,
                        'cards_group_id' => $group->id,
                        'status' => 'inactive',
                        'views' => 0,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];

                    $createdNfcCards[] = [
                        'qr_code' => $qr,
                        'status' => 'inactive',
                        'company' => [
                            'id' => $company->id,
                            'name' => $company->name,
                            'billing_email' => $company->billing_email,
                        ],
                        'group_id' => $group->id,
                        'views' => 0,
                        'created_at' => $now->toDateTimeString(),
                        'updated_at' => $now->toDateTimeString(),
                    ];
                }
                if (!empty($nfcCards)) {
                    foreach (array_chunk($nfcCards, $chunkSize) as $chunk) {
                        NfcCard::insert($chunk);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'group_id' => $group->id,
                'cards_created' => $request->quantity,
                'nfc_cards_created' => $request->nfc_quantity,
                'remaining_after_creation' => $remainingCards - $request->quantity,
                'remaining_nfc_after_creation' => $remainingNfc - $request->nfc_quantity,
                'createdCards' => $createdCards,
                'createdNfcCards' => $createdNfcCards,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
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
        $group = CardsGroup::with(['cards', 'nfcCards'])->findOrFail($groupId);

        // Check if any NFC card is active
        $hasActiveNfc = $group->nfcCards->where('status', 'active')->isNotEmpty();

        if ($hasActiveNfc) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete group. Some NFC cards are still active.'
            ], 400);
        }

        // Check if any normal card is associated with NFC cards
        $cardsLinkedToNfc = $group->cards->pluck('id')->intersect(
            $group->nfcCards->pluck('card_id')->filter()
        );

        if ($cardsLinkedToNfc->isNotEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete group. Some employees are linked to NFC cards.'
            ], 400);
        }

        // Safe to delete the group and all its cards
        $group->cards()->delete();
        $group->nfcCards()->delete();
        $group->delete();

        return response()->json([
            'success' => true,
            'message' => 'Group deleted successfully.'
        ]);
    }

    public function deleteCards($groupId)
    {
        $group = CardsGroup::with('cards', 'nfcCards')->findOrFail($groupId);

        // Check if any normal card is linked to NFC cards
        $cardsLinkedToNfc = $group->cards->pluck('id')->intersect(
            $group->nfcCards->pluck('card_id')->filter()
        );

        if ($cardsLinkedToNfc->isNotEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete normal cards. Some employees are linked to NFC cards.'
            ], 400);
        }

        // Safe to delete all normal cards
        $group->cards()->delete();

        return response()->json([
            'success' => true,
            'message' => 'All normal cards in this group were deleted successfully.'
        ]);
    }

    // Delete only NFC cards
    public function deleteNfcCards($groupId)
    {
        $group = CardsGroup::with('nfcCards')->findOrFail($groupId);

        // Check if any NFC card is active
        $hasActiveNfc = $group->nfcCards->where('status', 'active')->isNotEmpty();

        if ($hasActiveNfc) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete NFC cards. Some NFC cards are still active.'
            ], 400);
        }

        // Safe to delete all NFC cards
        $group->nfcCards()->delete();

        return response()->json([
            'success' => true,
            'message' => 'All NFC cards in this group were deleted successfully.'
        ]);
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
            foreach ($group->nfcCards as $index => $card) {
                $createdAt = Carbon::parse($card->created_at)->format('d.m.Y H:i');

                fputcsv($file, [
                    $index + 1,
                    $card->id,
                    $group->company->name ?? '',
                    env('LINK_URL') . '/card/' . $card->qr_code, // URL format
                    $card->qr_code,
                    $createdAt,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }


    public function companyCards(Request $request)
    {
        $user = Auth::user();

        // Determine correct company reference
        $company = $user->isCompany() ? $user->companyProfile : $user->company;

        // Define searchable columns
        $searchableColumns = [
            'code',
            'first_name',
            'last_name',
            'primary_email',
            'position',
            'department',
            'salutation',
            'title',
        ];

        // Define sortable columns
        $sortableColumns = [
            'id',
            'code',
            'first_name',
            'last_name',
            'email',
            'primary_email',
            'position',
            'department',
            'wallet_status',
            'wallet_eligibility',
            'status',
            'last_email_sent',
            'created_at',
            'updated_at',
        ];

        // Start with base query - only cards for this company
        $query = Card::query()
            ->where('company_id', $company->id);

        // Apply DataTable filters (search, sort, pagination)
        $cards = $this->applyDataTableFilters(
            $query,
            $request,
            $searchableColumns,
            $sortableColumns,
            25 // default per page
        );

        // Check if ANY job is pending/processing for this company
        $hasRunningJob = BulkWalletApiJob::where('company_id', $company->id)
            ->whereIn('status', ['pending', 'processing'])
            ->exists();

        $hasRunningEmailJob = BulkEmailJob::where('company_id', $company->id)
            ->whereIn('status', ['pending', 'processing'])
            ->exists();

        // Pass to Inertia
        return Inertia::render('Cards/Company', [
            'cards' => $cards,
            'isSubscriptionActive' => $company->owner->hasActiveSubscription(),
            'hasRunningJob' => $hasRunningJob,
            'hasRunningEmailJob' => $hasRunningEmailJob,
        ]);
    }

    public function companyCards1(Request $request)
    {
        $user = Auth::user();

        // Determine correct company reference
        $company = $user->isCompany() ? $user->companyProfile : $user->company;

        // Define searchable columns
        $searchableColumns = [
            'code',
            'first_name',
            'last_name',
            'primary_email',
            'position',
            'department',
            'salutation',
            'title',
        ];

        // Define sortable columns
        $sortableColumns = [
            'id',
            'code',
            'first_name',
            'last_name',
            'email',
            'primary_email',
            'position',
            'department',
            'wallet_status',
            'wallet_eligibility',
            'status',
            'last_email_sent',
            'created_at',
            'updated_at',
        ];

        // Start with base query - only cards for this company
        $query = Card::query()
            ->where('company_id', $company->id);

        // Apply DataTable filters (search, sort, pagination)
        $cards = $this->applyDataTableFilters(
            $query,
            $request,
            $searchableColumns,
            $sortableColumns,
            25 // default per page
        );

        // Check if ANY job is pending/processing for this company
        $hasRunningJob = BulkWalletApiJob::where('company_id', $company->id)
            ->whereIn('status', ['pending', 'processing'])
            ->exists();

        $hasRunningEmailJob = BulkEmailJob::where('company_id', $company->id)
            ->whereIn('status', ['pending', 'processing'])
            ->exists();

        // Pass to Inertia
        return Inertia::render('Cards/Company1', [
            'cards' => $cards,
            'isSubscriptionActive' => $company->owner->hasActiveSubscription(),
            'hasRunningJob' => $hasRunningJob,
            'hasRunningEmailJob' => $hasRunningEmailJob,
        ]);
    }

    public function searchEmployees(Request $request)
    {
        $user = Auth::user();
        $company = $user->isCompany() ? $user->companyProfile : $user->company;
        
        $query = $request->input('q', '');
        
        $employees = Card::where('company_id', $company->id)
            ->where(function($q) use ($query) {
                $q->where('id', 'like', "%{$query}%")
                  ->orWhere('internal_employee_number', 'like', "%{$query}%")
                  ->orWhere('first_name', 'like', "%{$query}%")
                  ->orWhere('last_name', 'like', "%{$query}%")
                  ->orWhere('primary_email', 'like', "%{$query}%")
                  ->orWhere('title', 'like', "%{$query}%");
            })
            ->select('id', 'internal_employee_number', 'first_name', 'last_name', 'profile_image')
            ->limit(50)
            ->get()
            ->map(function($employee) {
                $nameParts = array_filter([
                    $employee->first_name,
                    $employee->last_name,
                ]);
                $fullName = implode(' ', $nameParts);
                
                $internal = $employee->internal_employee_number;
                $label = $employee->id;
                
                if ($internal || $fullName) {
                    $inner = array_filter([$internal, $fullName]);
                    $label .= ' - (' . implode(' - ', $inner) . ')';
                } else {
                    $label .= ' - (Not assigned)';
                }
                
                return [
                    'value' => $employee->id,
                    'label' => $label,
                    'image' => $employee->profile_image 
                        ? '/storage/' . $employee->profile_image
                        : '/assets/images/profile-placeholder.png'
                ];
            });
        
        return response()->json($employees);
    }
    public function companyNfcCards(Request $request)
    {
        $user = Auth::user();

        // Determine the correct company reference
        $company = $user->isCompany() ? $user->companyProfile : $user->company;

        // Get all normal cards for this company
        // $normalCards = $company->cards()->get();

        // Define searchable columns
        $searchableColumns = [
            'qr_code',
            'status',
            'card.first_name',
            'card.last_name',
            'card.position',
            'card.department',
        ];

        // Define sortable columns
        $sortableColumns = [
            'id',
            'qr_code',
            'status',
            'created_at',
            'updated_at',
        ];

        // Start with base query - only NFC cards for this company
        $query = NfcCard::query()
            ->where('company_id', $company->id)
            ->with('card');

        // Apply DataTable filters (search, sort, pagination)
        $nfcCards = $this->applyDataTableFilters(
            $query,
            $request,
            $searchableColumns,
            $sortableColumns,
            25 // default per page
        );

        // Pass to Inertia
        return Inertia::render('Cards/Nfc', [
            'employeeCards' => [],   // all company cards
            'nfcCards' => $nfcCards,         // NFC cards with pagination
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

    public function toggleNfcStatus(Request $request, NfcCard $nfcCard)
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

        $nfcCard->status = $request->status;
        $nfcCard->save();

        return response()->json([
            'success' => true,
            'message' => 'Card status updated successfully.',
            'card' => $nfcCard,
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

    public function toggleMultipleNfcStatus(Request $request)
    {
        $user = Auth::user();

        // ✅ Validate input
        $data = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:nfc_cards,id',
            'status' => 'required|in:active,inactive',
        ]);

        // ✅ Normalize company id for any user type
        $companyId = $user->isCompany()
            ? $user->companyProfile->id   // if user is a company
            : $user->company_id;           // if user belongs to a company

        // ✅ Fetch cards belonging to this company
        $cardsQuery = NfcCard::whereIn('id', $data['ids'])
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

    public function assignToEmployee(Request $request)
    {
        $user = Auth::user();

        // ✅ Validate input
        $data = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:nfc_cards,id',
            'employee' => 'required|integer|exists:cards,id',
        ]);

        // ✅ Determine company
        $companyId = $user->isCompany()
            ? $user->companyProfile->id
            : $user->company_id;

        // ✅ Additional security for editors
        if (!$user->isCompany() && !in_array($user->role, ['editor', 'template_editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action.',
            ], 403);
        }

        // ✅ Check that all NFC cards belong to this company
        $nfcCards = NfcCard::whereIn('id', $data['ids'])
            ->where('company_id', $companyId)
            ->get();

        if ($nfcCards->count() !== count($data['ids'])) {
            return response()->json([
                'success' => false,
                'message' => 'Some NFC cards do not belong to your company.',
            ], 403);
        }

        // ✅ Check that selected employee belongs to the same company
        $employee = Card::where('id', $data['employee'])
            ->where('company_id', $companyId)
            ->first();

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Selected employee does not belong to your company.',
            ], 403);
        }

        // ✅ Assign NFC cards to employee
        foreach ($nfcCards as $nfc) {
            $nfc->card_code = $employee->code;
            $nfc->save();
        }

        return response()->json([
            'success' => true,
            'message' => "{$nfcCards->count()} NFC card(s) assigned to employee successfully.",
        ]);
    }

    public function unassignFromEmployee(Request $request)
    {
        $user = Auth::user();

        // ✅ Validate input
        $data = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:nfc_cards,id',
        ]);

        // ✅ Determine company
        $companyId = $user->isCompany()
            ? $user->companyProfile->id
            : $user->company_id;

        // ✅ Additional security for editors
        if (!$user->isCompany() && !in_array($user->role, ['editor', 'template_editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action.',
            ], 403);
        }

        // ✅ Fetch NFC cards belonging to this company
        $nfcCards = NfcCard::whereIn('id', $data['ids'])
            ->where('company_id', $companyId)
            ->get();

        if ($nfcCards->count() !== count($data['ids'])) {
            return response()->json([
                'success' => false,
                'message' => 'Some NFC cards do not belong to your company.',
            ], 403);
        }

        // ✅ Unassign NFC cards (clear card_id)
        foreach ($nfcCards as $nfc) {
            $nfc->card_code = null;
            $nfc->save();
        }

        return response()->json([
            'success' => true,
            'message' => "{$nfcCards->count()} NFC card(s) unassigned successfully.",
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
            'primary_email' => 'primary_email',
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
