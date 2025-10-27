<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CompanyOrTemplateEditor
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = auth()->user();

        if ($user && in_array($user->role, ['template_editor', 'company'])) {
            return $next($request);
        }

        return response()->json(['message' => 'Unauthorized'], 403);
    }
}
