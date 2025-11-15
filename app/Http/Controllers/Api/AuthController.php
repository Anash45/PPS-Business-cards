<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\CompanyApiToken;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/authenticate",
     *     tags={"Auth"},
     *     summary="Authenticate company by API key and create a company API token",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"api_key"},
     *             @OA\Property(property="api_key", type="string", description="Company API key")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful authentication",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="company_id", type="integer", example=1),
     *             @OA\Property(property="company_name", type="string", example="Example Co"),
     *             @OA\Property(property="token", type="string", example="pps_api_xxx")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Invalid API key"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     * 
     */
    public function authenticate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'api_key' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'API key is required.'
            ], 422);
        }

        $apiKey = $request->input('api_key');

        $company = Company::where('api_key', $apiKey)->first();

        if (!$company) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid API key.'
            ], 401);
        }

        // Always create a new API token
        $tokenRecord = CompanyApiToken::create([
            'company_id' => $company->id,
            'token' => 'pps_api_' . Str::random(60),
        ]);

        return response()->json([
            'success' => true,
            'company_id' => $company->id,
            'company_name' => $company->name,
            'token' => $tokenRecord->token,
        ]);
    }
}
