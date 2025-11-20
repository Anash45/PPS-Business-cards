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
use Illuminate\Validation\Rule;
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
 * 
 * @OA\Post(
 *     path="/api/v1/employees",
 *     operationId="storeEmployees",
 *     tags={"Employees"},
 *     summary="Create or update employees with related data",
 *     description="This endpoint updates multiple employees and their related data (social links, phone numbers, emails, websites, addresses, buttons). All operations are performed in a database transaction, so if any error occurs, changes are rolled back.",
 *     security={{"bearerAuth":{}}},
 *
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             type="object",
 *             required={"employees"},
 *             @OA\Property(
 *                 property="employees",
 *                 type="array",
 *                 description="Array of employee objects to update or create",
 *                 @OA\Items(
 *                     type="object",
 *                     required={"id","salutation","first_name","last_name","primary_email","position","department","status"},
 *                     @OA\Property(property="id", type="integer", description="Employee Card ID (must exist)"),
 *                     @OA\Property(property="salutation", type="string", maxLength=255),
 *                     @OA\Property(property="title", type="string", maxLength=100),
 *                     @OA\Property(property="first_name", type="string", maxLength=100),
 *                     @OA\Property(property="last_name", type="string", maxLength=100),
 *                     @OA\Property(property="primary_email", type="string", format="email", maxLength=100),
 *                     @OA\Property(property="position", type="string", maxLength=255),
 *                     @OA\Property(property="degree", type="string", maxLength=255),
 *                     @OA\Property(property="department", type="string", maxLength=255),
 *                     @OA\Property(property="position_de", type="string", maxLength=255),
 *                     @OA\Property(property="degree_de", type="string", maxLength=255),
 *                     @OA\Property(property="department_de", type="string", maxLength=255),
 *                     @OA\Property(property="status", type="string", enum={"active","inactive"}),

 *                     @OA\Property(
 *                         property="social_links",
 *                         type="array",
 *                         @OA\Items(
 *                             type="object",
 *                             @OA\Property(property="id", type="integer", description="Existing social link ID"),
 *                             @OA\Property(property="icon", type="string", enum={"facebook","instagram","pinterest","tiktok","linkedin","youtube","whatsapp"}),
 *                             @OA\Property(property="url", type="string", format="url")
 *                         )
 *                     ),

 *                     @OA\Property(
 *                         property="phone_numbers",
 *                         type="array",
 *                         @OA\Items(
 *                             type="object",
 *                             @OA\Property(property="id", type="integer"),
 *                             @OA\Property(property="icon", type="string"),
 *                             @OA\Property(property="label", type="string"),
 *                             @OA\Property(property="label_de", type="string"),
 *                             @OA\Property(property="phone_number", type="string"),
 *                             @OA\Property(property="is_hidden", type="boolean"),
 *                             @OA\Property(property="type", type="string", enum={"work","home","cell"})
 *                         )
 *                     ),

 *                     @OA\Property(
 *                         property="emails",
 *                         type="array",
 *                         @OA\Items(
 *                             type="object",
 *                             @OA\Property(property="id", type="integer"),
 *                             @OA\Property(property="label", type="string"),
 *                             @OA\Property(property="label_de", type="string"),
 *                             @OA\Property(property="email", type="string", format="email"),
 *                             @OA\Property(property="is_hidden", type="boolean"),
 *                             @OA\Property(property="type", type="string", enum={"work","home"})
 *                         )
 *                     ),

 *                     @OA\Property(
 *                         property="websites",
 *                         type="array",
 *                         @OA\Items(
 *                             type="object",
 *                             @OA\Property(property="id", type="integer"),
 *                             @OA\Property(property="icon", type="string"),
 *                             @OA\Property(property="label", type="string"),
 *                             @OA\Property(property="label_de", type="string"),
 *                             @OA\Property(property="url", type="string", format="url"),
 *                             @OA\Property(property="is_hidden", type="boolean")
 *                         )
 *                     ),

 *                     @OA\Property(
 *                         property="addresses",
 *                         type="array",
 *                         @OA\Items(
 *                             type="object",
 *                             @OA\Property(property="id", type="integer"),
 *                             @OA\Property(property="label", type="string"),
 *                             @OA\Property(property="label_de", type="string"),
 *                             @OA\Property(property="street", type="string"),
 *                             @OA\Property(property="house_number", type="string"),
 *                             @OA\Property(property="zip", type="string"),
 *                             @OA\Property(property="city", type="string"),
 *                             @OA\Property(property="country", type="string"),
 *                             @OA\Property(property="is_hidden", type="boolean"),
 *                             @OA\Property(property="type", type="string", enum={"work","home"})
 *                         )
 *                     ),

 *                     @OA\Property(
 *                         property="buttons",
 *                         type="array",
 *                         @OA\Items(
 *                             type="object",
 *                             @OA\Property(property="id", type="integer"),
 *                             @OA\Property(property="button_text", type="string"),
 *                             @OA\Property(property="button_text_de", type="string"),
 *                             @OA\Property(property="button_link", type="string", format="url"),
 *                             @OA\Property(property="icon", type="string")
 *                         )
 *                     )
 *                 )
 *             )
 *         )
 *     ),
 *
 *     @OA\Response(
 *         response=200,
 *         description="Employees updated successfully",
 *         @OA\JsonContent(
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="message", type="string", example="Employees updated successfully."),
 *             @OA\Property(
 *                 property="data",
 *                 type="object",
 *                 @OA\Property(
 *                     property="updated",
 *                     type="array",
 *                     @OA\Items(
 *                         type="object",
 *                         @OA\Property(
 *                             property="card",
 *                             type="object",
 *                             @OA\Property(property="id", type="integer", example=100009),
 *                             @OA\Property(property="code", type="string", example="UGVEEASK"),
 *                             @OA\Property(property="salutation", type="string", example="Mr."),
 *                             @OA\Property(property="title", type="string", example="CEO"),
 *                             @OA\Property(property="first_name", type="string", example="John"),
 *                             @OA\Property(property="last_name", type="string", example="Doe"),
 *                             @OA\Property(property="primary_email", type="string", format="email", example="john9.doe@example.com"),
 *                             @OA\Property(property="profile_image", type="string", nullable=true, example=null),
 *                             @OA\Property(property="position", type="string", example="Manager"),
 *                             @OA\Property(property="degree", type="string", example="MBA"),
 *                             @OA\Property(property="department", type="string", example="Sales"),
 *                             @OA\Property(property="position_de", type="string", example="Manager DE"),
 *                             @OA\Property(property="degree_de", type="string", example="MBA DE"),
 *                             @OA\Property(property="department_de", type="string", example="Sales DE"),
 *                             @OA\Property(property="cards_group_id", type="integer", example=13),
 *                             @OA\Property(property="status", type="string", example="active"),
 *                             @OA\Property(property="downloads", type="integer", example=0)
 *                         ),
 *                         @OA\Property(
 *                             property="additional",
 *                             type="object",
 *                             @OA\Property(
 *                                 property="social_links",
 *                                 type="array",
 *                                 @OA\Items(
 *                                     type="object",
 *                                     @OA\Property(property="id", type="integer", example=38),
 *                                     @OA\Property(property="card_id", type="integer", example=100009),
 *                                     @OA\Property(property="icon", type="string", example="FaInstagram"),
 *                                     @OA\Property(property="url", type="string", example="https://www.instagram.com/f4futuretech1_1/")
 *                                 )
 *                             ),
 *                             @OA\Property(
 *                                 property="phone_numbers",
 *                                 type="array",
 *                                 @OA\Items(
 *                                     type="object",
 *                                     @OA\Property(property="id", type="integer", example=144),
 *                                     @OA\Property(property="card_id", type="integer", example=100009),
 *                                     @OA\Property(property="label", type="string", example="Label"),
 *                                     @OA\Property(property="label_de", type="string", example="Label DE"),
 *                                     @OA\Property(property="icon", type="string", example="☎️"),
 *                                     @OA\Property(property="phone_number", type="string", example="+3312341234"),
 *                                     @OA\Property(property="type", type="string", example="cell", enum={"work","home","cell"}),
 *                                     @OA\Property(property="is_hidden", type="boolean", example=false)
 *                                 )
 *                             ),
 *                             @OA\Property(
 *                                 property="emails",
 *                                 type="array",
 *                                 @OA\Items(
 *                                     type="object",
 *                                     @OA\Property(property="id", type="integer", example=41),
 *                                     @OA\Property(property="card_id", type="integer", example=100009),
 *                                     @OA\Property(property="label", type="string", nullable=true, example=null),
 *                                     @OA\Property(property="label_de", type="string", nullable=true, example=null),
 *                                     @OA\Property(property="email", type="string", format="email", example="abc1@xyz.com"),
 *                                     @OA\Property(property="type", type="string", example="work", enum={"work","home"}),
 *                                     @OA\Property(property="is_hidden", type="boolean", example=false)
 *                                 )
 *                             ),
 *                             @OA\Property(
 *                                 property="addresses",
 *                                 type="array",
 *                                 @OA\Items(type="object")
 *                             ),
 *                             @OA\Property(
 *                                 property="websites",
 *                                 type="array",
 *                                 @OA\Items(
 *                                     type="object",
 *                                     @OA\Property(property="id", type="integer", example=19),
 *                                     @OA\Property(property="card_id", type="integer", example=100009),
 *                                     @OA\Property(property="icon", type="string", example="🌐"),
 *                                     @OA\Property(property="label", type="string", nullable=true, example=null),
 *                                     @OA\Property(property="label_de", type="string", nullable=true, example=null),
 *                                     @OA\Property(property="url", type="string", example="https://www.f4futuretech1_1.com"),
 *                                     @OA\Property(property="is_hidden", type="boolean", example=true)
 *                                 )
 *                             ),
 *                             @OA\Property(
 *                                 property="buttons",
 *                                 type="array",
 *                                 @OA\Items(
 *                                     type="object",
 *                                     @OA\Property(property="id", type="integer", example=285),
 *                                     @OA\Property(property="card_id", type="integer", example=100009),
 *                                     @OA\Property(property="button_text", type="string", example="Test"),
 *                                     @OA\Property(property="button_text_de", type="string", example="Testen"),
 *                                     @OA\Property(property="button_link", type="string", example="https://icons8.com/icons/set/tiktok123"),
 *                                     @OA\Property(property="icon", type="string", example="❤️")
 *                                 )
 *                             )
 *                         )
 *                     )
 *                 )
 *             )
 *         )
 *     ),
 *     @OA\Response(
 *         response=422,
 *         description="Validation error",
 *         @OA\JsonContent(
 *             @OA\Property(property="status", type="string", example="error"),
 *             @OA\Property(property="message", type="string", example="Validation errors occurred."),
 *             @OA\Property(property="data", type="object")
 *         )
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Server error",
 *         @OA\JsonContent(
 *             @OA\Property(property="status", type="string", example="error"),
 *             @OA\Property(property="message", type="string", example="An error occurred while updating employees."),
 *             @OA\Property(property="data", type="object")
 *         )
 *     )
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
     * Store or update employees.
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

        // ------------------------------
        // 1️⃣ VALIDATE BEFORE TRANSACTION
        // ------------------------------

        $allowedIcons = ['facebook', 'instagram', 'pinterest', 'tiktok', 'linkedin', 'youtube', 'whatsapp'];

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

                // Social links
                'social_links' => 'nullable|array',
                'social_links.*.id' => 'nullable|exists:card_social_links,id',
                'social_links.*.icon' => [
                    'required_with:social_links',
                    'string',
                    'max:100',
                    Rule::in($allowedIcons)
                ],
                'social_links.*.url' => 'required_with:social_links|url|max:255',

                // Phone numbers validation
                'phone_numbers' => 'nullable|array',
                'phone_numbers.*.id' => 'nullable|integer',
                'phone_numbers.*.icon' => 'nullable|string|max:255',
                'phone_numbers.*.label' => 'nullable|string|max:255',
                'phone_numbers.*.label_de' => 'nullable|string|max:255',
                'phone_numbers.*.phone_number' => 'required_with:phone_numbers|string|max:20',
                'phone_numbers.*.is_hidden' => 'nullable|boolean',
                'phone_numbers.*.type' => 'nullable|string|in:work,home,cell',

                // Emails validation
                'emails' => 'nullable|array',
                'emails.*.id' => 'nullable|integer',
                'emails.*.label' => 'nullable|string|max:255',
                'emails.*.label_de' => 'nullable|string|max:255',
                'emails.*.email' => 'required_with:emails|email|max:255',
                'emails.*.is_hidden' => 'nullable|boolean',
                'emails.*.type' => 'nullable|string|in:work,home',

                // Websites validation
                'websites' => 'nullable|array',
                'websites.*.id' => 'nullable|integer',
                'websites.*.icon' => 'nullable|string|max:50',
                'websites.*.label' => 'nullable|string|max:255',
                'websites.*.label_de' => 'nullable|string|max:255',
                'websites.*.url' => 'required_with:websites|url|max:255',
                'websites.*.is_hidden' => 'nullable|boolean',

                // Addresses validation
                'addresses' => 'nullable|array',
                'addresses.*.id' => 'nullable|integer',
                'addresses.*.label' => 'nullable|string|max:255',
                'addresses.*.label_de' => 'nullable|string|max:255',
                'addresses.*.street' => 'required_with:addresses|string|max:255',
                'addresses.*.house_number' => 'nullable|string|max:50',
                'addresses.*.zip' => 'nullable|string|max:20',
                'addresses.*.city' => 'required_with|string|max:100',
                'addresses.*.country' => 'nullable|string|max:100',
                'addresses.*.is_hidden' => 'nullable|boolean',
                'addresses.*.type' => 'nullable|string|in:work,home',


                // Buttons validation
                'buttons' => 'nullable|array',
                'buttons.*.id' => 'nullable|integer',
                'buttons.*.button_text' => 'required_with:buttons|string|max:255',
                'buttons.*.button_text_de' => 'nullable|string|max:255',
                'buttons.*.button_link' => 'required_with:buttons|url|max:1000',
                'buttons.*.icon' => 'nullable|string|max:50',
            ]);

            if ($validator->fails()) {
                $errors[$index] = $validator->errors();
            }
        }

        if (!empty($errors)) {
            return ApiResponse::error(
                "Validation errors occurred.",
                $errors,
                422
            );
        }

        // ------------------------------------------
        // 2️⃣ PROCESS INSIDE TRANSACTION (ALL OR NONE)
        // ------------------------------------------
        DB::beginTransaction();

        try {
            $success = [];

            foreach ($employees as $employeeData) {

                $employee = Card::findOrFail($employeeData['id']);

                // Update main employee fields
                foreach ($employeeFields as $field) {
                    if (array_key_exists($field, $employeeData)) {
                        $employee->$field = $employeeData[$field];
                    }
                }
                $employee->save();

                // --------------------------------------
                // SOCIAL LINKS
                // --------------------------------------
                if (isset($employeeData['social_links']) && is_array($employeeData['social_links'])) {

                    $incomingLinks = $employeeData['social_links'];

                    $newLinksCount = collect($incomingLinks)->filter(fn($l) => empty($l['id']))->count();

                    $existingIdsIncoming = collect($incomingLinks)->pluck('id')->filter()->toArray();

                    // Only count links that belong to this card and company
                    $existingLinksKeptCount = $employee->cardSocialLinks()
                        ->whereIn('id', $existingIdsIncoming)
                        ->where('card_id', $employee->id)
                        ->where('company_id', $request->company->id)
                        ->count();

                    $finalTotal = $existingLinksKeptCount + $newLinksCount;

                    if ($finalTotal > 5) {
                        DB::rollBack();
                        return ApiResponse::error(
                            "Maximum 5 social links are allowed per employee. You attempted {$finalTotal}.",
                            [],
                            422
                        );
                    }

                    $processedIds = [];

                    foreach ($incomingLinks as $link) {
                        $iconValue = ucfirst(strtolower($link['icon']));
                        $iconValue = 'Fa' . $iconValue;

                        if (!empty($link['id'])) {
                            // Update only if card_id and company_id match
                            $social = $employee->cardSocialLinks()
                                ->where('id', $link['id'])
                                ->where('card_id', $employee->id)
                                ->where('company_id', $request->company->id)
                                ->first();

                            if ($social) {
                                $social->update([
                                    'icon' => $iconValue,
                                    'url' => $link['url'],
                                ]);
                                $processedIds[] = $link['id'];
                            }
                        } else {
                            // Create new link
                            $new = $employee->cardSocialLinks()->create([
                                'icon' => $iconValue,
                                'company_id' => $request->company->id,
                                'url' => $link['url'],
                            ]);
                            $processedIds[] = $new->id;
                        }
                    }

                    // Delete old links not in input, only for this card and company
                    $employee->cardSocialLinks()
                        ->where('card_id', $employee->id)
                        ->where('company_id', $request->company->id)
                        ->whereNotIn('id', $processedIds)
                        ->delete();
                }

                // --------------------------------------
                // PHONE NUMBERS
                // --------------------------------------
                if (isset($employeeData['phone_numbers']) && is_array($employeeData['phone_numbers'])) {

                    $incomingNumbers = $employeeData['phone_numbers'];
                    $processedIds = [];

                    foreach ($incomingNumbers as $number) {

                        if (empty($number['phone_number'])) {
                            DB::rollBack();
                            return ApiResponse::error(
                                "Phone number is required for each entry.",
                                [],
                                422
                            );
                        }

                        $numberData = [
                            'company_id' => $request->company->id,
                            'icon' => $number['icon'] ?? "☎️",
                            'label' => $number['label'] ?? null,
                            'label_de' => $number['label_de'] ?? null,
                            'phone_number' => $number['phone_number'],
                            'is_hidden' => $number['is_hidden'] ?? false,
                            'type' => $number['type'] ?? 'work',
                        ];

                        if (!empty($number['id'])) {
                            // Update only if card_id and company_id match
                            $phone = $employee->cardPhoneNumbers()
                                ->where('id', $number['id'])
                                ->where('card_id', $employee->id)
                                ->where('company_id', $request->company->id)
                                ->first();

                            if ($phone) {
                                $phone->update($numberData);
                                $processedIds[] = $number['id'];
                            }
                        } else {
                            // Create new phone number
                            $new = $employee->cardPhoneNumbers()->create($numberData);
                            $processedIds[] = $new->id;
                        }
                    }

                    // Delete old phone numbers not in input, only for this card and company
                    $employee->cardPhoneNumbers()
                        ->where('card_id', $employee->id)
                        ->where('company_id', $request->company->id)
                        ->whereNotIn('id', $processedIds)
                        ->delete();
                }


                // --------------------------------------
                // Emails
                // --------------------------------------
                if (isset($employeeData['emails']) && is_array($employeeData['emails'])) {

                    $incomingEmails = $employeeData['emails'];
                    $processedIds = [];

                    foreach ($incomingEmails as $email) {

                        if (empty($email['email'])) {
                            DB::rollBack();
                            return ApiResponse::error(
                                "Email is required for each entry.",
                                [],
                                422
                            );
                        }

                        $emailData = [
                            'company_id' => $request->company->id,
                            'label' => $email['label'] ?? null,
                            'label_de' => $email['label_de'] ?? null,
                            'email' => $email['email'],
                            'is_hidden' => $email['is_hidden'] ?? false,
                            'type' => $email['type'] ?? 'work', // default type
                        ];

                        if (!empty($email['id'])) {
                            // Update only if card_id and company_id match
                            $existing = $employee->cardEmails()
                                ->where('id', $email['id'])
                                ->where('card_id', $employee->id)
                                ->where('company_id', $request->company->id)
                                ->first();

                            if ($existing) {
                                $existing->update($emailData);
                                $processedIds[] = $email['id'];
                            }
                        } else {
                            // Create new email
                            $new = $employee->cardEmails()->create($emailData);
                            $processedIds[] = $new->id;
                        }
                    }

                    // Delete old emails not in input, only for this card and company
                    $employee->cardEmails()
                        ->where('card_id', $employee->id)
                        ->where('company_id', $request->company->id)
                        ->whereNotIn('id', $processedIds)
                        ->delete();
                }

                if (isset($employeeData['websites']) && is_array($employeeData['websites'])) {

                    $incomingWebsites = $employeeData['websites'];
                    $processedIds = [];

                    foreach ($incomingWebsites as $website) {

                        if (empty($website['url'])) {
                            DB::rollBack();
                            return ApiResponse::error(
                                "Website URL is required for each entry.",
                                [],
                                422
                            );
                        }

                        $websiteData = [
                            'company_id' => $request->company->id,
                            'icon' => $website['icon'] ?? "🌐",
                            'label' => $website['label'] ?? null,
                            'label_de' => $website['label_de'] ?? null,
                            'url' => $website['url'],
                            'is_hidden' => $website['is_hidden'] ?? false,
                        ];

                        if (!empty($website['id'])) {
                            // Update only if card_id and company_id match
                            $existing = $employee->cardWebsites()
                                ->where('id', $website['id'])
                                ->where('card_id', $employee->id)
                                ->where('company_id', $request->company->id)
                                ->first();

                            if ($existing) {
                                $existing->update($websiteData);
                                $processedIds[] = $website['id'];
                            }
                        } else {
                            // Create new website
                            $new = $employee->cardWebsites()->create($websiteData);
                            $processedIds[] = $new->id;
                        }
                    }

                    // Delete old websites not in input, only for this card and company
                    $employee->cardWebsites()
                        ->where('card_id', $employee->id)
                        ->where('company_id', $request->company->id)
                        ->whereNotIn('id', $processedIds)
                        ->delete();
                }

                if (isset($employeeData['addresses']) && is_array($employeeData['addresses'])) {

                    $incomingAddresses = $employeeData['addresses'];
                    $processedIds = [];

                    foreach ($incomingAddresses as $address) {

                        if (empty($address['street'])) {
                            DB::rollBack();
                            return ApiResponse::error(
                                "Street is required for each address entry.",
                                [],
                                422
                            );
                        }

                        $addressData = [
                            'company_id' => $request->company->id,
                            'label' => $address['label'] ?? null,
                            'label_de' => $address['label_de'] ?? null,
                            'street' => $address['street'],
                            'house_number' => $address['house_number'] ?? null,
                            'zip' => $address['zip'] ?? null,
                            'city' => $address['city'] ?? null,
                            'country' => $address['country'] ?? null,
                            'is_hidden' => $address['is_hidden'] ?? false,
                            'type' => $address['type'] ?? 'work', // default type if missing
                        ];

                        if (!empty($address['id'])) {
                            // Update only if card_id and company_id match
                            $existing = $employee->cardAddresses()
                                ->where('id', $address['id'])
                                ->where('card_id', $employee->id)
                                ->where('company_id', $request->company->id)
                                ->first();

                            if ($existing) {
                                $existing->update($addressData);
                                $processedIds[] = $address['id'];
                            }
                        } else {
                            // Create new address
                            $new = $employee->cardAddresses()->create($addressData);
                            $processedIds[] = $new->id;
                        }
                    }

                    if (isset($employeeData['buttons']) && is_array($employeeData['buttons'])) {

                        $incomingButtons = $employeeData['buttons'];
                        $processedIds = [];

                        foreach ($incomingButtons as $button) {

                            if (empty($button['button_text']) || empty($button['button_link'])) {
                                DB::rollBack();
                                return ApiResponse::error(
                                    "Button text and link are required for each entry.",
                                    [],
                                    422
                                );
                            }

                            $buttonData = [
                                'company_id' => $request->company->id,
                                'button_text' => $button['button_text'],
                                'button_text_de' => $button['button_text_de'] ?? "",
                                'button_link' => $button['button_link'],
                                'icon' => $button['icon'] ?? null,
                            ];

                            if (!empty($button['id'])) {
                                // Update only if card_id and company_id match
                                $existing = $employee->cardButtons()
                                    ->where('id', $button['id'])
                                    ->where('card_id', $employee->id)
                                    ->where('company_id', $request->company->id)
                                    ->first();

                                if ($existing) {
                                    $existing->update($buttonData);
                                    $processedIds[] = $button['id'];
                                }
                            } else {
                                // Create new button
                                $new = $employee->cardButtons()->create($buttonData);
                                $processedIds[] = $new->id;
                            }
                        }

                        // Delete old buttons not in input, only for this card and company
                        $employee->cardButtons()
                            ->where('card_id', $employee->id)
                            ->where('company_id', $request->company->id)
                            ->whereNotIn('id', $processedIds)
                            ->delete();
                    }

                    // Delete old addresses not in input, only for this card and company
                    $employee->cardAddresses()
                        ->where('card_id', $employee->id)
                        ->where('company_id', $request->company->id)
                        ->whereNotIn('id', $processedIds)
                        ->delete();
                }


                // Fetch enriched response
                $fullEmployee = $this->show(
                    $request,
                    $employee->id,
                    $request->query('include_all', true),
                    $request->query('include_wallet_status', false),
                    $request->query('include_sync_eligibility', false)
                );

                $success[] = $fullEmployee;
            }

            DB::commit(); // 🔥 SUCCESS — COMMIT EVERYTHING

            return ApiResponse::success(
                "Employees updated successfully.",
                ['updated' => $success],
                200
            );

        } catch (\Exception $e) {

            DB::rollBack(); // ❌ ERROR — REVERSE EVERYTHING

            return ApiResponse::error(
                "An error occurred while updating employees.",
                ['exception' => [$e->getMessage()]],
                500
            );
        }
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
