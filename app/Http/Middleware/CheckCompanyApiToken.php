<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\CompanyApiToken;

class CheckCompanyApiToken
{
    public function handle($request, Closure $next)
    {
        $authHeader = $request->header('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $token = substr($authHeader, 7);

        $tokenRecord = CompanyApiToken::where('token', $token)->first();
        if (!$tokenRecord) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Optional: attach company to request for easier use
        $request->merge(['company' => $tokenRecord->company]);

        return $next($request);
    }
}
