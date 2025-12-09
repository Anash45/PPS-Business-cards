<?php

namespace App\Http\Controllers;

use App\Models\BulkWalletApiJob;
use App\Models\BulkEmailJob;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BackgroundJobsController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Determine company ID based on user role
        $companyId = $user->isCompany()
            ? $user->companyProfile->id
            : ($user->company_id ?? null);

        // Fetch wallet sync jobs
        $walletJobs = BulkWalletApiJob::where('company_id', $companyId)
            ->orderBy('created_at', 'desc')
            ->get();

        // Fetch email sending jobs
        $emailJobs = BulkEmailJob::where('company_id', $companyId)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('BackgroundJobs/Index', [
            'walletJobs' => $walletJobs,
            'emailJobs' => $emailJobs,
        ]);
    }
}
