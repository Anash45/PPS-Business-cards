<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\CardView;
use App\Models\CompanyCardTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Log;

class DesignController extends Controller
{
    /**
     * Display the current company design template.
     */
    public function index()
    {
        $user = Auth::user();

        // Ensure only company or editor can access
        if (!$user->isCompany() && !$user->isEditor()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Determine correct company reference
        $company = $user->isCompany() ? $user->companyProfile : $user->company;

        if (!$company) {
            return response()->json(['message' => 'No company associated with this user'], 404);
        }

        // Load related data
        $company->load([
            'cardTemplate',
            'cardSocialLinks' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
            'cardPhoneNumbers' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
            'cardEmails' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
            'cardAddresses' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
            'cardButtons' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
        ]);

        return inertia('Design/Index', [
            'pageType' => "template",
            'company' => $company,
            'card' => null,
            'isSubscriptionActive' => $user->isCompany()
                ? $user->hasActiveSubscription()
                : ($user->isEditor()
                    ? optional(optional($user->company)->owner)->hasActiveSubscription()
                    : false),
        ]);
    }


    public function createOrUpdate(Request $request)
    {
        $user = Auth::user();

        // ✅ Allow both company and editor
        if (!$user->isCompany()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Only company users can perform this action.',
            ], 403);
        }

        // ✅ Determine correct company reference
        $company = $user->isCompany() ? $user->companyProfile : $user->company;

        if (!$company) {
            return response()->json([
                'success' => false,
                'message' => 'No company associated with this user.',
            ], 404);
        }

        $validated = $request->validate([
            'banner_image' => 'nullable|image|max:5120',
            'company_name' => 'required|string|max:255',
            'card_bg_color' => 'nullable|string|max:100',
            'name_text_color' => 'nullable|string|max:100',
            'company_text_color' => 'nullable|string|max:100',
            'contact_btn_text' => 'nullable|string|max:50',
            'vcard_btn_bg_color' => 'nullable|string|max:100',
            'vcard_btn_text_color' => 'nullable|string|max:100',
            'btn_bg_color' => 'nullable|string|max:100',
            'btn_text_color' => 'nullable|string|max:100',
            'phone_bg_color' => 'nullable|string|max:100',
            'phone_text_color' => 'nullable|string|max:100',
            'email_bg_color' => 'nullable|string|max:100',
            'email_text_color' => 'nullable|string|max:100',
            'address_bg_color' => 'nullable|string|max:100',
            'address_text_color' => 'nullable|string|max:100',

            // Social Media Links
            'card_social_links' => 'nullable|array',
            'card_social_links.*.icon' => 'required_with:card_social_links|string|max:100',
            'card_social_links.*.url' => 'required_with:card_social_links|url|max:255',
            'card_social_links.*.id' => 'nullable|integer',

            // Phone numbers
            'card_phone_numbers' => 'nullable|array',
            'card_phone_numbers.*.id' => 'nullable|integer',
            'card_phone_numbers.*.phone_number' => 'required_with:card_phone_numbers|string|max:20',
            'card_phone_numbers.*.is_hidden' => 'nullable|boolean',
            'card_phone_numbers.*.type' => 'nullable|string|max:10',

            // Emails
            'card_emails' => 'nullable|array',
            'card_emails.*.id' => 'nullable|integer',
            'card_emails.*.email' => 'required_with:card_emails|email|max:255',
            'card_emails.*.is_hidden' => 'nullable|boolean',
            'card_emails.*.type' => 'nullable|string|max:10',

            // Addresses
            'card_addresses' => 'nullable|array',
            'card_addresses.*.id' => 'nullable|integer',
            'card_addresses.*.street' => 'required_with:card_addresses|string|max:255',
            'card_addresses.*.house_number' => 'nullable|string|max:50',
            'card_addresses.*.zip' => 'nullable|string|max:20',
            'card_addresses.*.city' => 'nullable|string|max:100',
            'card_addresses.*.country' => 'nullable|string|max:100',
            'card_addresses.*.is_hidden' => 'nullable|boolean',
            'card_addresses.*.type' => 'nullable|string|max:10',

            // Buttons
            'card_buttons' => 'nullable|array',
            'card_buttons.*.id' => 'nullable|integer',
            'card_buttons.*.button_text' => 'required_with:card_buttons|string|max:255',
            'card_buttons.*.button_link' => 'required_with:card_buttons|url|max:1000',
            'card_buttons.*.icon' => 'nullable|string|max:50',
        ]);

        // ✅ Get or create template
        $template = CompanyCardTemplate::firstOrNew(['company_id' => $company->id]);

        // ✅ Handle banner removal
        if ($request->boolean('banner_removed')) {
            if ($template->banner_image && Storage::exists($template->banner_image)) {
                Storage::delete($template->banner_image);
            }
            $validated['banner_image'] = null;
        }

        // ✅ Handle new banner upload
        if ($request->hasFile('banner_image')) {
            if ($template->banner_image && Storage::exists($template->banner_image)) {
                Storage::delete($template->banner_image);
            }
            $path = $request->file('banner_image')->store('company_banners', 'public');
            $validated['banner_image'] = $path;
        }

        // ✅ Save template
        $template->fill($validated);
        $template->company_id = $company->id;
        $template->save();

        // ✅ Handle related models
        if ($request->has('card_social_links')) {
            $this->handleCardSocialLinks($company, $request->card_social_links);
        }

        if ($request->has('card_phone_numbers')) {
            $this->handleCardPhoneNumbers($company, $request->card_phone_numbers);
        }

        if ($request->has('card_emails')) {
            $this->handleCardEmails($company, $request->card_emails);
        }

        if ($request->has('card_buttons')) {
            $this->handleCardButtons($company, $request->card_buttons);
        }

        if ($request->has('card_addresses')) {
            $this->handleCardAddresses($company, $request->card_addresses);
        }

        // ✅ Reload updated company data
        $company = $company->load([
            'cardTemplate',
            'cardSocialLinks' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
            'cardPhoneNumbers' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
            'cardEmails' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
            'cardAddresses' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
            'cardButtons' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Template ' . ($template->wasRecentlyCreated ? 'created' : 'updated') . ' successfully!',
            'company' => $company,
            'selectedCard' => null,
        ]);
    }


    public function cardEdit(Card $card)
    {
        $user = Auth::user();


        // ✅ Normalize company id for any user type
        $companyId = $user->isCompany()
            ? $user->companyProfile->id   // if user is a company
            : $user->company_id;           // if user belongs to a company

        Log::info("User company: {$card->company_id} and {$companyId}, {$user->role}");

        // ✅ Now safe comparison
        if (
            !$user->isCompany() && (
                !$user->isEditor() || (int) $card->company_id !== (int) $companyId
            )
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this card.',
            ], 403);
        }

        // ✅ Determine correct company reference
        $companyRef = $user->isCompany() ? $user->companyProfile : $user->company;
        Log::info("CompanyRef: {$companyRef}");

        // ✅ Load company with related data
        $company = $companyRef->newQuery()
            ->with([
                'cardTemplate',
                'cardSocialLinks' => fn($q) => $q->where('company_id', $companyRef->id)
                    ->where(function ($query) use ($card) {
                        $query->whereNull('card_id')->orWhere('card_id', $card->id);
                    }),
                'cardPhoneNumbers' => fn($q) => $q->where('company_id', $companyRef->id)
                    ->where(function ($query) use ($card) {
                        $query->whereNull('card_id')->orWhere('card_id', $card->id);
                    }),
                'cardEmails' => fn($q) => $q->where('company_id', $companyRef->id)
                    ->where(function ($query) use ($card) {
                        $query->whereNull('card_id')->orWhere('card_id', $card->id);
                    }),
                'cardAddresses' => fn($q) => $q->where('company_id', $companyRef->id)
                    ->where(function ($query) use ($card) {
                        $query->whereNull('card_id')->orWhere('card_id', $card->id);
                    }),
                'cardButtons' => fn($q) => $q->where('company_id', $companyRef->id)
                    ->where(function ($query) use ($card) {
                        $query->whereNull('card_id')->orWhere('card_id', $card->id);
                    }),
            ])
            ->find($companyRef->id);

        if (!$company) {
            return response()->json(['message' => 'No company associated with this user'], 404);
        }
        Log::info("CompanyDetails: {$company}");

        return inertia('Design/Index', [
            'pageType' => 'card',
            'company' => $company,
            'selectedCard' => $card,
            'isSubscriptionActive' => $company->owner->hasActiveSubscription(),
        ]);
    }

    public function cardShow($code, Request $request)
    {
        $card = Card::where('code', $code)->firstOrFail();

        $company = $card->company()->with([
            'cardTemplate',
            'cardSocialLinks' => fn($q) => $q->where('company_id', $card->company_id)
                ->where(function ($query) use ($card) {
                    $query->whereNull('card_id')->orWhere('card_id', $card->id);
                }),
            'cardPhoneNumbers' => fn($q) => $q->where('company_id', $card->company_id)
                ->where(function ($query) use ($card) {
                    $query->whereNull('card_id')->orWhere('card_id', $card->id);
                }),
            'cardEmails' => fn($q) => $q->where('company_id', $card->company_id)
                ->where(function ($query) use ($card) {
                    $query->whereNull('card_id')->orWhere('card_id', $card->id);
                }),
            'cardAddresses' => fn($q) => $q->where('company_id', $card->company_id)
                ->where(function ($query) use ($card) {
                    $query->whereNull('card_id')->orWhere('card_id', $card->id);
                }),
            'cardButtons' => fn($q) => $q->where('company_id', $card->company_id)
                ->where(function ($query) use ($card) {
                    $query->whereNull('card_id')->orWhere('card_id', $card->id);
                }),
        ])->first();

        if (!$company) {
            return response()->json(['message' => 'No company associated with this user'], 404);
        }

        $ip = $request->ip();
        $userAgent = $request->header('User-Agent');

        // Check if already viewed by this IP (for unique view)
        $existingView = CardView::where('card_id', $card->id)
            ->where('ip_address', $ip)
            ->first();

        // Log total view
        CardView::create([
            'card_id' => $card->id,
            'ip_address' => $ip,
            'user_agent' => $userAgent,
            'user_id' => auth()->id(),
        ]);


        return inertia('Cards/Show', [
            'pageType' => 'card',
            'company' => $company,
            'selectedCard' => $card,
            'isSubscriptionActive' => $card->company->owner->hasActiveSubscription(),
        ]);
    }

    public function cardUpdate(Request $request, Card $card)
    {
        $user = Auth::user();

        // ✅ Normalize company id for any user type
        $companyId = $user->isCompany()
            ? $user->companyProfile->id   // if user is a company
            : $user->company_id;           // if user belongs to a company


        // ✅ Now safe comparison
        if (
            !$user->isCompany() && (
                !$user->isEditor() || (int) $card->company_id !== (int) $companyId
            )
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this card.',
            ], 403);
        }

        $validated = $request->validate([
            'profile_image' => 'nullable|image|max:5120',
            'salutation' => 'nullable|string|max:255',
            'title' => 'nullable|string|max:100',
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'position' => 'nullable|string|max:100',
            'degree' => 'nullable|string|max:100',
            'department' => 'nullable|string|max:100',

            // Social Media Links
            'card_social_links' => 'nullable|array',
            'card_social_links.*.icon' => 'required_with:card_social_links|string|max:100',
            'card_social_links.*.url' => 'required_with:card_social_links|url|max:255',
            'card_social_links.*.id' => 'nullable|integer',

            // Phone numbers
            'card_phone_numbers' => 'nullable|array',
            'card_phone_numbers.*.id' => 'nullable|integer',
            'card_phone_numbers.*.phone_number' => 'required_with:card_phone_numbers|string|max:20',
            'card_phone_numbers.*.is_hidden' => 'nullable|boolean',
            'card_phone_numbers.*.type' => 'nullable|string|max:10',

            // Emails
            'card_emails' => 'nullable|array',
            'card_emails.*.id' => 'nullable|integer',
            'card_emails.*.email' => 'required_with:card_emails|email|max:255',
            'card_emails.*.is_hidden' => 'nullable|boolean',
            'card_emails.*.type' => 'nullable|string|max:10',

            // Addresses
            'card_addresses' => 'nullable|array',
            'card_addresses.*.id' => 'nullable|integer',
            'card_addresses.*.street' => 'required_with:card_addresses|string|max:255',
            'card_addresses.*.house_number' => 'nullable|string|max:50',
            'card_addresses.*.zip' => 'nullable|string|max:20',
            'card_addresses.*.city' => 'nullable|string|max:100',
            'card_addresses.*.country' => 'nullable|string|max:100',
            'card_addresses.*.is_hidden' => 'nullable|boolean',
            'card_addresses.*.type' => 'nullable|string|max:10',

            // Buttons
            'card_buttons' => 'nullable|array',
            'card_buttons.*.id' => 'nullable|integer',
            'card_buttons.*.button_text' => 'required_with:card_buttons|string|max:255',
            'card_buttons.*.button_link' => 'required_with:card_buttons|url|max:1000',
            'card_buttons.*.icon' => 'nullable|string|max:50',
        ]);

        $company = $card->company;


        // Handle profile image removal or replacement
        if ($request->boolean('profile_removed')) {
            if ($card->profile_image && Storage::exists($card->profile_image)) {
                Storage::delete($card->profile_image);
            }
            $validated['profile_image'] = null;
        }

        // Handle profile upload
        if ($request->hasFile('profile_image')) {
            if ($card->profile_image && Storage::exists($card->profile_image)) {
                Storage::delete($card->profile_image);
            }
            $path = $request->file('profile_image')->store('card_profiles', 'public');
            $validated['profile_image'] = $path;
        }

        // Save template
        $card->fill($validated);
        $card->company_id = $company->id;
        $card->save();

        /**
         * 🔹 Handle Card Social Links (separate function)
         */
        if ($request->has('card_social_links')) {
            $this->handleCardSocialLinks($company, $request->card_social_links, $card->id);
        }


        /**
         * 🔹 Handle Card Phone Numbers (separate function)
         */
        if ($request->has('card_phone_numbers')) {
            $this->handleCardPhoneNumbers($company, $request->card_phone_numbers, $card->id);
        }


        /**
         * 🔹 Handle Card Phone Numbers (separate function)
         */
        if ($request->has('card_emails')) {
            $this->handleCardEmails($company, $request->card_emails, $card->id);
        }

        /**
         * 🔹 Handle Card Buttons (separate function)
         */
        if ($request->has('card_buttons')) {
            $this->handleCardButtons($company, $request->card_buttons, $card->id);
        }

        /**
         * 🔹 Handle Card Addresses (separate function)
         */
        if ($request->has('card_addresses')) {
            $this->handleCardAddresses($company, $request->card_addresses, $card->id);
        }

        $company = $user->company()->with([
            'cardTemplate', // load normally

            // Fetch both template-level (card_id null) and selected card items
            'cardSocialLinks' => fn($q) => $q->where('company_id', $user->company->id)
                ->where(function ($query) use ($card) {
                    $query->whereNull('card_id')
                        ->orWhere('card_id', $card->id);
                }),
            'cardPhoneNumbers' => fn($q) => $q->where('company_id', $user->company->id)
                ->where(function ($query) use ($card) {
                    $query->whereNull('card_id')
                        ->orWhere('card_id', $card->id);
                }),
            'cardEmails' => fn($q) => $q->where('company_id', $user->company->id)
                ->where(function ($query) use ($card) {
                    $query->whereNull('card_id')
                        ->orWhere('card_id', $card->id);
                }),
            'cardAddresses' => fn($q) => $q->where('company_id', $user->company->id)
                ->where(function ($query) use ($card) {
                    $query->whereNull('card_id')
                        ->orWhere('card_id', $card->id);
                }),
            'cardButtons' => fn($q) => $q->where('company_id', $user->company->id)
                ->where(function ($query) use ($card) {
                    $query->whereNull('card_id')
                        ->orWhere('card_id', $card->id);
                }),
        ])->first();

        return response()->json([
            'success' => true,
            'message' => 'Card updated successfully!',
            'company' => $company,
            'selectedCard' => $card,
        ]);
    }

    public function bulkCardUpdate(Request $request)
    {
        $user = Auth::user();

        // ✅ Now safe comparison
        if (
            !$user->isCompany() && (
                !$user->isEditor()
            )
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this card.',
            ], 403);
        }

        $company = $user->isCompany() ? $user->companyProfile : $user->company;
        $rows = $request->input('cards'); // array of CSV-transformed rows
        if (!is_array($rows) || empty($rows)) {
            return response()->json([
                'success' => false,
                'message' => 'No card data provided.',
            ], 400);
        }

        $missingCodes = [];
        $updatedCards = [];

        foreach ($rows as $index => $row) {
            $cardCode = $row['card_code'] ?? null;
            if (!$cardCode)
                continue;

            // Check if card exists for this company
            $card = $company->cards()->where('code', $cardCode)->first();
            if (!$card) {
                $missingCodes[] = $cardCode;
                continue;
            }

            // Normalize data
            $dataToUpdate = [];
            $fillableFields = ['salutation', 'title', 'first_name', 'last_name', 'degree', 'position', 'department'];
            foreach ($fillableFields as $field) {
                if (!empty($row[$field])) {
                    $dataToUpdate[$field] = $row[$field];
                }
            }

            // ✅ Handle profile image base64 upload
            if (!empty($row['profile_image_base64'])) {
                try {
                    $base64 = $row['profile_image_base64'];
                    if (preg_match('/^data:image\/(\w+);base64,/', $base64, $type)) {
                        $data = substr($base64, strpos($base64, ',') + 1);
                        $type = strtolower($type[1]); // jpg, png, etc.

                        $data = base64_decode($data);
                        if ($data === false) {
                            Log::warning("⚠️ Failed to decode base64 for card {$cardCode}");
                        } else {
                            // Delete old image if exists
                            if ($card->profile_image && Storage::exists($card->profile_image)) {
                                Storage::delete($card->profile_image);
                            }

                            $filename = "card_profiles/{$cardCode}_" . time() . ".{$type}";
                            Storage::disk('public')->put($filename, $data);
                            $dataToUpdate['profile_image'] = $filename;

                            Log::info("✅ Saved profile image for card {$cardCode} at {$filename}");
                        }
                    }
                } catch (\Exception $e) {
                    Log::error("❌ Error saving profile image for card {$cardCode}: {$e->getMessage()}");
                }
            }

            $card->fill($dataToUpdate);
            $card->save();

            // DELETE previous related records
            $card->cardEmails()->delete();
            $card->cardPhoneNumbers()->delete();
            $card->cardAddresses()->delete();
            $card->cardButtons()->delete();
            $card->cardSocialLinks()->delete();

            // Normalize emails
            $emails = [];
            for ($i = 1; $i <= 4; $i++) {
                if (!empty($row["card_email_$i"])) {
                    $emails[] = [
                        'email' => $row["card_email_$i"],
                        'type' => $row["card_email_{$i}_type"] ?? null
                    ];
                }
            }
            if (!empty($emails))
                $this->handleCardEmails($company, $emails, $card->id);

            // Normalize phones
            $phones = [];
            for ($i = 1; $i <= 4; $i++) {
                if (!empty($row["card_phone_$i"])) {
                    $phones[] = [
                        'phone_number' => $row["card_phone_$i"],
                        'type' => $row["card_phone_{$i}_type"] ?? null
                    ];
                }
            }
            if (!empty($phones))
                $this->handleCardPhoneNumbers($company, $phones, $card->id);

            // Normalize addresses
            $addresses = [];
            for ($i = 1; $i <= 4; $i++) {
                // Check if any of the address components exist for this address slot
                if (
                    !empty($row["address_{$i}_street"]) || !empty($row["address_{$i}_house_number"]) ||
                    !empty($row["address_{$i}_zip"]) || !empty($row["address_{$i}_city"])
                ) {

                    $addresses[] = [
                        'street' => $row["address_{$i}_street"] ?? null,
                        'house_number' => $row["address_{$i}_house_number"] ?? null,
                        'zip' => $row["address_{$i}_zip"] ?? null,
                        'city' => $row["address_{$i}_city"] ?? null,
                        'country' => $row["address_{$i}_country"] ?? null,
                        'type' => $row["address_{$i}_type"] ?? null
                    ];
                }
            }
            if (!empty($addresses))
                $this->handleCardAddresses($company, $addresses, $card->id);

            // Normalize buttons
            $buttons = [];
            for ($i = 1; $i <= 4; $i++) {
                if (!empty($row["card_button_text_$i"]) && !empty($row["card_button_link_$i"])) {
                    $buttons[] = [
                        'button_text' => $row["card_button_text_$i"],
                        'button_link' => $row["card_button_link_$i"]
                    ];
                }
            }
            if (!empty($buttons))
                $this->handleCardButtons($company, $buttons, $card->id);

            // Normalize social links
            $socials = [];
            for ($i = 1; $i <= 5; $i++) {
                if (!empty($row["social_link_$i"])) {
                    $socials[] = ['url' => $row["social_link_$i"]];
                }
            }
            if (!empty($socials))
                $this->handleCardSocialLinks($company, $socials, $card->id);

            $updatedCards[] = $cardCode;
        }

        $message = "Updated " . count($updatedCards) . " card(s) successfully.";
        if (!empty($missingCodes)) {
            $message .= " The following codes were not found or do not belong to your company: " . implode(", ", $missingCodes);
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'updated_codes' => $updatedCards,
            'missing_codes' => $missingCodes,
        ]);
    }



    /**
     * Handle create, update, and delete logic for company-level card social links.
     */
    private function handleCardSocialLinks($company, $incomingLinks, $cardId = null)
    {
        $incomingLinks = collect($incomingLinks);

        // Existing links: only those relevant to the given card context
        $existingLinks = $company->cardSocialLinks()
            ->where('company_id', $company->id)
            ->when($cardId !== null, fn($q) => $q->where('card_id', $cardId), fn($q) => $q->whereNull('card_id'))
            ->get();

        // --- CREATE / UPDATE ---
        foreach ($incomingLinks as $linkData) {
            if (!empty($linkData['id'])) {
                $existingLink = $existingLinks->firstWhere('id', $linkData['id']);
                if ($existingLink) {
                    $existingLink->update([
                        'icon' => $linkData['icon'] ?? null,
                        'url' => $linkData['url'] ?? '',
                    ]);
                }
            } else {
                $company->cardSocialLinks()->create([
                    'icon' => $linkData['icon'] ?? null,
                    'url' => $linkData['url'] ?? '',
                    'company_id' => $company->id,
                    'card_id' => $cardId, // only for this card if cardId is provided
                ]);
            }
        }

        // --- DELETE ---
        $incomingIds = $incomingLinks->pluck('id')->filter()->toArray();

        $toDelete = $existingLinks->filter(fn($link) => !in_array($link->id, $incomingIds));

        foreach ($toDelete as $link) {
            $link->delete();
        }
    }


    private function handleCardPhoneNumbers($company, $incomingNumbers, $cardId = null)
    {
        $incomingNumbers = collect($incomingNumbers);



        $existingNumbers = $company->cardPhoneNumbers()
            ->where('company_id', $company->id)
            ->when($cardId !== null, fn($q) => $q->where('card_id', $cardId), fn($q) => $q->whereNull('card_id'))
            ->get();

        // --- CREATE / UPDATE ---
        foreach ($incomingNumbers as $numberData) {
            if (!empty($numberData['id'])) {
                $existingNumber = $existingNumbers->firstWhere('id', $numberData['id']);
                if ($existingNumber) {
                    $existingNumber->update([
                        'phone_number' => $numberData['phone_number'] ?? '',
                        'type' => $numberData['type'] ?? "Work",
                        'is_hidden' => $numberData['is_hidden'] ?? false,
                    ]);
                }
            } else {
                $company->cardPhoneNumbers()->create([
                    'phone_number' => $numberData['phone_number'] ?? '',
                    'type' => $numberData['type'] ?? "Work",
                    'is_hidden' => $numberData['is_hidden'] ?? false,
                    'company_id' => $company->id,
                    'card_id' => $cardId,
                ]);
            }
            Log::info($numberData['type']);
        }

        // --- DELETE ---
        $incomingIds = $incomingNumbers->pluck('id')->filter()->toArray();
        $toDelete = $existingNumbers->filter(fn($number) => !in_array($number->id, $incomingIds));
        foreach ($toDelete as $number) {
            $number->delete();
        }
    }

    private function handleCardEmails($company, $incomingEmails, $cardId = null)
    {
        $incomingEmails = collect($incomingEmails);

        $existingEmails = $company->cardEmails()
            ->where('company_id', $company->id)
            ->when($cardId !== null, fn($q) => $q->where('card_id', $cardId), fn($q) => $q->whereNull('card_id'))
            ->get();

        foreach ($incomingEmails as $emailData) {
            if (!empty($emailData['id'])) {
                $existingEmail = $existingEmails->firstWhere('id', $emailData['id']);
                if ($existingEmail) {
                    $existingEmail->update([
                        'email' => $emailData['email'] ?? '',
                        'type' => $emailData['type'] ?? "Work",
                        'is_hidden' => $emailData['is_hidden'] ?? false,
                    ]);
                }
            } else {
                $company->cardEmails()->create([
                    'email' => $emailData['email'] ?? '',
                    'type' => $emailData['type'] ?? "Work",
                    'is_hidden' => $emailData['is_hidden'] ?? false,
                    'company_id' => $company->id,
                    'card_id' => $cardId,
                ]);
            }
        }

        $incomingIds = $incomingEmails->pluck('id')->filter()->toArray();
        $toDelete = $existingEmails->filter(fn($email) => !in_array($email->id, $incomingIds));
        foreach ($toDelete as $email) {
            $email->delete();
        }
    }

    private function handleCardAddresses($company, $incomingAddresses, $cardId = null)
    {
        $incomingAddresses = collect($incomingAddresses);

        $existingAddresses = $company->cardAddresses()
            ->where('company_id', $company->id)
            ->when($cardId !== null, fn($q) => $q->where('card_id', $cardId), fn($q) => $q->whereNull('card_id'))
            ->get();

        foreach ($incomingAddresses as $addressData) {
            if (!empty($addressData['id'])) {
                $existingAddress = $existingAddresses->firstWhere('id', $addressData['id']);
                if ($existingAddress) {
                    $existingAddress->update([
                        'street' => $addressData['street'] ?? '',
                        'house_number' => $addressData['house_number'] ?? '',
                        'zip' => $addressData['zip'] ?? '',
                        'city' => $addressData['city'] ?? '',
                        'country' => $addressData['country'] ?? '',
                        'type' => $addressData['type'] ?? 'Work',
                        'is_hidden' => $addressData['is_hidden'] ?? false,
                    ]);
                }
            } else {
                $company->cardAddresses()->create([
                    'street' => $addressData['street'] ?? '',
                    'house_number' => $addressData['house_number'] ?? '',
                    'zip' => $addressData['zip'] ?? '',
                    'city' => $addressData['city'] ?? '',
                    'country' => $addressData['country'] ?? '',
                    'type' => $addressData['type'] ?? 'Work',
                    'is_hidden' => $addressData['is_hidden'] ?? false,
                    'company_id' => $company->id,
                    'card_id' => $cardId,
                ]);
            }
        }


        $incomingIds = $incomingAddresses->pluck('id')->filter()->toArray();
        $toDelete = $existingAddresses->filter(fn($address) => !in_array($address->id, $incomingIds));
        foreach ($toDelete as $address) {
            $address->delete();
        }
    }


    private function handleCardButtons($company, $incomingButtons, $cardId = null)
    {
        $incomingButtons = collect($incomingButtons);

        // Fetch existing buttons for this company and either template-level or specific card
        $existingButtons = $company->cardButtons()
            ->where('company_id', $company->id)
            ->when($cardId !== null, fn($q) => $q->where('card_id', $cardId), fn($q) => $q->whereNull('card_id'))
            ->get();

        // --- CREATE / UPDATE ---
        foreach ($incomingButtons as $buttonData) {
            if (!empty($buttonData['id'])) {
                $existingButton = $existingButtons->firstWhere('id', $buttonData['id']);
                if ($existingButton) {
                    $existingButton->update([
                        'button_text' => $buttonData['button_text'] ?? '',
                        'button_link' => $buttonData['button_link'] ?? '',
                        'icon' => $buttonData['icon'] ?? null,
                        'text_color' => $buttonData['text_color'] ?? null,
                        'bg_color' => $buttonData['bg_color'] ?? null,
                    ]);
                }
            } else {
                $company->cardButtons()->create([
                    'button_text' => $buttonData['button_text'] ?? '',
                    'button_link' => $buttonData['button_link'] ?? '',
                    'icon' => $buttonData['icon'] ?? null,
                    'text_color' => $buttonData['text_color'] ?? null,
                    'bg_color' => $buttonData['bg_color'] ?? null,
                    'company_id' => $company->id,
                    'card_id' => $cardId,
                ]);
            }
        }

        // --- DELETE ---
        $incomingIds = $incomingButtons->pluck('id')->filter()->toArray();
        $toDelete = $existingButtons->filter(fn($btn) => !in_array($btn->id, $incomingIds));
        foreach ($toDelete as $button) {
            $button->delete();
        }
    }

}
