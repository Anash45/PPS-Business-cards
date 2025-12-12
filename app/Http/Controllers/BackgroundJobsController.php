<?php

namespace App\Http\Controllers;

use App\Models\BulkWalletApiJob;
use App\Models\BulkEmailJob;
use App\Traits\DataTableTrait;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BackgroundJobsController extends Controller
{
    use DataTableTrait;

    public function index(Request $request)
    {
        $user = auth()->user();

        // Determine company ID based on user role
        $companyId = $user->isCompany()
            ? $user->companyProfile->id
            : ($user->company_id ?? null);

        // Define searchable columns for wallet jobs
        $walletSearchableColumns = [
            'status',
            'created_at',
        ];

        // Define sortable columns for wallet jobs
        $walletSortableColumns = [
            'id',
            'status',
            'total_cards',
            'processed_cards',
            'failed_cards',
            'created_at',
            'updated_at',
        ];

        // Fetch wallet sync jobs with pagination
        $walletQuery = BulkWalletApiJob::where('company_id', $companyId);
        $walletJobs = $this->applyDataTableFilters(
            $walletQuery,
            $request,
            $walletSearchableColumns,
            $walletSortableColumns,
            10 // default per page
        );

        // Define searchable columns for email jobs
        $emailSearchableColumns = [
            'status',
            'created_at',
        ];

        // Define sortable columns for email jobs
        $emailSortableColumns = [
            'id',
            'status',
            'total_cards',
            'processed_cards',
            'failed_cards',
            'created_at',
            'updated_at',
        ];

        // Fetch email sending jobs with pagination
        $emailQuery = BulkEmailJob::where('company_id', $companyId);
        $emailJobs = $this->applyDataTableFilters(
            $emailQuery,
            $request,
            $emailSearchableColumns,
            $emailSortableColumns,
            10 // default per page
        );

        return Inertia::render('BackgroundJobs/Index', [
            'walletJobs' => $walletJobs,
            'emailJobs' => $emailJobs,
        ]);
    }
}
