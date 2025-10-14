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
        $companies = Company::get();
        $cardsGroups = CardsGroup::with(['company', 'cards'])
            ->withCount('cards') // ✅ adds cards_count attribute
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
            // Fetch company details
            $company = Company::findOrFail($request->company_id);

            // Create a new group
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
                    'status' => 'inactive', // default status
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
                $cards[] = $cardData;

                // Add full card info to return array
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
                'createdCards' => $createdCards, // full objects for preview
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

        // Ensure user has a company
        if (!$user->company) {
            abort(403, 'You do not belong to any company.');
        }

        // Get all cards for this company
        $cards = Card::where('company_id', $user->company->id)->get();

        // Pass to Inertia
        return Inertia::render('Cards/Company', [
            'cards' => $cards,
            'isSubscriptionActive' => $user->hasActiveSubscription(),
        ]);
    }

    public function toggleStatus(Request $request, Card $card)
    {
        $user =Auth::user();

        // Ensure the card belongs to the logged-in user's company
        if ($card->company_id !== $user->company_id) {
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
