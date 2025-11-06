<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // ✅ Check if user's role matches one of allowed roles
        if (!in_array($user->role, $roles)) {
            return abort(403, 'Unauthorized access.');
        }

        return $next($request);
    }
}
