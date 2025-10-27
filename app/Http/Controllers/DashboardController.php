<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Traits\LoadsCompanyDesignData;
use Auth;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Card;
use App\Models\CardView;

class DashboardController extends Controller
{
    use LoadsCompanyDesignData;
    public function index(Request $request)
    {
        $user = Auth::user();

        // --------------------------------
        // ✅ ROLE-BASED REDIRECTS
        // --------------------------------
        if ($user->isEditor()) {
            return redirect()->route('company.cards');
        } elseif (!($user->isAdmin() || $user->isCompany())) {
            return redirect()->route('profile.edit');
        }

        $company = null; // Default (for Admin)

        // --------------------------------
        // ✅ ADMIN DASHBOARD
        // --------------------------------
        if ($user->isAdmin()) {
            $data = [
                'total_cards' => Card::count(),
                'active_cards' => Card::where('status', 'active')->count(),
                'inactive_cards' => Card::where('status', 'inactive')->count(),
                'total_views' => CardView::count(),
                'total_downloads' => Card::sum('downloads'),
            ];
        }

        // --------------------------------
        // ✅ COMPANY DASHBOARD
        // --------------------------------
        elseif ($user->isCompany()) {
            // Get full company data using shared trait
            $company = $this->getCompanyWithDesignData($user);

            if (!$company) {
                return response()->json(['message' => 'No company associated with this user'], 404);
            }

            $cards = $company->cards ?? collect();
            $cardIds = $cards->pluck('id');

            $data = [
                'total_cards' => $cards->count(),
                'active_cards' => $cards->where('status', 'active')->count(),
                'inactive_cards' => $cards->where('status', 'inactive')->count(),
                'total_views' => CardView::whereIn('card_id', $cardIds)->count(),
                'total_downloads' => Card::whereIn('id', $cardIds)->sum('downloads'),
            ];
        }

        // --------------------------------
        // ✅ RETURN DASHBOARD VIEW
        // --------------------------------
        return inertia('Dashboard', [
            'dashboardStats' => $data,
            'company' => $company, // Admin → null, Company → full data
        ]);
    }
    public function getViewsData(Request $request)
    {
        $user = Auth::user();

        // Duration handling
        $duration = $request->get('duration', '7_days');
        $days = match ($duration) {
            '30_days' => 30,
            '90_days' => 90,
            default => 7,
        };

        $startDate = Carbon::now()->subDays($days - 1)->startOfDay();
        $endDate = Carbon::now()->endOfDay();

        // Determine card IDs based on user type
        if ($user->isAdmin()) {
            $cardIds = Card::pluck('id');
        } elseif ($user->isCompany()) {
            $cardIds = $user->company->cards()->pluck('id');
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Fetch grouped view counts per day
        $views = CardView::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as views')
        )
            ->whereIn('card_id', $cardIds)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date', 'asc')
            ->get();

        // Fill missing dates (so chart shows smooth lines)
        $dateRange = collect();
        for ($i = 0; $i < $days; $i++) {
            $dateRange->push($startDate->copy()->addDays($i)->format('Y-m-d'));
        }

        $data = $dateRange->map(function ($date) use ($views) {
            $record = $views->firstWhere('date', $date);
            return [
                'date' => $date,
                'views' => $record ? (int) $record->views : 0,
            ];
        });

        return response()->json($data);
    }

    public function getTopCardsByViews(Request $request)
    {
        $user = Auth::user();
        $duration = $request->input('duration', '7_days');

        // Determine range (default: 7 days)
        $days = match ($duration) {
            '30_days' => 30,
            '90_days' => 90,
            default => 7,
        };

        $startDate = now()->subDays($days);

        // Step 1: Get top 10 card IDs by views count
        $viewsQuery = CardView::select('card_id', DB::raw('COUNT(*) as total_views'))
            ->where('created_at', '>=', $startDate)
            ->groupBy('card_id')
            ->orderByDesc('total_views');

        if ($user->isCompany()) {
            $viewsQuery->whereHas('card', function ($q) use ($user) {
                $q->where('company_id', $user->company_id);
            });
        }

        $topViews = $viewsQuery->limit(10)->get();

        // Step 2: Extract IDs
        $cardIds = $topViews->pluck('card_id');

        // Step 3: Fetch card details (with company if admin)
        $cardsQuery = Card::whereIn('id', $cardIds)
            ->with(['company:id,name']); // add other relations if needed

        if ($user->isCompany()) {
            $cardsQuery->where('company_id', $user->company_id);
        }

        $cards = $cardsQuery->get();

        // Step 4: Merge views count into cards
        $cardsWithViews = $cards->map(function ($card) use ($topViews) {
            $views = $topViews->firstWhere('card_id', $card->id)?->total_views ?? 0;
            $card->total_views = $views;
            return $card;
        })->sortByDesc('total_views')->values();

        return response()->json([
            'success' => true,
            'data' => $cardsWithViews,
        ]);
    }

}