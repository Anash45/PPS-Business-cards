<?php

/**
 * EXAMPLE: Converting existing CardsController methods to use server-side DataTable
 * 
 * This file shows how to update the companyCards1() method in CardsController.php
 * to use the DataTableTrait for better performance with large datasets.
 */

namespace App\Http\Controllers;

use App\Models\BulkEmailJob;
use App\Models\BulkWalletApiJob;
use App\Models\Card;
use App\Traits\DataTableTrait; // ✅ Add this
use Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CardsControllerExample extends Controller
{
    use DataTableTrait; // ✅ Add this trait

    /**
     * BEFORE: Loading all cards at once (slow with many records)
     * 
     * public function companyCards1()
     * {
     *     $user = Auth::user();
     *     $company = $user->isCompany() ? $user->companyProfile : $user->company;
     *     
     *     // ❌ Problem: Loading ALL cards
     *     $cards = Card::where('company_id', $company->id)->get();
     *     
     *     return Inertia::render('Cards/Company1', ['cards' => $cards]);
     * }
     */

    /**
     * ✅ AFTER: Using server-side processing (fast with any number of records)
     */
    public function companyCards1(Request $request)
    {
        $user = Auth::user();

        // Determine correct company reference
        $company = $user->isCompany() ? $user->companyProfile : $user->company;

        // Define which columns can be searched
        $searchableColumns = [
            'code',
            'first_name',
            'last_name',
            'email',
            'primary_email',
            'position',
            'department',
            'salutation',
            'title',
        ];

        // Define which columns can be sorted
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
            'created_at',
            'updated_at',
        ];

        // Start with base query - ONLY cards for this company
        $query = Card::query()
            ->with(['company']) // Eager load relationships to avoid N+1
            ->where('company_id', $company->id);

        // ✅ Apply DataTable filters (search, sort, pagination)
        // This handles: search, sorting, and pagination automatically
        $cards = $this->applyDataTableFilters(
            $query,
            $request,
            $searchableColumns,
            $sortableColumns,
            25 // default 25 cards per page (was 10, you can adjust)
        );

        // Check if ANY job is pending/processing for this company
        $hasRunningJob = BulkWalletApiJob::where('company_id', $company->id)
            ->whereIn('status', ['pending', 'processing'])
            ->exists();

        $hasRunningEmailJob = BulkEmailJob::where('company_id', $company->id)
            ->whereIn('status', ['pending', 'processing'])
            ->exists();

        // Pass to Inertia with pagination data
        return Inertia::render('Cards/Company1', [
            'cards' => $cards, // Now paginated: { data: [], total, per_page, current_page, last_page }
            'isSubscriptionActive' => $company->owner->hasActiveSubscription(),
            'hasRunningJob' => $hasRunningJob,
            'hasRunningEmailJob' => $hasRunningEmailJob,
        ]);
    }

    /**
     * ALTERNATIVE: If you want separate endpoint for AJAX requests
     * This is useful if you want to keep the original page load simple
     * and fetch table data via AJAX
     */
    public function getCompanyCardsData(Request $request)
    {
        $user = Auth::user();
        $company = $user->isCompany() ? $user->companyProfile : $user->company;

        $searchableColumns = [
            'code',
            'first_name',
            'last_name',
            'email',
            'primary_email',
        ];

        $sortableColumns = [
            'id',
            'code',
            'first_name',
            'wallet_status',
            'created_at',
        ];

        $query = Card::query()
            ->with(['company'])
            ->where('company_id', $company->id);

        // Apply filters
        $cards = $this->applyDataTableFilters(
            $query,
            $request,
            $searchableColumns,
            $sortableColumns,
            25
        );

        // Return ONLY the cards data (for use with endpoint prop in CustomDataTable)
        return Inertia::render('Cards/Company1', [
            'cards' => $cards,
        ]);
    }

    /**
     * EXAMPLE: With additional custom filters
     * 
     * You can add custom filters before applying DataTable filters
     */
    public function companyCards1WithFilters(Request $request)
    {
        $user = Auth::user();
        $company = $user->isCompany() ? $user->companyProfile : $user->company;

        $query = Card::query()
            ->with(['company'])
            ->where('company_id', $company->id);

        // ✅ Apply custom filters BEFORE DataTable filters
        if ($request->filled('wallet_status')) {
            $query->where('wallet_status', $request->wallet_status);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Then apply DataTable filters
        $cards = $this->applyDataTableFilters(
            $query,
            $request,
            ['code', 'first_name', 'last_name', 'email'],
            ['id', 'code', 'wallet_status', 'created_at'],
            25
        );

        $hasRunningJob = BulkWalletApiJob::where('company_id', $company->id)
            ->whereIn('status', ['pending', 'processing'])
            ->exists();

        $hasRunningEmailJob = BulkEmailJob::where('company_id', $company->id)
            ->whereIn('status', ['pending', 'processing'])
            ->exists();

        return Inertia::render('Cards/Company1', [
            'cards' => $cards,
            'isSubscriptionActive' => $company->owner->hasActiveSubscription(),
            'hasRunningJob' => $hasRunningJob,
            'hasRunningEmailJob' => $hasRunningEmailJob,
            // Pass available filter options
            'filters' => [
                'wallet_statuses' => ['not_added', 'pending', 'added', 'failed'],
                'statuses' => ['active', 'inactive'],
            ],
        ]);
    }
}

/**
 * ROUTES SETUP
 * 
 * Add to routes/web.php:
 * 
 * Route::get('/company/cards', [CardsController::class, 'companyCards1'])
 *     ->name('company.cards.index');
 * 
 * // Optional: If using separate endpoint
 * Route::get('/company/cards/data', [CardsController::class, 'getCompanyCardsData'])
 *     ->name('company.cards.data');
 */
