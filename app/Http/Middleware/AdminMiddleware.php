<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Ensure user exists and is admin
        if (!$user || !$user->isAdmin()) {
            abort(403, 'Unauthorized: Admin access only.');
        }

        return $next($request);
    }
}
