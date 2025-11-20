<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\NfcCard;
use Illuminate\Http\Request;

class NfcController extends Controller
{

    /**
     * @OA\Post(
     *     path="/api/v1/nfc/multi-assign",
     *     summary="Assign multiple NFC cards to multiple employees",
     *     description="Assigns NFC cards to employees. All IDs must belong to the company from the API token.",
     *     tags={"NFC Cards"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="assignments",
     *                 type="array",
     *                 description="Array of assignments",
     *                 @OA\Items(
     *                     type="object",
     *                     required={"employee","nfc_ids"},
     *                     @OA\Property(
     *                         property="employee",
     *                         type="integer",
     *                         example=25,
     *                         description="Employee ID to assign NFC cards to"
     *                     ),
     *                     @OA\Property(
     *                         property="nfc_ids",
     *                         type="array",
     *                         description="Array of NFC card IDs to assign",
     *                         @OA\Items(type="integer", example=101)
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful assignment",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="2 assignment(s) completed successfully."),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="assignments",
     *                     type="array",
     *                     @OA\Items(
     *                         type="object",
     *                         @OA\Property(property="employee_id", type="integer", example=25),
     *                         @OA\Property(
     *                             property="assigned_nfc_ids",
     *                             type="array",
     *                             @OA\Items(type="integer", example=101)
     *                         )
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=403, description="Unauthorized / Invalid company ownership"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     * 
     * * @OA\Post(
     *     path="/api/v1/nfc/multi-unassign",
     *     summary="Unassign multiple NFC cards from employees",
     *     description="Unassigns NFC cards. All IDs must belong to the company from the API token.",
     *     tags={"NFC Cards"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             type="object",
     *             required={"nfc_ids"},
     *             @OA\Property(
     *                 property="nfc_ids",
     *                 type="array",
     *                 description="Array of NFC card IDs to unassign",
     *                 @OA\Items(type="integer", example=101)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful unassignment",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="5 NFC card(s) unassigned successfully."),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="unassigned_nfc_ids",
     *                     type="array",
     *                     @OA\Items(type="integer", example=101)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=403, description="Unauthorized / Invalid company ownership"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */


    public function assignMultipleToEmployees(Request $request)
    {
        $company = $request->company;
        $data = $request->all();

        // ✅ Validate input
        if (!isset($data['assignments']) || !is_array($data['assignments']) || empty($data['assignments'])) {
            return ApiResponse::error("Invalid payload. 'assignments' must be a non-empty array.", [], 422);
        }

        $results = [];

        foreach ($data['assignments'] as $index => $assignment) {
            if (!isset($assignment['employee']) || !isset($assignment['nfc_ids']) || !is_array($assignment['nfc_ids'])) {
                return ApiResponse::error("Invalid assignment at index {$index}. Must include 'employee' ID and 'nfc_ids' array.", [], 422);
            }

            // ✅ Check employee belongs to this company
            $employee = Card::where('id', $assignment['employee'])
                ->where('company_id', $company->id)
                ->first();

            if (!$employee) {
                return ApiResponse::error("Employee ID {$assignment['employee']} does not belong to your company.", [], 403);
            }

            // ✅ Fetch NFC cards for this company
            $nfcCards = NfcCard::whereIn('id', $assignment['nfc_ids'])
                ->where('company_id', $company->id)
                ->get();

            if ($nfcCards->count() !== count($assignment['nfc_ids'])) {
                return ApiResponse::error("Some NFC cards in assignment at index {$index} do not belong to your company.", [], 403);
            }

            // ✅ Assign NFC cards
            foreach ($nfcCards as $nfc) {
                $nfc->card_code = $employee->code;
                $nfc->save();
            }

            $results[] = [
                'employee_id' => $employee->id,
                'assigned_nfc_ids' => $nfcCards->pluck('id')
            ];
        }

        return ApiResponse::success(
            count($results) . " assignment(s) completed successfully.",
            ['assignments' => $results],
            200
        );
    }


    public function unassignMultipleFromEmployees(Request $request)
    {
        $company = $request->company;
        $data = $request->all();

        // ✅ Validate input
        if (!isset($data['nfc_ids']) || !is_array($data['nfc_ids']) || empty($data['nfc_ids'])) {
            return ApiResponse::error("Invalid payload. 'nfc_ids' must be a non-empty array.", [], 422);
        }

        // ✅ Fetch NFC cards for this company
        $nfcCards = NfcCard::whereIn('id', $data['nfc_ids'])
            ->where('company_id', $company->id)
            ->get();

        if ($nfcCards->count() !== count($data['nfc_ids'])) {
            return ApiResponse::error("Some NFC cards do not belong to your company.", [], 403);
        }

        foreach ($nfcCards as $nfc) {
            $nfc->card_code = null;
            $nfc->save();
        }

        return ApiResponse::success(
            count($nfcCards) . " NFC card(s) unassigned successfully.",
            ['unassigned_nfc_ids' => $nfcCards->pluck('id')],
            200
        );
    }
}
