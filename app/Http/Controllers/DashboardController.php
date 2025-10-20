<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Auth;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Card;
use App\Models\CardView;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        if ($user->isAdmin()) {
            // Admin dashboard stats
            $data = [
                'total_users' => User::count(),
                'total_admins' => User::where('role', 'admin')->count(),
                'total_editors' => User::where('role', 'editor')->count(),
                'total_companies' => User::where('role', 'company')->count(),
                'total_cards' => Card::count(),
            ];
        } elseif ($user->isCompany()) {
            $company = $user->company;

            // Company dashboard stats
            $cards = $company->cards;
            $cardIds = $cards->pluck('id');

            $data = [
                'total_cards' => $cards->count(),
                'active_cards' => $cards->where('is_active', true)->count(),
                'inactive_cards' => $cards->where('is_active', false)->count(),
                'total_views' => CardView::whereIn('card_id', $cardIds)->count(),
                'unique_views' => CardView::whereIn('card_id', $cardIds)
                    ->distinct('ip_address')
                    ->count('ip_address'),
            ];
        } else {
            $data = [];
        }

        // Example: duration = "7_days", "30_days", "90_days"
        $days = match ($request->duration ?? '7_days') {
            '7_days' => 7,
            '30_days' => 30,
            '90_days' => 90,
            default => 7,
        };

        $startDate = Carbon::now()->subDays($days);

        // For company user
        if ($user->isCompany()) {
            $cards = $user->company->cards;
            $cardIds = $cards->pluck('id');

            $views = CardView::whereIn('card_id', $cardIds)
                ->where('created_at', '>=', $startDate)
                ->get()
                ->groupBy(fn($view) => $view->created_at->format('Y-m-d'));

            $chartData = [];
            foreach ($views as $date => $dayViews) {
                $chartData[] = [
                    'date' => $date,
                    'totalViews' => count($dayViews),
                    'uniqueViews' => count(collect($dayViews)->unique('ip_address')),
                ];
            }
        }

        // For admin user: aggregate all companies
        if ($user->isAdmin()) {
            $companies = Company::with('cards.views')->get();
            $chartData = [];

            foreach ($companies as $company) {
                $cards = $company->cards;
                $cardIds = $cards->pluck('id');

                $cardViews = CardView::where('created_at', '>=', $startDate)
                    ->whereIn('card_id', Card::pluck('id'))
                    ->get()
                    ->groupBy(fn($view) => $view->card->company_id ?? 0);

                $chartData = Company::get()->map(function ($company) use ($cardViews) {
                    $views = $cardViews[$company->id] ?? collect();
                    return [
                        'company' => $company->name,
                        'totalViews' => $views->count(),
                        'uniqueViews' => $views->unique('ip_address')->count(),
                    ];
                })->toArray();
            }
        }

        return inertia('Dashboard', [
            'dashboardStats' => $data,
            'chartData' => $chartData
        ]);
    }

}