<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\CompanyApiToken;
use Carbon\Carbon;

class CheckCompanyApiToken
{
    public function handle($request, Closure $next)
    {
        $authHeader = $request->header('Authorization');

        // Check for Bearer token
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $token = substr($authHeader, 7);

        $tokenRecord = CompanyApiToken::where('token', $token)->first();
        if (!$tokenRecord) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $company = $tokenRecord->company;

        if (!$company) {
            return response()->json(['success' => false, 'message' => 'Company not found'], 404);
        }

        // Check if company's owner has an active subscription
        $subscription = $company->owner?->subscription;

        if (!$subscription || !$subscription->is_valid) {
            return response()->json([
                'success' => false,
                'message' => 'Company subscription is inactive or expired'
            ], 403);
        }

        // Attach company to request for controllers
        $request->merge(['company' => $company]);

        return $next($request);
    }
}
