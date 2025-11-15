<?php

namespace App\Http\Controllers;

use Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApiController extends Controller
{
    /**
     * Show the API documentation page for companies.
     */
    public function index()
    {
        $user = Auth::user();

        if (
            !$user->isCompany()
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this page.',
            ], 403);
        }
        $companyRef = $user->isCompany() ? $user->companyProfile : $user->company;

        return Inertia::render('Api/Index', [
            'apiKey' => $companyRef->api_key
        ]);
    }

    /**
     * Show the full-page API documentation.
     */
    public function full()
    {
        return Inertia::render('Api/Docs');
    }

    public function regenerate(Request $request)
    {
        $company = $request->user()->company ?? $request->user()->companyProfile;

        if (!$company) {
            return response()->json(['message' => 'No company found for this user.'], 404);
        }

        $company->generateApiKey();

        return response()->json(['api_key' => $company->api_key]);
    }
}
