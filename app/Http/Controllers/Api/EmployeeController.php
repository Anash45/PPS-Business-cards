<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\CardAddress;
use App\Models\CardButton;
use App\Models\CardEmail;
use App\Models\CardPhoneNumber;
use App\Models\CardSocialLink;
use App\Models\CardWebsite;
use App\Models\NfcCard;
use DB;
use Illuminate\Http\Request;
use App\Models\Card;
use Illuminate\Validation\ValidationException;
use Schema;
use Validator;

/**
 * @OA\Get(
 *     path="/api/v1/employees",
 *     summary="Get all employees for a company",
 *     description="Fetch employees with optional related entities and wallet/sync info.",
 *     tags={"Employees"},
 *     security={{"bearerAuth":{}}},
 * 
 *     @OA\Parameter(
 *         name="include_wallet_status",
 *         in="query",
 *         description="Include wallet status for each employee",
 *         required=false,
 *         @OA\Schema(type="boolean", default=false)
 *     ),
 *     @OA\Parameter(
 *         name="include_sync_eligibility",
 *         in="query",
 *         description="Include sync eligibility for each employee",
 *         required=false,
 *         @OA\Schema(type="boolean", default=false)
 *     ),
 *     @OA\Parameter(
 *         name="include_all",
 *         in="query",
 *         description="Include all relations (websites, phones, emails, addresses, buttons, social links)",
 *         required=false,
 *         @OA\Schema(type="boolean", default=false)
 *     ),
 *     @OA\Parameter(
 *         name="include_websites",
 *         in="query",
 *         description="Include employee websites relation",
 *         required=false,
 *         @OA\Schema(type="boolean", default=false)
 *     ),
 *     @OA\Parameter(
 *         name="include_phone_numbers",
 *         in="query",
 *         description="Include employee phone numbers relation",
 *         required=false,
 *         @OA\Schema(type="boolean", default=false)
 *     ),
 *     @OA\Parameter(
 *         name="include_emails",
 *         in="query",
 *         description="Include employee emails relation",
 *         required=false,
 *         @OA\Schema(type="boolean", default=false)
 *     ),
 *     @OA\Parameter(
 *         name="include_addresses",
 *         in="query",
 *         description="Include employee addresses relation",
 *         required=false,
 *         @OA\Schema(type="boolean", default=false)
 *     ),
 *     @OA\Parameter(
 *         name="include_social_links",
 *         in="query",
 *         description="Include employee social links relation",
 *         required=false,
 *         @OA\Schema(type="boolean", default=false)
 *     ),
 *     @OA\Parameter(
 *         name="include_buttons",
 *         in="query",
 *         description="Include employee buttons relation",
 *         required=false,
 *         @OA\Schema(type="boolean", default=false)
 *     ),
 *
 *     @OA\Response(
 *         response=200,
 *         description="Employees fetched successfully",
 *         @OA\JsonContent(
 *             type="object",
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="message", type="string", example="Employees fetched successfully."),
 *             @OA\Property(
 *                 property="employees",
 *                 type="array",
 *                 @OA\Items(
 *                     type="object",
 *                     @OA\Property(property="card", type="object"),
 *                     @OA\Property(property="additional", type="object")
 *                 )
 *             )
 *         )
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Company not found",
 *         @OA\JsonContent(
 *             type="object",
 *             @OA\Property(property="success", type="boolean", example=false),
 *             @OA\Property(property="message", type="string", example="Company not found."),
 *             @OA\Property(property="errors", type="object")
 *         )
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Error fetching employees",
 *         @OA\JsonContent(
 *             type="object",
 *             @OA\Property(property="success", type="boolean", example=false),
 *             @OA\Property(property="message", type="string", example="Error fetching employees."),
 *             @OA\Property(property="errors", type="object")
 *         )
 *     )
 * )
 * 
 * @OA\Get(
 *     path="/api/v1/employees/{employeeId}",
 *     summary="Get a single employee",
 *     description="Fetch a single employee (card) by ID for the authenticated company. Optional query params control included relations.",
 *     tags={"Employees"},
 *     security={{"bearerAuth":{}}},
 *     @OA\Parameter(
 *         name="employeeId",
 *         in="path",
 *         required=true,
 *         description="ID of the employee (card)",
 *         @OA\Schema(type="integer", example=100001)
 *     ),
 *     @OA\Parameter(
 *         name="include_wallet_status",
 *         in="query",
 *         description="Include wallet status if true (1 or true)",
 *         @OA\Schema(type="boolean", example=true)
 *     ),
 *     @OA\Parameter(
 *         name="include_sync_eligibility",
 *         in="query",
 *         description="Include sync eligibility if true (1 or true)",
 *         @OA\Schema(type="boolean", example=false)
 *     ),
 *     @OA\Parameter(
 *         name="include_all",
 *         in="query",
 *         description="Include all relations if true (1 or true)",
 *         @OA\Schema(type="boolean", example=false)
 *     ),
 *     @OA\Parameter(
 *         name="include_social_links",
 *         in="query",
 *         description="Include social links if true (1 or true)",
 *         @OA\Schema(type="boolean", example=true)
 *     ),
 *     @OA\Parameter(
 *         name="include_phone_numbers",
 *         in="query",
 *         description="Include phone numbers if true (1 or true)",
 *         @OA\Schema(type="boolean", example=true)
 *     ),
 *     @OA\Parameter(
 *         name="include_emails",
 *         in="query",
 *         description="Include emails if true (1 or true)",
 *         @OA\Schema(type="boolean", example=true)
 *     ),
 *     @OA\Parameter(
 *         name="include_addresses",
 *         in="query",
 *         description="Include addresses if true (1 or true)",
 *         @OA\Schema(type="boolean", example=true)
 *     ),
 *     @OA\Parameter(
 *         name="include_websites",
 *         in="query",
 *         description="Include websites if true (1 or true)",
 *         @OA\Schema(type="boolean", example=true)
 *     ),
 *     @OA\Parameter(
 *         name="include_buttons",
 *         in="query",
 *         description="Include buttons if true (1 or true)",
 *         @OA\Schema(type="boolean", example=true)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Successful fetch of a single employee",
 *         @OA\JsonContent(
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="card", type="object",
 *                 @OA\Property(property="id", type="integer", example=100001),
 *                 @OA\Property(property="code", type="string", example="3W3CSJJE"),
 *                 @OA\Property(property="salutation", type="string", example="Mr."),
 *                 @OA\Property(property="title", type="string", example="dr."),
 *                 @OA\Property(property="first_name", type="string", example="Anas"),
 *                 @OA\Property(property="last_name", type="string", example="Syed"),
 *                 @OA\Property(property="profile_image", type="string", example="http://127.0.0.1:8000/storage/card_profiles/qh2LydV0RJpjJDUJWGU8lBryq3TeABekGuqFxxYt.png"),
 *                 @OA\Property(property="position", type="string", example="Web developer"),
 *                 @OA\Property(property="degree", type="string", example="BS Bioinformatics"),
 *                 @OA\Property(property="department", type="string", example="Technical"),
 *                 @OA\Property(property="position_de", type="string", example="Webentwickler"),
 *                 @OA\Property(property="degree_de", type="string", example="BS Bioinformatik"),
 *                 @OA\Property(property="department_de", type="string", example="Technisch"),
 *                 @OA\Property(property="cards_group_id", type="integer", example=13),
 *                 @OA\Property(property="status", type="string", example="active"),
 *                 @OA\Property(property="downloads", type="integer", example=8),
 *                 @OA\Property(property="created_at", type="string", format="date-time", example="2025-10-20T12:42:27.000000Z"),
 *                 @OA\Property(property="updated_at", type="string", format="date-time", example="2025-11-14T05:00:11.000000Z"),
 *             ),
 *             @OA\Property(property="additional", type="object",
 *                 @OA\Property(property="wallet_status", type="string", example="active"),
 *                 @OA\Property(property="is_eligible_for_sync", type="boolean", example=true),
 *                 @OA\Property(property="social_links", type="array", @OA\Items(type="object")),
 *                 @OA\Property(property="phone_numbers", type="array", @OA\Items(type="object")),
 *                 @OA\Property(property="emails", type="array", @OA\Items(type="object")),
 *                 @OA\Property(property="addresses", type="array", @OA\Items(type="object")),
 *                 @OA\Property(property="websites", type="array", @OA\Items(type="object")),
 *                 @OA\Property(property="buttons", type="array", @OA\Items(type="object")),
 *             )
 *         )
 *     ),
 *     @OA\Response(response=401, description="Unauthorized"),
 *     @OA\Response(response=404, description="Employee not found")
 * )
 *
 * 
 * @OA\Put(
 *     path="/api/v1/employees/{id}/clear",
 *     summary="Clear a single employee's details and generate a new code",
 *     description="Clears all employee card fields, related records, and generates a new code. Employee must belong to the company associated with the API token.",
 *     tags={"Employees"},
 *     security={{"bearerAuth":{}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         description="Employee ID to clear",
 *         required=true,
 *         @OA\Schema(type="integer", example=25)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Employee cleared successfully",
 *         @OA\JsonContent(
 *             type="object",
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="message", type="string", example="Employee cleared and new code generated successfully."),
 *             @OA\Property(
 *                 property="data",
 *                 type="object",
 *                 @OA\Property(property="employee_id", type="integer", example=25),
 *                 @OA\Property(property="new_code", type="string", example="ABCD1234")
 *             )
 *         )
 *     ),
 *     @OA\Response(response=404, description="Employee not found or does not belong to company"),
 *     @OA\Response(response=500, description="Failed to clear employee")
 * )
 * 
 * * @OA\Put(
 *     path="/api/v1/employees/bulk-clear",
 *     summary="Clear multiple employees' details and generate new codes",
 *     description="Clears all fields and related data for multiple employees and generates new codes. All employees must belong to the company associated with the API token.",
 *     tags={"Employees"},
 *     security={{"bearerAuth":{}}},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             type="object",
 *             required={"ids"},
 *             @OA\Property(
 *                 property="ids",
 *                 type="array",
 *                 description="Array of employee IDs to clear",
 *                 @OA\Items(type="integer", example=25)
 *             )
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Employees cleared successfully",
 *         @OA\JsonContent(
 *             type="object",
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="message", type="string", example="3 employee(s) cleared and new codes generated successfully."),
 *             @OA\Property(
 *                 property="data",
 *                 type="object",
 *                 @OA\Property(
 *                     property="cleared",
 *                     type="array",
 *                     @OA\Items(
 *                         type="object",
 *                         @OA\Property(property="employee_id", type="integer", example=25),
 *                         @OA\Property(property="new_code", type="string", example="ABCD1234")
 *                     )
 *                 )
 *             )
 *         )
 *     ),
 *     @OA\Response(response=404, description="No employees found or do not belong to company"),
 *     @OA\Response(response=422, description="Invalid payload"),
 *     @OA\Response(response=500, description="Failed to clear one or more employees")
 * )
 */
class EmployeeController extends Controller
{

    public function index(Request $request)
    {
        $company = $request->company;
        $linkUrl = env('LINK_URL');

        if (!$company) {
            return ApiResponse::error(
                "Company not found.",
                ['company' => ['Invalid or missing company']],
                404
            );
        }

        $cardFields = [
            'id',
            'company_id',
            'code',
            'salutation',
            'title',
            'first_name',
            'last_name',
            'primary_email',
            'profile_image',
            'position',
            'degree',
            'department',
            'position_de',
            'degree_de',
            'department_de',
            'status',
            'downloads',
        ];

        // Optional query params
        $includeWalletStatus = in_array(strtolower($request->query('include_wallet_status', '0')), ['1', 'true']);
        $includeSyncEligibility = in_array(strtolower($request->query('include_sync_eligibility', '0')), ['1', 'true']);
        $includeAll = in_array(strtolower($request->query('include_all', '0')), ['1', 'true']);

        // Define all possible relations with optional custom output keys
        $relations = [
            'cardSocialLinks' => 'social_links',
            'cardPhoneNumbers' => 'phone_numbers',
            'cardEmails' => 'emails',
            'cardAddresses' => 'addresses',
            'cardWebsites' => 'websites',
            'cardButtons' => 'buttons',
        ];

        // Determine which relations to actually load
        $loadRelations = [];
        foreach ($relations as $modelRel => $customKey) {
            if ($includeAll || in_array(strtolower($request->query("include_$customKey", '0')), ['1', 'true'])) {
                $loadRelations[$modelRel] = $customKey;
            }
        }

        try {
            $query = Card::where('company_id', $company->id)->select($cardFields);

            // Eager load requested relations
            if (!empty($loadRelations)) {
                $query->with(array_keys($loadRelations));
            }

            $employees = $query->get()->map(function ($employee) use ($linkUrl, $cardFields, $includeWalletStatus, $includeSyncEligibility, $loadRelations) {

                // Card fields
                $cardData = [];
                foreach ($cardFields as $field) {
                    if ($field === 'company_id')
                        continue;
                    $value = $employee->$field;
                    if ($field === 'profile_image' && $value) {
                        $value = $linkUrl . '/storage/' . $value;
                    }
                    $cardData[$field] = $value;
                }

                // Optional additional fields
                $additional = [];
                if ($includeWalletStatus) {
                    $additional['wallet_status'] = $employee->wallet_status['status'] ?? null;
                }
                if ($includeSyncEligibility) {
                    $additional['is_eligible_for_sync'] = $employee->is_eligible_for_sync;
                }

                // Fields to include per relation
                $fieldsMap = [
                    'cardWebsites' => ['id', 'card_id', 'icon', 'label', 'label_de', 'url', 'is_hidden'],
                    'cardPhoneNumbers' => ['id', 'card_id', 'icon', 'label', 'label_de', 'phone_number', 'type', 'is_hidden'],
                    'cardSocialLinks' => ['id', 'card_id', 'icon', 'url'],
                    'cardEmails' => ['id', 'card_id', 'label', 'label_de', 'email', 'type', 'is_hidden'],
                    'cardAddresses' => ['id', 'card_id', 'label', 'label_de', 'street', 'house_number', 'zip', 'city', 'country', 'type', 'is_hidden'],
                    'cardButtons' => ['id', 'card_id', 'icon', 'button_text', 'button_text_de', 'button_link'],
                ];

                // Include requested relations with custom keys
                foreach ($loadRelations as $rel => $customKey) {
                    $fields = $fieldsMap[$rel] ?? [];
                    $additional[$customKey] = $employee->getRelationFields($rel, $fields);
                }

                return [
                    'card' => $cardData,
                    'additional' => $additional,
                ];
            });

            return ApiResponse::success(
                "Employees fetched successfully.",
                ['employees' => $employees],
                200
            );

        } catch (\Exception $e) {
            return ApiResponse::error(
                "Error fetching employees.",
                ['exception' => [$e->getMessage()]],
                500
            );
        }
    }



    public function show(Request $request, $cardId, $includeAll = null, $includeWalletStatus = null, $includeSyncEligibility = null)
    {
        $company = $request->company;
        $linkUrl = env('LINK_URL');

        if (!$company) {
            return ApiResponse::error(
                "Company not found.",
                ['company' => ['Invalid or missing company']],
                404
            );
        }

        $cardFields = [
            'id',
            'company_id',
            'code',
            'salutation',
            'title',
            'first_name',
            'last_name',
            'primary_email',
            'profile_image',
            'position',
            'degree',
            'department',
            'position_de',
            'degree_de',
            'department_de',
            'cards_group_id',
            'status',
            'downloads',
        ];

        // Resolve query params or fall back to provided arguments
        $includeWalletStatus = $includeWalletStatus ?? in_array(strtolower($request->query('include_wallet_status', '0')), ['1', 'true']);
        $includeSyncEligibility = $includeSyncEligibility ?? in_array(strtolower($request->query('include_sync_eligibility', '0')), ['1', 'true']);
        $includeAll = $includeAll ?? in_array(strtolower($request->query('include_all', '0')), ['1', 'true']);

        $relations = [
            'cardSocialLinks' => 'social_links',
            'cardPhoneNumbers' => 'phone_numbers',
            'cardEmails' => 'emails',
            'cardAddresses' => 'addresses',
            'cardWebsites' => 'websites',
            'cardButtons' => 'buttons',
        ];

        $loadRelations = [];
        foreach ($relations as $modelRel => $customKey) {
            if ($includeAll || in_array(strtolower($request->query("include_$customKey", '0')), ['1', 'true'])) {
                $loadRelations[$modelRel] = $customKey;
            }
        }

        try {
            $query = Card::where('company_id', $company->id)
                ->where('id', $cardId)
                ->select($cardFields);

            if (!empty($loadRelations)) {
                $query->with(array_keys($loadRelations));
            }

            $employee = $query->first();

            if (!$employee) {
                return ApiResponse::error(
                    "Employee not found for this company.",
                    ['card_id' => [$cardId]],
                    404
                );
            }

            $cardData = [];
            foreach ($cardFields as $field) {
                if ($field === 'company_id')
                    continue;
                $value = $employee->$field;
                if ($field === 'profile_image' && $value) {
                    $value = $linkUrl . '/storage/' . $value;
                }
                $cardData[$field] = $value;
            }

            $additional = [];
            if ($includeWalletStatus)
                $additional['wallet_status'] = $employee->wallet_status['status'] ?? null;
            if ($includeSyncEligibility)
                $additional['is_eligible_for_sync'] = $employee->is_eligible_for_sync;

            $fieldsMap = [
                'cardWebsites' => ['id', 'card_id', 'icon', 'label', 'label_de', 'url', 'is_hidden'],
                'cardPhoneNumbers' => ['id', 'card_id', 'icon', 'label', 'label_de', 'phone_number', 'type', 'is_hidden'],
                'cardSocialLinks' => ['id', 'card_id', 'icon', 'url'],
                'cardEmails' => ['id', 'card_id', 'label', 'label_de', 'email', 'type', 'is_hidden'],
                'cardAddresses' => ['id', 'card_id', 'label', 'label_de', 'street', 'house_number', 'zip', 'city', 'country', 'type', 'is_hidden'],
                'cardButtons' => ['id', 'card_id', 'icon', 'button_text', 'button_text_de', 'button_link'],
            ];

            foreach ($loadRelations as $rel => $customKey) {
                $fields = $fieldsMap[$rel] ?? [];
                $additional[$customKey] = $employee->getRelationFields($rel, $fields);
            }

            return [
                'card' => $cardData,
                'additional' => $additional
            ];

        } catch (\Exception $e) {
            return ApiResponse::error(
                "Error fetching employee.",
                ['exception' => [$e->getMessage()]],
                500
            );
        }
    }

    /**
     * Store or update an employee (Card) and its relations.
     */

    public function store(Request $request)
    {
        $employees = $request->input('employees'); // renamed from 'cards'
        if (!is_array($employees)) {
            return ApiResponse::error(
                "Invalid payload. 'employees' must be an array of employee objects.",
                [],
                422
            );
        }

        $employeeFields = [
            'salutation',
            'title',
            'first_name',
            'last_name',
            'primary_email',
            'position',
            'degree',
            'department',
            'position_de',
            'degree_de',
            'department_de',
            'status',
        ];

        $errors = [];

        // 1️⃣ First pass: validate all employees
        foreach ($employees as $index => $employeeData) {
            $validator = Validator::make($employeeData, [
                'id' => 'required|exists:cards,id',
                'salutation' => 'required|string|max:255',
                'title' => 'nullable|string|max:100',
                'first_name' => 'required|string|max:100',
                'last_name' => 'required|string|max:100',
                'primary_email' => 'required|email|max:100',
                'position' => 'required|string|max:255',
                'degree' => 'nullable|string|max:255',
                'department' => 'required|string|max:255',
                'position_de' => 'nullable|string|max:255',
                'degree_de' => 'nullable|string|max:255',
                'department_de' => 'nullable|string|max:255',
                'status' => 'required|in:active,inactive',
            ]);

            if ($validator->fails()) {
                $errors[$index] = $validator->errors();
            }
        }

        // 2️⃣ If any validation errors exist, return them without updating
        if (!empty($errors)) {
            return ApiResponse::error(
                "Validation errors occurred.",
                $errors,
                422
            );
        }

        $success = [];


        foreach ($employees as $employeeData) {
            try {
                $employee = Card::findOrFail($employeeData['id']);
                foreach ($employeeFields as $field) {
                    if (array_key_exists($field, $employeeData)) {
                        $employee->$field = $employeeData[$field];
                    }
                }
                $employee->save();

                // 4️⃣ Fetch full employee data using show() method
                $fullEmployee = $this->show(
                    $request,
                    $employee->id,
                    $request->query('include_all', true),
                    $request->query('include_wallet_status', false),
                    $request->query('include_sync_eligibility', false)
                );

                $success[] = $fullEmployee;
            } catch (\Exception $e) {
                return ApiResponse::error(
                    "Error updating employee with ID {$employeeData['id']}.",
                    ['exception' => [$e->getMessage()]],
                    500
                );
            }
        }

        return ApiResponse::success(
            "Employees updated successfully.",
            ['updated' => $success],
            200
        );
    }

    public function clearEmployee(Request $request, $id)
    {
        // ✅ Get company from middleware
        $company = $request->company;

        $employee = Card::with([
            'cardSocialLinks',
            'cardPhoneNumbers',
            'cardEmails',
            'cardAddresses',
            'cardWebsites',
            'cardButtons',
            'cardWallet'
        ])
            ->where('id', $id)
            ->where('company_id', $company->id)
            ->first();

        if (!$employee) {
            return ApiResponse::error('Employee not found or does not belong to your company.', [], 404);
        }

        try {
            $employee->cardSocialLinks()->delete();
            $employee->cardPhoneNumbers()->delete();
            $employee->cardEmails()->delete();
            $employee->cardAddresses()->delete();
            $employee->cardWebsites()->delete();
            $employee->cardButtons()->delete();
            $employee->cardWallet()->delete();

            $employee->update([
                'status' => 'inactive',
                'salutation' => null,
                'title' => null,
                'first_name' => null,
                'last_name' => null,
                'primary_email' => null,
                'profile_image' => null,
                'position' => null,
                'position_de' => null,
                'degree' => null,
                'degree_de' => null,
                'department' => null,
                'department_de' => null,
            ]);

            $employee->code = Card::generateCode();
            $employee->save();

            return ApiResponse::success(
                'Employee cleared and new code generated successfully.',
                ['employee_id' => $employee->id, 'new_code' => $employee->code],
                200
            );
        } catch (\Exception $e) {
            return ApiResponse::error(
                'Failed to clear employee.',
                ['exception' => [$e->getMessage()]],
                500
            );
        }
    }

    public function bulkClearEmployees(Request $request)
    {
        $company = $request->company;

        $ids = $request->input('ids');

        if (!is_array($ids) || empty($ids)) {
            return ApiResponse::error(
                "Invalid payload. 'ids' must be a non-empty array of employee IDs.",
                [],
                422
            );
        }

        $employees = Card::with([
            'cardSocialLinks',
            'cardPhoneNumbers',
            'cardEmails',
            'cardAddresses',
            'cardWebsites',
            'cardButtons',
            'cardWallet'
        ])
            ->whereIn('id', $ids)
            ->where('company_id', $company->id)
            ->get();

        if ($employees->isEmpty()) {
            return ApiResponse::error(
                'No employees found or they do not belong to your company.',
                [],
                404
            );
        }

        $cleared = [];

        foreach ($employees as $employee) {
            try {
                $employee->cardSocialLinks()->delete();
                $employee->cardPhoneNumbers()->delete();
                $employee->cardEmails()->delete();
                $employee->cardAddresses()->delete();
                $employee->cardWebsites()->delete();
                $employee->cardButtons()->delete();
                $employee->cardWallet()->delete();

                $employee->update([
                    'status' => 'inactive',
                    'salutation' => null,
                    'title' => null,
                    'first_name' => null,
                    'last_name' => null,
                    'primary_email' => null,
                    'profile_image' => null,
                    'position' => null,
                    'position_de' => null,
                    'degree' => null,
                    'degree_de' => null,
                    'department' => null,
                    'department_de' => null,
                ]);

                $employee->code = Card::generateCode();
                $employee->save();

                $cleared[] = ['employee_id' => $employee->id, 'new_code' => $employee->code];
            } catch (\Exception $e) {
                return ApiResponse::error(
                    "Failed to clear employee with ID {$employee->id}.",
                    ['exception' => [$e->getMessage()]],
                    500
                );
            }
        }

        return ApiResponse::success(
            count($cleared) . ' employee(s) cleared and new codes generated successfully.',
            ['cleared' => $cleared],
            200
        );
    }






    public function createBulkEmployees(Request $request)
    {
        $company = $request->company;

        try {
            DB::beginTransaction();

            $employees = $request->employees;

            if (!is_array($employees) || count($employees) === 0) {
                return response()->json([
                    'success' => false,
                    'error' => 'Employees array is required and must contain at least one item.'
                ], 422);
            }

            $updatedIds = [];

            foreach ($employees as $index => $employee) {

                // ------------------------------
                // Validate main card fields
                // ------------------------------
                $validator = Validator::make($employee, [
                    'id' => 'required|integer|exists:cards,id',
                    'salutation' => 'required|string',
                    'title' => 'nullable|string',
                    'first_name' => 'required|string',
                    'last_name' => 'required|string',
                    'status' => 'nullable|string',
                    'position' => 'required|string',
                    'degree' => 'nullable|string',
                    'department' => 'required|string',

                    // German
                    'position_de' => 'nullable|string',
                    'degree_de' => 'nullable|string',
                    'department_de' => 'nullable|string',

                    // Sub-models
                    'card_social_links' => 'array|max:5',
                    'card_phone_numbers' => 'array|max:4',
                    'card_emails' => 'array|max:4',
                    'card_addresses' => 'array|max:4',
                    'card_websites' => 'array|max:4',
                    'card_buttons' => 'array|max:5',
                ]);

                if ($validator->fails()) {
                    throw ValidationException::withMessages([
                        "employees.$index" => $validator->errors()
                    ]);
                }

                $validated = $validator->validated();

                // ------------------------------
                // Load card + ensure same company
                // ------------------------------
                $card = Card::where('company_id', $company->id)
                    ->findOrFail($validated['id']);

                // Update card (except sub-items)
                $card->update($validated);

                // ------------------------------
                // UPSERT HANDLER (same as store())
                // ------------------------------
                $upsertMany = function (string $relation, array $items = null, string $modelClass, int $max, array $requiredFields = [], array $extra = [], bool $deleteMissing = true) use ($card, $company, $index) {

                    $items = $items ?? [];

                    if (count($items) > $max) {
                        throw ValidationException::withMessages([
                            "employees.$index.$relation" =>
                                "Maximum $max items allowed for $relation."
                        ]);
                    }

                    $keptIds = [];

                    foreach ($items as $itemIndex => $item) {

                        // Required fields inside each item
                        foreach ($requiredFields as $field) {
                            if (!isset($item[$field]) || trim($item[$field]) === '') {
                                throw ValidationException::withMessages([
                                    "employees.$index.$relation.$itemIndex.$field" =>
                                        "Field '$field' is required for $relation."
                                ]);
                            }
                        }

                        $itemData = array_merge(
                            $extra,
                            [
                                'company_id' => $company->id,
                                'card_id' => $card->id,
                            ],
                            $item
                        );

                        // UPDATE
                        if (!empty($item['id'])) {
                            $model = $modelClass::where('company_id', $company->id)
                                ->where('card_id', $card->id)
                                ->find($item['id']);

                            if ($model) {
                                $model->update($itemData);
                                $keptIds[] = $model->id;
                                continue;
                            }
                        }

                        // CREATE NEW
                        $model = $modelClass::create($itemData);
                        $keptIds[] = $model->id;
                    }

                    // Delete removed items
                    if ($deleteMissing) {
                        $modelClass::where('company_id', $company->id)
                            ->where('card_id', $card->id)
                            ->whereNotIn('id', $keptIds)
                            ->delete();
                    }
                };


                // ------------------------------
                // Sub-entities
                // ------------------------------
                $upsertMany('card_social_links', $employee['card_social_links'] ?? [], CardSocialLink::class, 5, [
                    'icon',
                    'url'
                ]);

                $upsertMany('card_phone_numbers', $employee['card_phone_numbers'] ?? [], CardPhoneNumber::class, 4, [
                    'label',
                    'phone_number'
                ]);

                $upsertMany('card_emails', $employee['card_emails'] ?? [], CardEmail::class, 4, [
                    'label',
                    'email'
                ]);

                $upsertMany('card_addresses', $employee['card_addresses'] ?? [], CardAddress::class, 4, [
                    'label',
                    'street',
                    'house_number',
                    'zip',
                    'city',
                    'country'
                ]);

                $upsertMany('card_websites', $employee['card_websites'] ?? [], CardWebsite::class, 4, [
                    'label',
                    'url'
                ]);

                $upsertMany('card_buttons', $employee['card_buttons'] ?? [], CardButton::class, 5, [
                    'button_text',
                    'button_link'
                ]);

                $updatedIds[] = $card->id;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'updated_ids' => $updatedIds,
                'message' => count($updatedIds) . " employees updated successfully."
            ]);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

}
