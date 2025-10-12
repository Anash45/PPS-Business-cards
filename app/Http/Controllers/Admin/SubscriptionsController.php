<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;

use App\Models\Subscription;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;

class SubscriptionsController extends Controller
{
    public function createOrUpdate(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'plan_id' => 'required|exists:plans,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_active' => 'required|boolean',
        ]);

        // Ensure the user exists
        $user = User::find($validated['user_id']);

        if (!$user || !$user->isCompany()) {
            return response()->json([
                'message' => 'User not found or is not a company.',
            ], 404);
        }

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'The selected user is not a company account.',
            ], 422);
        }

        // Ensure the plan exists and is active
        $plan = Plan::where('id', $validated['plan_id'])
            ->where('active', 1)
            ->first();

        if (!$plan) {
            return response()->json([
                'success' => false,
                'message' => 'The selected plan is not active or does not exist.',
            ], 422);
        }

        // Either update or create a new subscription for the company
        $subscription = Subscription::updateOrCreate(
            ['user_id' => $validated['user_id']],
            [
                'plan_id' => $validated['plan_id'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'is_active' => $validated['is_active'],
                'assigned_by_admin' => true,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => $subscription->wasRecentlyCreated
                ? 'Subscription created successfully!'
                : 'Subscription updated successfully!',
            'data' => $subscription,
        ]);
    }

}
