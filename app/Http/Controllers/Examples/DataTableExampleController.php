<?php

namespace App\Http\Controllers\Examples;

use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\User;
use App\Traits\DataTableTrait;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DataTableExampleController extends Controller
{
    use DataTableTrait;

    /**
     * Display a listing of cards with server-side processing
     *
     * @param Request $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // Define which columns can be searched
        $searchableColumns = [
            'code',
            'first_name',
            'last_name',
            'email',
            'company.name', // Search in related company name
        ];

        // Define which columns can be sorted
        $sortableColumns = [
            'id',
            'code',
            'first_name',
            'last_name',
            'email',
            'wallet_status',
            'created_at',
            'updated_at',
        ];

        // Start with base query
        $query = Card::query()
            ->with(['company']) // Eager load relationships
            ->where('user_id', auth()->id()); // Only get current user's cards

        // Apply DataTable filters (search, sort, pagination)
        $cards = $this->applyDataTableFilters(
            $query,
            $request,
            $searchableColumns,
            $sortableColumns,
            10 // default per page
        );

        // You can also get users data for the second table
        $usersQuery = User::query();
        $users = $this->applyDataTableFilters(
            $usersQuery,
            $request,
            ['name', 'email'],
            ['id', 'name', 'email', 'created_at'],
            10
        );

        return Inertia::render('Examples/CustomDataTableExample', [
            'cards' => $cards,
            'users' => $users,
        ]);
    }

    /**
     * Alternative: Separate endpoint for each table (recommended for multiple tables)
     */
    public function getCards(Request $request)
    {
        $searchableColumns = [
            'code',
            'first_name',
            'last_name',
            'email',
            'company.name',
        ];

        $sortableColumns = [
            'id',
            'code',
            'first_name',
            'last_name',
            'email',
            'wallet_status',
            'created_at',
        ];

        $query = Card::query()
            ->with(['company'])
            ->where('user_id', auth()->id());

        $cards = $this->applyDataTableFilters(
            $query,
            $request,
            $searchableColumns,
            $sortableColumns,
            10
        );

        // For Inertia, return only the cards key
        return Inertia::render('Examples/CustomDataTableExample', [
            'cards' => $cards,
        ]);
    }

    /**
     * API endpoint example (returns JSON)
     */
    public function apiCards(Request $request)
    {
        $searchableColumns = [
            'code',
            'first_name',
            'last_name',
            'email',
        ];

        $sortableColumns = [
            'id',
            'code',
            'first_name',
            'last_name',
            'wallet_status',
            'created_at',
        ];

        $query = Card::query()->where('user_id', auth()->id());

        // Use dataTableResponse for JSON API endpoints
        return $this->dataTableResponse(
            $query,
            $request,
            $searchableColumns,
            $sortableColumns,
            10
        );
    }

    /**
     * Example with additional filters
     */
    public function filteredCards(Request $request)
    {
        $query = Card::query()
            ->with(['company'])
            ->where('user_id', auth()->id());

        // Apply additional filters before DataTable filters
        if ($request->has('wallet_status') && !empty($request->wallet_status)) {
            $query->where('wallet_status', $request->wallet_status);
        }

        if ($request->has('company_id') && !empty($request->company_id)) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->has('date_from') && !empty($request->date_from)) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && !empty($request->date_to)) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $cards = $this->applyDataTableFilters(
            $query,
            $request,
            ['code', 'first_name', 'last_name', 'email'],
            ['id', 'code', 'first_name', 'wallet_status', 'created_at'],
            25
        );

        return Inertia::render('Examples/CustomDataTableExample', [
            'cards' => $cards,
        ]);
    }
}
