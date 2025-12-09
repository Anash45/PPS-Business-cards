<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BulkWalletApiJob;
use App\Models\BulkEmailJob;
use Illuminate\Http\Request;

class JobStatusController extends Controller
{
    /**
     * Check if there are any running wallet sync jobs for the current user's company
     */
    public function walletJobStatus()
    {
        $user = auth()->user();
        
        $companyId = $user->isCompany()
            ? $user->companyProfile->id
            : ($user->company_id ?? null);

        if (!$companyId) {
            return response()->json(['hasRunningJob' => false]);
        }

        $hasRunningJob = BulkWalletApiJob::where('company_id', $companyId)
            ->whereIn('status', ['pending', 'processing'])
            ->exists();

        return response()->json(['hasRunningJob' => $hasRunningJob]);
    }

    /**
     * Check if there are any running email sending jobs for the current user's company
     */
    public function emailJobStatus()
    {
        $user = auth()->user();
        
        $companyId = $user->isCompany()
            ? $user->companyProfile->id
            : ($user->company_id ?? null);

        if (!$companyId) {
            return response()->json(['hasRunningJob' => false]);
        }

        $hasRunningJob = BulkEmailJob::where('company_id', $companyId)
            ->whereIn('status', ['pending', 'processing'])
            ->exists();

        return response()->json(['hasRunningJob' => $hasRunningJob]);
    }
}
