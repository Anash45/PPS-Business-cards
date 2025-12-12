<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Hotel;
use App\Models\Plan;
use App\Models\User;
use App\Traits\DataTableTrait;
use Auth;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Log;

class UserController extends Controller
{
    use DataTableTrait;
    public function index(Request $request)
    {
        $user = auth()->user();

        // Base query with eager loading
        $query = User::with(['company', 'subscription']);

        $companies = null;

        // 🔹 If logged in user is a company, only show its team members and editors (not himself)
        if ($user->isCompany() || in_array($user->role, ['editor', 'template_editor'])) {
            $company = $user->isCompany() ? $user->companyProfile : $user->company;

            if ($company) {
                $teamMemberIds = $company->teamMembers()->pluck('id')->toArray();

                // ✅ Exclude the company owner (himself) explicitly
                $query->whereIn('id', $teamMemberIds);
            } else {
                // No company profile means no members
                $query->whereNull('id'); // return empty result
            }
        }
        // 🔹 Admin can see everyone (no restrictions)
        elseif (!$user->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        // Define searchable and sortable columns for DataTable
        $searchableColumns = ['name', 'email', 'role', 'company.name'];
        $sortableColumns = ['id', 'company.name', 'name', 'email', 'role', 'created_at'];

        // Apply DataTable filters (search, sort, pagination)
        $users = $this->applyDataTableFilters(
            $query,
            $request,
            $searchableColumns,
            $sortableColumns,
            25 // default per page
        );

        $plans = Plan::get();
        $companies = Company::get();

        return inertia('Users/Index', [
            'users' => $users,
            'plans' => $plans,
            'companies' => $companies,
        ]);
    }



    public function create()
    {
        return inertia('Users/Create');
    }

    public function store(Request $request)
    {
        $authUser = auth()->user();

        // 🔹 Base validation rules
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'role' => 'required|in:admin,company,editor,template_editor,team',
        ];

        // 🔹 Company creation requires company_name
        if ($request->role === 'company') {
            $rules['company_name'] = 'required|string|max:255';
        }

        // 🔹 Team/editor/template_editor require company_id — only for admins
        if (in_array($request->role, ['team', 'editor', 'template_editor']) && $authUser->isAdmin()) {
            $rules['company_id'] = 'required|exists:companies,id';
        }

        $validated = $request->validate($rules);

        // 🔹 Restrict company users to only create editor/template_editor/team
        if ($authUser->isCompany()) {
            if (!in_array($validated['role'], ['editor', 'template_editor', 'team'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are only allowed to create editors, template editors, or team members.',
                ], 403);
            }

            // Automatically assign this new user to the current company
            $validated['company_id'] = $authUser->company?->id;

            if (!$validated['company_id']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your company profile is missing. Contact support.',
                ], 400);
            }
        }

        DB::beginTransaction();

        try {
            $companyId = null;

            // ✅ If creating a new company user (admin only)
            if ($validated['role'] === 'company') {
                $company = Company::create([
                    'name' => $validated['company_name'],
                    'user_id' => null,
                ]);
                $companyId = $company->id;
            }

            // ✅ Create user
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
                'company_id' => in_array($validated['role'], ['team', 'editor', 'template_editor'])
                    ? $validated['company_id']
                    : $companyId,
                'created_by' => $authUser->id,
                'status' => true,
            ]);

            // ✅ If new company, link the user as owner
            if ($validated['role'] === 'company' && isset($company)) {
                $company->update(['user_id' => $user->id]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'User created successfully.',
                'user' => $user,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create user: ' . $e->getMessage(),
            ], 500);
        }
    }






    public function edit(User $user)
    {
        $user->load('company'); // eager-load the related company

        return inertia('Users/Edit', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|min:8|confirmed',
            'role' => 'required|in:admin,company,editor,template_editor,team',
        ];

        // 🔹 Role-specific validations
        if ($request->role === 'company') {
            $rules['company_name'] = 'required|string|max:255';
        }

        if (in_array($request->role, ['team', 'editor', 'template_editor'])) {
            $rules['company_id'] = 'required|exists:companies,id';
        }

        $validated = $request->validate($rules);

        DB::beginTransaction();

        try {
            $companyId = $user->company_id;

            // ✅ If converting to a company user and company doesn’t exist yet
            if ($validated['role'] === 'company') {
                if ($user->companyProfile) {
                    // Update existing company
                    $user->companyProfile()->update([
                        'name' => $validated['company_name'],
                    ]);
                    $companyId = $user->companyProfile->id;
                } else {
                    // Create new company record
                    $company = Company::create([
                        'name' => $validated['company_name'],
                        'user_id' => $user->id,
                    ]);
                    $companyId = $company->id;
                }
            }

            // ✅ Update user
            $user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'role' => $validated['role'],
                'company_id' => in_array($validated['role'], ['team', 'editor', 'template_editor'])
                    ? $validated['company_id']
                    : ($validated['role'] === 'company' ? $companyId : null),
            ]);

            // ✅ Update password only if provided
            if (!empty($validated['password'])) {
                $user->update([
                    'password' => Hash::make($validated['password']),
                ]);
            }

            // ✅ Ensure company linkage for company role
            if ($validated['role'] === 'company' && isset($company)) {
                $company->update(['user_id' => $user->id]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully.',
                'user' => $user,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to update user: ' . $e->getMessage(),
            ], 500);
        }
    }






    public function destroy(User $user)
    {
        // ✅ Prevent deleting self
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account.',
            ], 403);
        }

        // ✅ Prevent deleting company owner
        if ($user->companyProfile !== null) {
            return response()->json([
                'success' => false,
                'message' => 'Company owner accounts cannot be deleted.',
            ], 403);
        }

        try {
            $user->delete(); // Soft delete

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user: ' . $e->getMessage(),
            ], 500);
        }
    }


    public function impersonate(User $user)
    {
        if (!auth()->user()->isAdmin()) {
            Log::warning('Unauthorized impersonation attempt', [
                'admin_id' => auth()->id(),
                'target_user_id' => $user->id,
            ]);

            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $admin = auth()->user();
        Log::info('Admin is attempting to impersonate user', [
            'admin_id' => $admin->id,
            'target_user_id' => $user->id,
        ]);

        // Attempt to update the user first
        $updated = $user->update([
            'is_impersonated' => true,
            'impersonated_by' => $admin->id,
        ]);

        Log::info('User update attempt result', [
            'user_id' => $user->id,
            'updated' => $updated,
            'is_impersonated' => $user->is_impersonated,
            'impersonated_by' => $user->impersonated_by,
        ]);

        if (!$updated) {
            Log::error('Failed to start impersonation', [
                'user_id' => $user->id,
                'admin_id' => $admin->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to start impersonation. Try again.',
            ], 500);
        }

        // // Only login if update succeeded
        session(['impersonated_by' => $admin->id]);
        Auth::login($user);

        Log::info('Impersonation ready to start', [
            'user_id' => $user->id,
            'admin_id' => $admin->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => "You are now impersonating {$user->name}",
            'route' => $user->role == "admin" ? 'dashboard' : ($user->role == "company" || $user->role == "editor" ? "company.cards" : ($user->role == "template_editor" ? "design.index" : "profile.edit")),
        ]);
    }

    public function stopImpersonate()
    {
        $adminId = session('impersonated_by');

        if ($adminId) {
            $admin = User::find($adminId);

            // Reset impersonation flags on the impersonated user
            $impersonatedUser = auth()->user();
            $impersonatedUser->update([
                'is_impersonated' => false,
                'impersonated_by' => null,
            ]);

            // Restore admin session
            Auth::login($admin);

            session()->forget('impersonated_by');
        }

        return redirect()->route('users.index')->with('success', 'Stopped impersonation.');
    }



}
