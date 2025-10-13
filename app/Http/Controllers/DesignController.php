<?php

namespace App\Http\Controllers;

use App\Models\CompanyCardTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class DesignController extends Controller
{
    /**
     * Display the current company design template.
     */
    public function index()
    {
        $user = Auth::user();

        // Ensure user is a company
        if (!$user->isCompany()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $template = CompanyCardTemplate::where('company_id', $user->company->id)->first();
        
        return inertia('Design/Index', [
            'pageType' => "template",
            'templateData' => $template,
            'isSubscriptionActive' => $user->hasActiveSubscription(),
        ]);
    }
}
