<?php

namespace App\Http\Controllers;

use Auth;
use Illuminate\Http\Request;

class CsvController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // ✅ Now safe comparison
        if (
            !$user->isCompany() && (
                !in_array($user->role, ['editor', 'template_editor'])
            )
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this card.',
            ], 403);
        }
        return inertia('Csv/Index');
    }
}
