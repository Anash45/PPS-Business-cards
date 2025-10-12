<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Hotel;
use App\Models\Plan;
use App\Models\User;
use Auth;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Log;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['company', 'subscription']); // eager load company profile

        // Apply search filter if query parameter exists
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('role', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(10)->withQueryString();
        $plans = Plan::get();

        return inertia('Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
            ],
            'plans' => $plans
        ]);
    }

    public function create()
    {
        return inertia('Users/Create');
    }

    public function store(Request $request)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'role' => 'required|in:admin,company,team',
        ];

        if ($request->role === 'company') {
            $rules['company_name'] = 'required|string|max:255';
        }

        if ($request->role === 'team') {
            $rules['company_id'] = 'required|exists:companies,id';
        }

        $validated = $request->validate($rules);

        DB::beginTransaction();

        try {
            $companyId = null;

            // ✅ If company user — create company record first
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
                'company_id' => $validated['role'] === 'team' ? $validated['company_id'] : $companyId,
                'created_by' => auth()->id(),
                'status' => true, // boolean
            ]);

            // ✅ Link company to its owner
            if ($validated['role'] === 'company' && isset($company)) {
                $company->update(['user_id' => $user->id]);
            }

            DB::commit();

            // ✅ Return JSON success (API style)
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
        // Validation rules
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|min:8|confirmed', // optional on update
        ];

        // Only validate company_name if user is a company owner
        if ($user->role === 'company') {
            $rules['company_name'] = 'required|string|max:255';
        }

        $validated = $request->validate($rules);

        DB::beginTransaction();

        try {
            // Update user fields (skip role)
            $user->name = $validated['name'];
            $user->email = $validated['email'];

            if (!empty($validated['password'])) {
                $user->password = Hash::make($validated['password']);
            }

            $user->save();

            // Update company name if this user is a company owner
            if ($user->role === 'company' && isset($validated['company_name'])) {
                $user->companyProfile()->update([
                    'name' => $validated['company_name'],
                ]);
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
        // Prevent deleting self
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account.',
            ], 403);
        }

        try {
            $user->delete(); // soft delete

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
