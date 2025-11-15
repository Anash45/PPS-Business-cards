<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CardAddress;
use App\Models\CardButton;
use App\Models\CardEmail;
use App\Models\CardPhoneNumber;
use App\Models\CardSocialLink;
use App\Models\CardWebsite;
use DB;
use Illuminate\Http\Request;
use App\Models\Card;
use Illuminate\Validation\ValidationException;
use Schema;
use Validator;

/**
 * @OA\Get(
 *     path="/v1/employees",
 *     tags={"Employees"},
 *     summary="Get list of employees for the authenticated company",
 *     security={{"bearerAuth":{}}},
 *     description="Returns company information along with a list of employees and their related card details.",
 *
 *     @OA\Response(
 *         response=200,
 *         description="Successful response",
 *
 *         @OA\JsonContent(
 *             type="object",
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="company_id", type="integer", example=10),
 *             @OA\Property(property="company_name", type="string", example="Company 123"),
 *
 *             @OA\Property(
 *                 property="employees",
 *                 type="array",
 *                 @OA\Items(
 *                     type="object",
 *                     @OA\Property(property="id", type="integer", example=100001),
 *                     @OA\Property(property="code", type="string", example="3W3CSJJE"),
 *                     @OA\Property(property="company_id", type="integer", example=10),
 *                     @OA\Property(property="cards_group_id", type="integer", example=13),
 *                     @OA\Property(property="status", type="string", example="active"),
 *                     @OA\Property(property="downloads", type="integer", example=8),
 *                     @OA\Property(property="salutation", type="string", example="Mr."),
 *                     @OA\Property(property="title", type="string", example="dr."),
 *                     @OA\Property(property="first_name", type="string", example="Anas"),
 *                     @OA\Property(property="last_name", type="string", example="Syed"),
 *                     @OA\Property(property="profile_image", type="string", example="http://127.0.0.1:8000/storage/card_profiles/sample.png"),
 *                     @OA\Property(property="position", type="string", example="Web developer"),
 *                     @OA\Property(property="position_de", type="string", example="Webentwickler"),
 *                     @OA\Property(property="degree", type="string", example="BS Bioinformatics"),
 *                     @OA\Property(property="degree_de", type="string", example="BS Bioinformatik"),
 *                     @OA\Property(property="department", type="string", example="Technical"),
 *                     @OA\Property(property="department_de", type="string", example="Technisch"),
 *                     @OA\Property(property="created_at", type="string", example="2025-10-20T12:42:27.000000Z"),
 *                     @OA\Property(property="updated_at", type="string", example="2025-11-14T05:00:11.000000Z"),
 *
 *                     @OA\Property(
 *                            property="card_social_links",
 *                            type="array",
 *                            @OA\Items(
 *                                type="object",
 *                                @OA\Property(property="id", type="integer", example=22),
 *                                @OA\Property(property="company_id", type="integer", example=10),
 *                                @OA\Property(property="card_id", type="integer", example=100001),
 *
 *                                @OA\Property(
 *                                    property="icon",
 *                                    type="string",
 *                                    enum={
 *                                        "FaFacebook",
 *                                        "FaInstagram",
 *                                        "FaPinterest",
 *                                        "FaTiktok",
 *                                        "FaLinkedin",
 *                                        "FaYoutube",
 *                                        "FaWhatsapp"
 *                                    },
 *                                    example="FaFacebook"
 *                                ),
 *
 *                                @OA\Property(property="url", type="string", example="https://facebook.com/yourpage"),
 *
 *                                @OA\Property(property="created_at", type="string", example="2025-10-28T00:52:31.000000Z"),
 *                                @OA\Property(property="updated_at", type="string", example="2025-11-14T04:59:15.000000Z")
 *                            )
 *                        ),
 *
 *                     @OA\Property(
 *                         property="card_phone_numbers",
 *                         type="array",
 *                         @OA\Items(
 *                             type="object",
 *                             @OA\Property(property="id", type="integer", example=128),
 *                             @OA\Property(property="company_id", type="integer", example=10),
 *                             @OA\Property(property="card_id", type="integer", example=100001),
 *                             @OA\Property(property="label", type="string", example="Home Phone"),
 *                             @OA\Property(property="label_de", type="string", example=""),
 *                             @OA\Property(property="icon", type="string", example="☎️"),
 *                             @OA\Property(property="phone_number", type="string", example="+331233123123"),
 *                             @OA\Property(property="type", type="string", example="cell"),
 *                             @OA\Property(property="is_hidden", type="boolean", example=false),
 *                             @OA\Property(property="created_at", type="string", example="2025-10-28T00:52:31.000000Z"),
 *                             @OA\Property(property="updated_at", type="string", example="2025-11-14T04:59:15.000000Z")
 *                         )
 *                     ),
 *
 *                     @OA\Property(
 *                         property="card_emails",
 *                         type="array",
 *                         @OA\Items(
 *                             type="object",
 *                             @OA\Property(property="id", type="integer", example=10),
 *                             @OA\Property(property="company_id", type="integer", example=10),
 *                             @OA\Property(property="card_id", type="integer", example=100001),
 *                             @OA\Property(property="label", type="string", example=""),
 *                             @OA\Property(property="label_de", type="string", example=""),
 *                             @OA\Property(property="email", type="string", example="abcq@xyz.com"),
 *                             @OA\Property(property="type", type="string", example="Work"),
 *                             @OA\Property(property="is_hidden", type="boolean", example=false),
 *                             @OA\Property(property="created_at", type="string", example="2025-10-28T00:52:31.000000Z"),
 *                             @OA\Property(property="updated_at", type="string", example="2025-11-14T04:59:15.000000Z")
 *                         )
 *                     ),
 *
 *                     @OA\Property(
 *                         property="card_addresses",
 *                         type="array",
 *                         @OA\Items(
 *                             type="object",
 *                             @OA\Property(property="id", type="integer", example=12),
 *                             @OA\Property(property="company_id", type="integer", example=10),
 *                             @OA\Property(property="card_id", type="integer", example=100001),
 *                             @OA\Property(property="label", type="string", example=""),
 *                             @OA\Property(property="label_de", type="string", example=""),
 *                             @OA\Property(property="type", type="string", example="Work"),
 *                             @OA\Property(property="street", type="string", example="Erich Müller"),
 *                             @OA\Property(property="house_number", type="string", example="Goethestr. 13"),
 *                             @OA\Property(property="zip", type="string", example="22767"),
 *                             @OA\Property(property="city", type="string", example="Hamburg"),
 *                             @OA\Property(property="country", type="string", example="GERMANY"),
 *                             @OA\Property(property="is_hidden", type="boolean", example=false),
 *                             @OA\Property(property="created_at", type="string", example="2025-11-03T00:49:50.000000Z"),
 *                             @OA\Property(property="updated_at", type="string", example="2025-11-14T04:59:15.000000Z")
 *                         )
 *                     ),
 *
 *                     @OA\Property(
 *                         property="card_websites",
 *                         type="array",
 *                         @OA\Items(
 *                             type="object",
 *                             @OA\Property(property="id", type="integer", example=8),
 *                             @OA\Property(property="company_id", type="integer", example=10),
 *                             @OA\Property(property="card_id", type="integer", example=100001),
 *                             @OA\Property(property="icon", type="string", example=""),
 *                             @OA\Property(property="label", type="string", example=""),
 *                             @OA\Property(property="label_de", type="string", example=""),
 *                             @OA\Property(property="url", type="string", example="https://www.f4futuretech.com"),
 *                             @OA\Property(property="is_hidden", type="boolean", example=false),
 *                             @OA\Property(property="created_at", type="string", example="2025-10-28T00:52:31.000000Z"),
 *                             @OA\Property(property="updated_at", type="string", example="2025-11-14T04:59:15.000000Z")
 *                         )
 *                     ),
 *
 *                     @OA\Property(
 *                                property="card_buttons",
 *                                type="array",
 *                                @OA\Items(
 *                                    type="object",
 *                                    @OA\Property(property="id", type="integer", example=5),
 *                                    @OA\Property(property="company_id", type="integer", example=10),
 *                                    @OA\Property(property="card_id", type="integer", example=100001),
 *                                    @OA\Property(property="icon", type="string", example="☎️"),
 *                                    @OA\Property(property="button_text", type="string", example="Contact Us"),
 *                                    @OA\Property(property="button_text_de", type="string", example="Kontaktieren Sie uns"),
 *                                    @OA\Property(property="button_link", type="string", example="https://example.com/contact"),
 *                                    @OA\Property(property="text_color", type="string", example="#FFFFFF"),
 *                                    @OA\Property(property="bg_color", type="string", example="#007BFF"),
 *                                    @OA\Property(property="created_at", type="string", example="2025-10-28T00:52:31.000000Z"),
 *                                    @OA\Property(property="updated_at", type="string", example="2025-11-14T04:59:15.000000Z")
 *                                )
 *                            )
 *                     )
 *                 )
 *             )
 *         )
 *     )
 * )
 * 
 * @OA\Get(
 *     path="/api/employees/{id}",
 *     summary="Get a single employee by ID",
 *     tags={"Employees"},
 *     security={{"bearerAuth":{}}},
 *
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         description="ID of the employee card",
 *         required=true,
 *         @OA\Schema(type="integer", example=100014)
 *     ),
 *
 *     @OA\Response(
 *         response=200,
 *         description="Employee retrieved successfully",
 *         @OA\JsonContent(
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="company_id", type="integer", example=1),
 *             @OA\Property(property="company_name", type="string", example="Acme Corp"),
 *             @OA\Property(
 *                 property="employee",
 *                 type="object",
 *                 @OA\Property(property="id", type="integer", example=100014),
 *                 @OA\Property(property="status", type="string", example="active"),
 *                 @OA\Property(property="salutation", type="string", example="Mr"),
 *                 @OA\Property(property="title", type="string", nullable=true),
 *                 @OA\Property(property="first_name", type="string", example="John"),
 *                 @OA\Property(property="last_name", type="string", example="Doe"),
 *                 @OA\Property(property="profile_image", type="string", nullable=true),
 *                 @OA\Property(property="position", type="string", example="Developer"),
 *                 @OA\Property(property="position_de", type="string", nullable=true),
 *                 @OA\Property(property="degree", type="string", nullable=true),
 *                 @OA\Property(property="degree_de", type="string", nullable=true),
 *                 @OA\Property(property="department", type="string", example="IT"),
 *                 @OA\Property(property="department_de", type="string", nullable=true),
 *
 *                 @OA\Property(
 *                     property="card_social_links",
 *                     type="array",
 *                     @OA\Items(
 *                         @OA\Property(property="id", type="integer", example=1),
 *                         @OA\Property(property="icon", type="string", example="LinkedIn"),
 *                         @OA\Property(property="url", type="string", example="https://linkedin.com/in/john")
 *                     )
 *                 ),
 *
 *                 @OA\Property(
 *                     property="card_phone_numbers",
 *                     type="array",
 *                     @OA\Items(
 *                         @OA\Property(property="id", type="integer", example=10),
 *                         @OA\Property(property="label", type="string", example="Work"),
 *                         @OA\Property(property="phone_number", type="string", example="+1 555 123456")
 *                     )
 *                 ),
 *
 *                 @OA\Property(
 *                     property="card_emails",
 *                     type="array",
 *                     @OA\Items(
 *                         @OA\Property(property="id", type="integer", example=20),
 *                         @OA\Property(property="label", type="string", example="Work"),
 *                         @OA\Property(property="email", type="string", example="john@example.com")
 *                     )
 *                 ),
 *
 *                 @OA\Property(
 *                     property="card_addresses",
 *                     type="array",
 *                     @OA\Items(
 *                         @OA\Property(property="id", type="integer", example=30),
 *                         @OA\Property(property="label", type="string", example="Office"),
 *                         @OA\Property(property="street", type="string", example="Main St"),
 *                         @OA\Property(property="house_number", type="string", example="123"),
 *                         @OA\Property(property="zip", type="string", example="10001"),
 *                         @OA\Property(property="city", type="string", example="New York"),
 *                         @OA\Property(property="country", type="string", example="USA")
 *                     )
 *                 ),
 *
 *                 @OA\Property(
 *                     property="card_websites",
 *                     type="array",
 *                     @OA\Items(
 *                         @OA\Property(property="id", type="integer", example=40),
 *                         @OA\Property(property="label", type="string", example="Portfolio"),
 *                         @OA\Property(property="url", type="string", example="https://johndoe.dev")
 *                     )
 *                 ),
 *
 *                 @OA\Property(
 *                     property="card_buttons",
 *                     type="array",
 *                     @OA\Items(
 *                         @OA\Property(property="id", type="integer", example=50),
 *                         @OA\Property(property="button_text", type="string", example="Contact Me"),
 *                         @OA\Property(property="button_link", type="string", example="mailto:john@example.com")
 *                     )
 *                 )
 *             )
 *         )
 *     ),
 *
 *     @OA\Response(response=404, description="Employee not found")
 * )
 * 
 * 
 *  @OA\Post(
 *     path="/api/employees",
 *     summary="Create a new employee card",
 *     tags={"Employees"},
 *     security={{"bearerAuth":{}}},
 *
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"first_name", "last_name"},
 *             @OA\Property(property="status", type="string", example="active"),
 *             @OA\Property(property="salutation", type="string", example="Mr"),
 *             @OA\Property(property="title", type="string", nullable=true),
 *             @OA\Property(property="first_name", type="string", example="John"),
 *             @OA\Property(property="last_name", type="string", example="Doe"),
 *             @OA\Property(property="profile_image", type="string", nullable=true),
 *             @OA\Property(property="position", type="string", example="Developer"),
 *             @OA\Property(property="position_de", type="string", nullable=true),
 *             @OA\Property(property="degree", type="string", nullable=true),
 *             @OA\Property(property="degree_de", type="string", nullable=true),
 *             @OA\Property(property="department", type="string", example="IT"),
 *             @OA\Property(property="department_de", type="string", nullable=true),
 *
 *             @OA\Property(
 *                 property="card_social_links",
 *                 type="array",
 *                 @OA\Items(
 *                     @OA\Property(property="platform", type="string", example="LinkedIn"),
 *                     @OA\Property(property="url", type="string", example="https://linkedin.com/in/john")
 *                 )
 *             ),
 *
 *             @OA\Property(
 *                 property="card_phone_numbers",
 *                 type="array",
 *                 @OA\Items(
 *                     @OA\Property(property="label", type="string", example="Work"),
 *                     @OA\Property(property="number", type="string", example="+1 555 112233")
 *                 )
 *             ),
 *
 *             @OA\Property(
 *                 property="card_emails",
 *                 type="array",
 *                 @OA\Items(
 *                     @OA\Property(property="label", type="string", example="Work"),
 *                     @OA\Property(property="email", type="string", example="john@example.com")
 *                 )
 *             ),
 *
 *             @OA\Property(
 *                 property="card_addresses",
 *                 type="array",
 *                 @OA\Items(
 *                     @OA\Property(property="label", type="string", example="Office"),
 *                     @OA\Property(property="address", type="string", example="123 Main St, London")
 *                 )
 *             ),
 *
 *             @OA\Property(
 *                 property="card_websites",
 *                 type="array",
 *                 @OA\Items(
 *                     @OA\Property(property="label", type="string", example="Portfolio"),
 *                     @OA\Property(property="url", type="string", example="https://johndoe.dev")
 *                 )
 *             ),
 *
 *             @OA\Property(
 *                 property="card_buttons",
 *                 type="array",
 *                 @OA\Items(
 *                     @OA\Property(property="label", type="string", example="Contact Me"),
 *                     @OA\Property(property="action_type", type="string", example="link"),
 *                     @OA\Property(property="value", type="string", example="mailto:john@example.com")
 *                 )
 *             )
 *         )
 *     ),
 *
 *     @OA\Response(
 *         response=201,
 *         description="Employee created successfully",
 *         @OA\JsonContent(
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="employee_id", type="integer", example=100014)
 *         )
 *     ),
 *
 *     @OA\Response(response=422, description="Validation error")
 * )
 *
 * @OA\Post(
 *     path="/api/employees/createBulkEmployees",
 *     summary="Create multiple employee cards",
 *     tags={"Employees"},
 *     security={{"bearerAuth":{}}},
 *
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             type="array",
 *             @OA\Items(
 *                 @OA\Property(property="status", type="string", example="active"),
 *                 @OA\Property(property="salutation", type="string", example="Ms"),
 *                 @OA\Property(property="title", type="string", nullable=true),
 *                 @OA\Property(property="first_name", type="string", example="Alice"),
 *                 @OA\Property(property="last_name", type="string", example="Smith"),
 *                 @OA\Property(property="profile_image", type="string", nullable=true),
 *                 @OA\Property(property="position", type="string", example="Designer"),
 *                 @OA\Property(property="position_de", type="string", nullable=true),
 *                 @OA\Property(property="degree", type="string", nullable=true),
 *                 @OA\Property(property="degree_de", type="string", nullable=true),
 *                 @OA\Property(property="department", type="string", example="Marketing"),
 *                 @OA\Property(property="department_de", type="string", nullable=true),
 *
 *                 @OA\Property(
 *                     property="card_social_links",
 *                     type="array",
 *                     @OA\Items(
 *                         @OA\Property(property="platform", type="string", example="Instagram"),
 *                         @OA\Property(property="url", type="string", example="https://instagram.com/alice")
 *                     )
 *                 ),
 *
 *                 @OA\Property(
 *                     property="card_phone_numbers",
 *                     type="array",
 *                     @OA\Items(
 *                         @OA\Property(property="label", type="string", example="Work"),
 *                         @OA\Property(property="number", type="string", example="+1 999 888777")
 *                     )
 *                 ),
 *
 *                 @OA\Property(
 *                     property="card_emails",
 *                     type="array",
 *                     @OA\Items(
 *                         @OA\Property(property="label", type="string", example="Office"),
 *                         @OA\Property(property="email", type="string", example="alice@company.com")
 *                     )
 *                 ),
 *
 *                 @OA\Property(
 *                     property="card_addresses",
 *                     type="array",
 *                     @OA\Items(
 *                         @OA\Property(property="label", type="string", example="HQ"),
 *                         @OA\Property(property="address", type="string", example="45 Street, Berlin")
 *                     )
 *                 ),
 *
 *                 @OA\Property(
 *                     property="card_websites",
 *                     type="array",
 *                     @OA\Items(
 *                         @OA\Property(property="label", type="string", example="Portfolio"),
 *                         @OA\Property(property="url", type="string", example="https://alice.dev")
 *                     )
 *                 ),
 *
 *                 @OA\Property(
 *                     property="card_buttons",
 *                     type="array",
 *                     @OA\Items(
 *                         @OA\Property(property="label", type="string", example="Book Meeting"),
 *                         @OA\Property(property="action_type", type="string", example="link"),
 *                         @OA\Property(property="value", type="string", example="https://cal.com/alice")
 *                     )
 *                 )
 *             )
 *         )
 *     ),
 *
 *     @OA\Response(
 *         response=201,
 *         description="Bulk employees created successfully",
 *         @OA\JsonContent(
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(
 *                 property="created_ids",
 *                 type="array",
 *                 @OA\Items(type="integer", example=100014)
 *             )
 *         )
 *     ),
 *
 *     @OA\Response(response=422, description="Validation error")
 * )
 */
class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $company = $request->company;
        $linkUrl = env('LINK_URL');

        $employees = Card::where('company_id', $company->id)
            ->select(array_diff(Schema::getColumnListing('cards'), ['deleted_at']))
            ->with([
                'cardSocialLinks',
                'cardPhoneNumbers',
                'cardEmails',
                'cardAddresses',
                'cardWebsites',
                'cardButtons',
            ])
            ->get()
            ->map(function ($employee) use ($linkUrl) {
                $employee->profile_image = $employee->profile_image
                    ? $linkUrl . '/storage/' . $employee->profile_image
                    : null;

                if ($employee->cardWebsites) {
                    $employee->cardWebsites->transform(function ($website) use ($linkUrl) {
                        $website->url = $website->url ? $linkUrl . '/' . ltrim($website->url, '/') : null;
                        return $website;
                    });
                }

                return $employee;
            });

        return response()->json([
            'success' => true,
            'company_id' => $company->id,
            'company_name' => $company->name,
            'employees' => $employees,
        ]);
    }

    public function show(Request $request, $id)
    {
        $company = $request->company;
        $linkUrl = env('LINK_URL');

        // Ensure the card belongs to this company
        $employee = Card::where('company_id', $company->id)
            ->where('id', $id)
            ->with([
                'cardSocialLinks',
                'cardPhoneNumbers',
                'cardEmails',
                'cardAddresses',
                'cardWebsites',
                'cardButtons',
            ])
            ->firstOrFail();

        // Adjust profile image URL
        $employee->profile_image = $employee->profile_image
            ? $linkUrl . '/storage/' . $employee->profile_image
            : null;

        // Adjust website URLs
        if ($employee->cardWebsites) {
            $employee->cardWebsites->transform(function ($website) use ($linkUrl) {
                $website->url = $website->url ? $linkUrl . '/' . ltrim($website->url, '/') : null;
                return $website;
            });
        }

        return response()->json([
            'success' => true,
            'company_id' => $company->id,
            'company_name' => $company->name,
            'employee' => $employee,
        ]);
    }

    /**
     * Store or update an employee (Card) and its relations.
     */
    public function store(Request $request)
    {
        try {
            $company = $request->company;
            $data = $request->all();

            // ------------------------------
            // Validate MAIN card fields
            // ------------------------------
            $validated = $request->validate([
                'id' => 'required|integer|exists:cards,id',
                'salutation' => 'required|string',
                'title' => 'nullable|string',
                'first_name' => 'required|string',
                'last_name' => 'required|string',
                'status' => 'nullable|string',
                'position' => 'required|string',
                'degree' => 'nullable|string',
                'department' => 'required|string',

                // German fields
                'position_de' => 'nullable|string',
                'degree_de' => 'nullable|string',
                'department_de' => 'nullable|string',
            ]);

            // Card must belong to same company
            $card = Card::where('company_id', $company->id)->findOrFail($validated['id']);

            // Update card safely
            $card->update($validated);


            // ------------------------------
            // UNIVERSAL UPSERT HANDLER
            // ------------------------------
            $upsertMany = function (string $relation, array $items = null, string $modelClass, int $max, array $requiredFields = [], array $extra = [], bool $deleteMissing = true) use ($card, $company) {

                $items = $items ?? [];

                // Max limit check
                if (count($items) > $max) {
                    abort(422, "Maximum $max items allowed for $relation.");
                }

                $keptIds = [];

                foreach ($items as $item) {

                    // Validate required fields
                    foreach ($requiredFields as $field) {
                        if (!isset($item[$field]) || trim($item[$field]) === '') {
                            abort(422, "Field '$field' is required for $relation.");
                        }
                    }

                    // Final data to save
                    $itemData = array_merge(
                        $extra,
                        [
                            'company_id' => $company->id,
                            'card_id' => $card->id,
                        ],
                        $item
                    );

                    // UPDATE if ID exists
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

                    // CREATE new
                    $model = $modelClass::create($itemData);
                    $keptIds[] = $model->id;
                }

                // DELETE removed items (optional)
                if ($deleteMissing) {
                    $modelClass::where('company_id', $company->id)
                        ->where('card_id', $card->id)
                        ->whereNotIn('id', $keptIds)
                        ->delete();
                }

                return $keptIds;
            };


            // ------------------------------
            // SUB ENTITIES
            // ------------------------------

            $upsertMany('card_social_links', $data['card_social_links'] ?? [], CardSocialLink::class, 5, [
                'icon',
                'url'
            ]);

            $upsertMany('card_phone_numbers', $data['card_phone_numbers'] ?? [], CardPhoneNumber::class, 4, [
                'label',
                'phone_number'
            ]);

            $upsertMany('card_emails', $data['card_emails'] ?? [], CardEmail::class, 4, [
                'label',
                'email'
            ]);

            $upsertMany('card_addresses', $data['card_addresses'] ?? [], CardAddress::class, 4, [
                'label',
                'street',
                'house_number',
                'zip',
                'city',
                'country'
            ]);

            $upsertMany('card_websites', $data['card_websites'] ?? [], CardWebsite::class, 4, [
                'label',
                'url'
            ]);

            $upsertMany('card_buttons', $data['card_buttons'] ?? [], CardButton::class, 4, [
                'button_text',
                'button_link'
            ]);

            return response()->json([
                'success' => true,
                'card_id' => $card->id,
                'message' => 'Card updated successfully.',
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {

            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
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
