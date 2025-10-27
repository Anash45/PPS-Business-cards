<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Validator;

class CompanyController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // ✅ Fetch company details for logged-in user
        $company = $user->isCompany()
            ? $user->companyProfile // or company if relationship name differs
            : ($user->company ?? null);

        // ✅ Fetch all available plans
        $plans = Plan::where('active', true)
            ->orderBy('cards_included', 'asc')
            ->get();

        // ✅ Fetch user's active subscription with plan
        $subscription = Subscription::with('plan')
            ->where('user_id', $user->id)
            ->latest()
            ->first();

        return Inertia::render('Settings/Index', [
            'company' => $company,
            'plans' => $plans,
            'subscription' => $subscription,
        ]);
    }

    public function update(Request $request)
    {
        $user = auth()->user();
        $company = $user->company;

        if (!$company) {
            return response()->json([
                'success' => false,
                'message' => 'No company record found for this user.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'billing_email' => ['nullable', 'email', 'max:255'],
            'street_address' => ['nullable', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:50'],
            'city' => ['nullable', 'string', 'max:255'],
            'country' => ['nullable', 'string', 'max:255'],
            'vat_id' => ['nullable', 'string', 'max:100'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors occurred.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $company->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Company details updated successfully.',
            'company' => $company->fresh(),
        ]);
    }



}
