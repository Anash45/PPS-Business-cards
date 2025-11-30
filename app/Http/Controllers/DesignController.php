<?php

namespace App\Http\Controllers;

use App\Helpers\CardHelper;
use App\Jobs\BulkCardWalletSyncJob;
use App\Models\Card;
use App\Models\CardView;
use App\Models\CardWalletDetail;
use App\Models\CompanyCardTemplate;
use App\Models\NfcCard;
use App\Traits\LoadsCompanyDesignData;
use Http;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Log;

class DesignController extends Controller
{

    use LoadsCompanyDesignData;

    /**
     * Display the current company design template.
     */
    public function index()
    {
        $user = Auth::user();

        if (!$user->isCompany() && !$user->isTemplateEditor()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $company = $this->getCompanyWithDesignData($user);

        if (!$company) {
            return response()->json(['message' => 'No company associated with this user'], 404);
        }

        $isSubscriptionActive = $user->isCompany()
            ? $user->hasActiveSubscription()
            : ($user->isTemplateEditor()
                ? optional(optional($user->company)->owner)->hasActiveSubscription()
                : false);

        return inertia('Design/Index', [
            'pageType' => "template",
            'company' => $company,
            'card' => null,
            'isSubscriptionActive' => $isSubscriptionActive,
        ]);
    }




    public function createOrUpdate(Request $request)
    {
        $user = Auth::user();

        // ✅ Allow both company and editor
        if (!$user->isCompany() && !$user->isTemplateEditor()) {
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
            'contact_btn_text' => 'nullable|string|max:255',
            'contact_btn_text_de' => 'nullable|string|max:255',
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
            'website_bg_color' => 'nullable|string|max:100',
            'website_text_color' => 'nullable|string|max:100',
            'buttons_size' => 'nullable|string|max:2',

            // Social Media Links
            'card_social_links' => 'nullable|array',
            'card_social_links.*.icon' => 'nullable|string|max:100',
            'card_social_links.*.url' => 'required_with:card_social_links|url|max:255',
            'card_social_links.*.id' => 'nullable|integer',

            // Phone numbers
            'card_phone_numbers' => 'nullable|array',
            'card_phone_numbers.*.id' => 'nullable|integer',
            'card_phone_numbers.*.icon' => 'nullable|string|max:255',
            'card_phone_numbers.*.label' => 'nullable|string|max:255',
            'card_phone_numbers.*.label_de' => 'nullable|string|max:255',
            'card_phone_numbers.*.phone_number' => 'required_with:card_phone_numbers|string|max:20',
            'card_phone_numbers.*.is_hidden' => 'nullable|boolean',
            'card_phone_numbers.*.type' => 'nullable|string|max:10',

            // Emails
            'card_emails' => 'nullable|array',
            'card_emails.*.id' => 'nullable|integer',
            'card_emails.*.label' => 'nullable|string|max:255',
            'card_emails.*.label_de' => 'nullable|string|max:255',
            'card_emails.*.email' => 'required_with:card_emails|email|max:255',
            'card_emails.*.is_hidden' => 'nullable|boolean',
            'card_emails.*.type' => 'nullable|string|max:10',

            // Websites
            'card_websites' => 'nullable|array',
            'card_websites.*.icon' => 'nullable|string|max:50',
            'card_websites.*.id' => 'nullable|integer',
            'card_websites.*.label' => 'nullable|string|max:255',
            'card_websites.*.label_de' => 'nullable|string|max:255',
            'card_websites.*.url' => 'required_with:card_websites|url|max:255',
            'card_websites.*.is_hidden' => 'nullable|boolean',

            // Addresses
            'card_addresses' => 'nullable|array',
            'card_addresses.*.id' => 'nullable|integer',
            'card_addresses.*.label' => 'nullable|string|max:255',
            'card_addresses.*.label_de' => 'nullable|string|max:255',
            'card_addresses.*.street' => 'required_with:card_addresses|string|max:255',
            'card_addresses.*.house_number' => 'nullable|string|max:50',
            'card_addresses.*.zip' => 'nullable|string|max:20',
            'card_addresses.*.city' => 'nullable|string|max:100',
            'card_addresses.*.country' => 'nullable|string|max:100',
            'card_addresses.*.map_link' => 'nullable|url|max:255',
            'card_addresses.*.is_hidden' => 'nullable|boolean',
            'card_addresses.*.type' => 'nullable|string|max:10',

            // Buttons
            'card_buttons' => 'nullable|array',
            'card_buttons.*.id' => 'nullable|integer',
            'card_buttons.*.button_text' => 'required_with:card_buttons|string|max:255',
            'card_buttons.*.button_text_de' => 'nullable|string|max:255',
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

        // ✅ Social Links
        if ($request->has('card_social_links')) {
            $this->handleCardSocialLinks($company, $request->card_social_links);
        } else {
            $company->cardSocialLinks()->whereNull('card_id')->delete();
        }

        // ✅ Phone Numbers
        if ($request->has('card_phone_numbers')) {
            $this->handleCardPhoneNumbers($company, $request->card_phone_numbers);
        } else {
            $company->cardPhoneNumbers()->whereNull('card_id')->delete();
        }

        // ✅ Emails
        if ($request->has('card_emails')) {
            $this->handleCardEmails($company, $request->card_emails);
        } else {
            $company->cardEmails()->whereNull('card_id')->delete();
        }

        // ✅ Buttons
        if ($request->has('card_buttons')) {
            $this->handleCardButtons($company, $request->card_buttons);
        } else {
            $company->cardButtons()->whereNull('card_id')->delete();
        }

        // ✅ Addresses
        if ($request->has('card_addresses')) {
            $this->handleCardAddresses($company, incomingAddresses: $request->card_addresses);
        } else {
            $company->cardAddresses()->whereNull('card_id')->delete();
        }

        // ✅ Websites
        if ($request->has('card_websites')) {
            $this->handleCardWebsites($company, $request->card_websites);
        } else {
            $company->cardWebsites()->whereNull('card_id')->delete();
        }

        // ✅ Reload updated company data
        $company = $company->load([
            'cardTemplate',
            'cardSocialLinks' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
            'cardPhoneNumbers' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
            'cardEmails' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
            'cardAddresses' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
            'cardWebsites' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
            'cardButtons' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Template ' . ($template->wasRecentlyCreated ? 'created' : 'updated') . ' successfully!',
            'company' => $company,
            'selectedCard' => null,
        ]);
    }

    public function templateWalletUpdate(Request $request)
    {
        $user = Auth::user();

        // ✅ Allow both company and editor
        if (!$user->isCompany() && !$user->isTemplateEditor()) {
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
            'wallet_logo_image' => 'nullable|image|max:5120',
            'company_name' => 'required|string|max:255',
            'wallet_title' => 'nullable|string|max:100',
            'wallet_bg_color' => 'nullable|string|max:100',
            'wallet_text_color' => 'nullable|string|max:100',
            'wallet_label_1' => 'nullable|string|max:100',
            'wallet_label_2' => 'nullable|string|max:100',
            'wallet_label_3' => 'nullable|string|max:100',
            'wallet_qr_caption' => 'nullable|string|max:18',
        ]);

        // ✅ Get or create template
        $template = CompanyCardTemplate::firstOrNew(['company_id' => $company->id]);

        // ✅ Handle banner removal
        if ($request->boolean('wallet_logo_removed')) {
            if ($template->wallet_logo_image && Storage::exists($template->wallet_logo_image)) {
                Storage::delete($template->wallet_logo_image);
            }
            $validated['wallet_logo_image'] = null;
        }

        // ✅ Handle new banner upload
        if ($request->hasFile('wallet_logo_image')) {
            if ($template->wallet_logo_image && Storage::exists($template->wallet_logo_image)) {
                Storage::delete($template->wallet_logo_image);
            }
            $path = $request->file('wallet_logo_image')->store('company_logos', 'public');
            $validated['wallet_logo_image'] = $path;
        }

        // ✅ Save template
        $template->fill($validated);
        $template->company_id = $company->id;
        $template->save();


        // ✅ Reload updated company data
        $company = $company->load([
            'cardTemplate',
            'cardSocialLinks' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
            'cardPhoneNumbers' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
            'cardEmails' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
            'cardAddresses' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
            'cardWebsites' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
            'cardButtons' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Template ' . ($template->wasRecentlyCreated ? 'created' : 'updated') . ' successfully!',
            'company' => $company,
            'selectedCard' => null,
        ]);
    }

    public function cardWalletUpdate(Card $card)
    {
        $user = Auth::user();

        // ✅ Only allow company, editor, or template_editor
        if (!$user->isCompany() && !in_array($user->role, ['editor', 'template_editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Only allowed users can perform this action.',
            ], 403);
        }

        $company = $user->isCompany() ? $user->companyProfile : $user->company;
        if (!$company) {
            return response()->json([
                'success' => false,
                'message' => 'No company associated with this user.',
            ], 404);
        }
        // Check if card is eligible for sync
        if (!$card->is_eligible_for_sync['eligible']) {
            return response()->json([
                'success' => false,
                'error_code' => 'CARD_NOT_ELIGIBLE',
                'message' => 'This card is missing required fields and cannot be synced.',
                'missing_fields' => $card->is_eligible_for_sync['missing_fields'],
            ], 422); // Unprocessable Entity
        }

        // Check if already synced
        if ($card->wallet_status["status"] === 'synced') {
            return response()->json([
                'success' => false,
                'error_code' => 'ALREADY_SYNCED',
                'message' => 'This card is already synced to the wallet.',
            ], 409); // Conflict
        }

        try {
            $wallet = $this->buildCardWalletFromCardApi($card);

            return response()->json([
                'success' => true,
                'message' => 'Card Wallet updated successfully!',
                'data' => ['card_wallet' => $wallet],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed: ' . $e->getMessage(),
            ], 422);
        }
    }

    public function cardWalletBulkUpdate(Request $request)
    {
        $cardIds = $request->ids ?? [];
        $user = Auth::user();

        // ✅ Only allow company, editor, or template_editor
        if (!$user->isCompany() && !in_array($user->role, ['editor', 'template_editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Only allowed users can perform this action.',
            ], 403);
        }

        $company = $user->isCompany() ? $user->companyProfile : $user->company;
        if (!$company) {
            return response()->json([
                'success' => false,
                'message' => 'No company associated with this user.',
            ], 404);
        }

        $cards = Card::whereIn('id', $cardIds)->get();
        $errors = [];

        // ✅ First pass: collect all errors
        foreach ($cards as $card) {
            $cardErrors = [];

            if (!$card->is_eligible_for_sync['eligible']) {
                $cardErrors[] = [
                    'error_code' => 'CARD_NOT_ELIGIBLE',
                    'message' => 'This card is missing required fields and cannot be synced.',
                    'missing_fields' => $card->is_eligible_for_sync['missing_fields'],
                ];
            }

            if ($card->wallet_status['status'] === 'synced') {
                $cardErrors[] = [
                    'error_code' => 'ALREADY_SYNCED',
                    'message' => 'This card is already synced to the wallet.',
                ];
            }

            if (!empty($cardErrors)) {
                $errors[$card->id] = $cardErrors;
            }
        }

        // ✅ If any errors exist, return them without updating
        if (!empty($errors)) {
            return response()->json([
                'success' => false,
                'message' => 'Some cards cannot be synced due to errors.',
                'errors' => $errors,
            ], 422);
        }

        // ✅ No errors, proceed to update all cards
        $results = [];
        foreach ($cards as $card) {
            try {
                $wallet = $this->buildCardWalletFromCardApi($card);
                $results[$card->id] = [
                    'success' => true,
                    'data' => ['card_wallet' => $wallet],
                ];
            } catch (\Exception $e) {
                $results[$card->id] = [
                    'success' => false,
                    'error_code' => 'SYNC_FAILED',
                    'message' => 'Failed: ' . $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'All cards processed successfully.',
            'results' => $results,
        ]);
    }

    public function cardWalletBulkUpdateBackground(Request $request)
    {
        $cardIds = $request->ids ?? [];
        $user = Auth::user();

        Log::info("cardWalletBulkUpdateBackground called by user {$user->id} with cards: " . json_encode($cardIds));

        // Only allowed roles
        if (!$user->isCompany() && !in_array($user->role, ['editor', 'template_editor'])) {
            Log::warning("Unauthorized access attempt by user {$user->id}");
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Only allowed users can perform this action.',
            ], 403);
        }

        $company = $user->isCompany() ? $user->companyProfile : $user->company;
        if (!$company) {
            Log::warning("User {$user->id} has no company associated");
            return response()->json([
                'success' => false,
                'message' => 'No company associated with this user.',
            ], 404);
        }

        // Prevent starting another job if any card for this company is already syncing
        $alreadySyncing = Card::whereIn('id', $cardIds)->where('is_syncing', true)->exists();
        if ($alreadySyncing) {
            Log::info("Background sync aborted: a job is already running for company {$company->id}");
            return response()->json([
                'success' => false,
                'message' => 'A sync is already in progress for some of these cards.',
            ], 409);
        }

        $cards = Card::whereIn('id', $cardIds)->get();
        $errors = [];

        // Validate each card
        foreach ($cards as $card) {
            $cardErrors = [];

            if (!$card->is_eligible_for_sync['eligible']) {
                $cardErrors[] = [
                    'error_code' => 'CARD_NOT_ELIGIBLE',
                    'message' => 'This card is missing required fields and cannot be synced.',
                    'missing_fields' => $card->is_eligible_for_sync['missing_fields'],
                ];
            }

            if ($card->wallet_status['status'] === 'synced') {
                $cardErrors[] = [
                    'error_code' => 'ALREADY_SYNCED',
                    'message' => 'This card is already synced to the wallet.',
                ];
            }

            if (!empty($cardErrors)) {
                $errors[$card->id] = $cardErrors;
                Log::info("Card {$card->id} cannot be synced: " . json_encode($cardErrors));
            }
        }

        if (!empty($errors)) {
            Log::info("Background sync aborted due to errors for user {$user->id}");
            return response()->json([
                'success' => false,
                'message' => 'Some cards cannot be synced due to errors.',
                'errors' => $errors,
            ], 422);
        }

        // Mark cards as syncing
        Card::whereIn('id', $cards->pluck('id'))->update(['is_syncing' => true]);
        Log::info("Marked cards as is_syncing for background processing: " . json_encode($cards->pluck('id')->toArray()));

        // Dispatch job
        BulkCardWalletSyncJob::dispatch($cards->pluck('id')->toArray(), $company->id);

        Log::info("Dispatched BulkCardWalletSyncJob for cards: " . json_encode($cards->pluck('id')->toArray()));

        return response()->json([
            'success' => true,
            'message' => 'Card sync scheduled in background.',
        ]);
    }


    // CardController.php
    public function syncStatus()
    {
        $user = auth()->user();
        $companyId = $user->isCompany()
            ? $user->companyProfile->id
            : $user->company->id ?? null;

        if (!$companyId) {
            return response()->json([
                'all_synced' => true,
                'synced_employees' => []
            ]);
        }

        // Fetch employees (Cards) for this company
        $employees = Card::where('company_id', $companyId)->get();

        // Check if all are synced
        $allSynced = $employees->every(fn($emp) => !$emp->is_syncing);

        // Include wallet_status accessor for synced employees
        $syncedEmployees = $employees->filter(fn($emp) => !$emp->is_syncing)
            ->map(fn($emp) => [
                'id' => $emp->id,
                'wallet_status' => $emp->wallet_status, // accessor used here
            ])
            ->values();

        return response()->json([
            'all_synced' => $allSynced,
            'synced_employees' => $syncedEmployees,
        ]);
    }


    public function buildCardWalletFromCardApi(Card $card): CardWalletDetail
    {
        $card->loadMissing(['company.cardTemplate']);
        $template = $card->company?->cardTemplate;

        if (!$template) {
            throw new \Exception('Card template not found for the associated company.');
        }

        // ✅ Validate template fields
        $requiredTemplateFields = [
            'company_name',
            'wallet_bg_color',
            'wallet_text_color',
            'wallet_label_1',
            'wallet_label_2',
            'wallet_label_3',
            'wallet_qr_caption',
            'wallet_logo_image',
        ];
        foreach ($requiredTemplateFields as $field) {
            if (empty($template->$field)) {
                throw new \Exception("Missing required template field: {$field}");
            }
        }

        // ✅ Validate card fields
        $requiredCardFields = ['first_name', 'last_name', 'position', 'primary_email', 'profile_image'];
        foreach ($requiredCardFields as $field) {
            if (empty($card->$field)) {
                throw new \Exception("Missing required card field: {$field}");
            }
        }

        // ✅ Upload images only if new or changed
        $userImageFileId = null;
        $companyLogoFileId = null;

        // Check if CardWallet exists
        $cardWallet = CardWalletDetail::where('card_id', $card->id)->first();

        Log::info('🪪 Starting image handling for Card Wallet', [
            'card_id' => $card->id,
            'has_existing_wallet' => (bool) $cardWallet,
            'profile_image' => $card->profile_image,
            'template_logo' => $template->wallet_logo_image,
        ]);

        // ✅ Handle User Image
        if ($cardWallet && $card->profile_image === $cardWallet->user_image) {
            // No need to upload again
            $userImageFileId = $cardWallet->user_image_string;
            Log::info('✅ Reusing existing user image file ID', [
                'card_id' => $card->id,
                'user_image_string' => $userImageFileId,
            ]);
        } else {
            Log::info('📤 Uploading new user image to PPS Wallet', [
                'card_id' => $card->id,
                'reason' => $cardWallet ? 'Image changed' : 'New wallet record',
            ]);
            $userImageBase64 = $this->imageToBase64($card->profile_image);
            if ($userImageBase64) {
                $userUpload = $this->uploadImageToWalletApi($userImageBase64);
                $userImageFileId = $userUpload['file_id'] ?? null;
                Log::info('✅ User image upload response', [
                    'card_id' => $card->id,
                    'api_response' => $userUpload,
                    'file_id' => $userImageFileId,
                ]);
            } else {
                Log::warning('⚠️ Failed to convert user image to Base64', [
                    'card_id' => $card->id,
                ]);
            }
        }

        // ✅ Handle Company Logo Upload Optimization
        $companyLogoFileId = null;

        if ($cardWallet && $template->wallet_logo_image === $cardWallet->company_logo) {
            $companyLogoFileId = $cardWallet->company_logo_string;
            Log::info('✅ Reusing existing company logo file ID (same as current template)', [
                'card_id' => $card->id,
                'company_logo_string' => $companyLogoFileId,
            ]);
        } else {
            // If not, check if another card from the same company already has it uploaded
            $existingLogoWallet = CardWalletDetail::whereIn('card_id', function ($query) use ($template) {
                $query->select('id')
                    ->from('cards')
                    ->where('company_id', $template->company_id);
            })
                ->where('company_logo', $template->wallet_logo_image)
                ->whereNotNull('company_logo_string')
                ->first();

            if ($existingLogoWallet) {
                $companyLogoFileId = $existingLogoWallet->company_logo_string;
                Log::info('♻️ Reusing company logo from another card', [
                    'card_id' => $card->id,
                    'source_card_id' => $existingLogoWallet->card_id,
                    'company_logo_string' => $companyLogoFileId,
                ]);
            } else {
                Log::info('📤 Uploading new company logo to PPS Wallet', [
                    'card_id' => $card->id,
                    'company_id' => $template->company_id,
                ]);
                $companyLogoBase64 = $this->imageToBase64($template->wallet_logo_image);
                if ($companyLogoBase64) {
                    $logoUpload = $this->uploadImageToWalletApi($companyLogoBase64);
                    $companyLogoFileId = $logoUpload['file_id'] ?? null;
                    Log::info('✅ Company logo upload response', [
                        'card_id' => $card->id,
                        'api_response' => $logoUpload,
                        'file_id' => $companyLogoFileId,
                    ]);
                } else {
                    Log::warning('⚠️ Failed to convert company logo to Base64', [
                        'card_id' => $card->id,
                    ]);
                }
            }
        }

        // ✅ Get or create local card wallet record
        $cardWallet = CardWalletDetail::firstOrNew(['card_id' => $card->id]);

        // ✅ Prepare vars for pass creation
        $vars = [
            'var1' => env('LINK_URL') . '/card/' . $card->code,
            'var2' => $template->wallet_qr_caption,
            'var3' => $template->wallet_label_1,
            'var4' => trim(implode(' ', array_filter([$card->salutation, $card->title, $card->first_name, $card->last_name]))),
            'var5' => $template->wallet_label_2,
            'var6' => $template->company_name,
            'var7' => $template->wallet_label_3,
            'var8' => $card->position,
            'var9' => $template->wallet_title,
        ];

        // ✅ Prepare payload
        $payload = [
            'template_id' => 88419,
            'email_to' => $card->primary_email,
            'google_pass' => [
                'img_hero' => $userImageFileId,
                'img_logo' => $companyLogoFileId,
                'background_color' => $template->wallet_bg_color,
            ],
            'apple_pass' => [
                'img_hero' => $userImageFileId,
                'img_logo' => $companyLogoFileId,
                'img_thumbnail' => $userImageFileId,
                'background_color' => $template->wallet_bg_color,
                'foreground_color' => $template->wallet_text_color,
                'label_color' => $template->wallet_text_color,
            ],
            'vars' => $vars,
        ];

        $isUpdate = !empty($cardWallet->pass_id);
        $apiUrl = $isUpdate ? 'https://api.ppswallet.de/pass/update' : 'https://api.ppswallet.de/pass/create';

        $response = Http::withHeaders([
                    'api-key-id' => env('PPS_API_KEY_ID'),
                    'api-key-secret' => env('PPS_API_KEY_SECRET'),
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ])->{$isUpdate ? 'post' : 'post'}($apiUrl, $isUpdate ? array_merge($payload, ['id' => $cardWallet->pass_id]) : $payload);

        Log::info('Wallet Pass API Response', [
            'card_id' => $card->id,
            'is_update' => $isUpdate,
            'payload' => $payload,
            'response' => $response->body(),
        ]);

        if ($response->failed()) {
            throw new \Exception('PPS Wallet API request failed: ' . $response->body());
        }

        $data = $response->json();
        if (($data['message'] ?? '') !== 'success') {
            throw new \Exception('Unexpected PPS Wallet API response: ' . json_encode($data));
        }

        Log::info($data);

        // ✅ Save or update wallet record
        $cardWallet->fill([
            'card_id' => $card->id,
            'pass_id' => $data['pass_id'] ?? $cardWallet->pass_id,
            'template_id' => 88260,
            'company_logo' => $template->wallet_logo_image,
            'wallet_email' => $card->primary_email,
            'user_image' => $card->profile_image,
            'company_logo_string' => $companyLogoFileId,
            'user_image_string' => $userImageFileId,
            'bg_color' => $template->wallet_bg_color,
            'text_color' => $template->wallet_text_color,
            'card_code' => $data['serial_number'] ?? null,
            'qr_caption' => $vars['var2'],
            'label_1' => $vars['var3'],
            'label_1_value' => $vars['var4'],
            'label_2' => $vars['var5'],
            'label_2_value' => $vars['var6'],
            'label_3' => $vars['var7'],
            'label_3_value' => $vars['var8'],
            'wallet_title' => $vars['var9'],
            'download_link' => $data['download_link'] ?? 'Hiiiii',
            'is_syncing' => 0,
        ]);

        $cardWallet->save();

        return $cardWallet;
    }





    /**
     * Convert image (local or URL) to Base64 string.
     */
    private function imageToBase64(?string $imagePath): ?string
    {
        if (empty($imagePath)) {
            Log::warning('imageToBase64 called with empty path.');
            return null;
        }

        try {
            // ✅ If it's a full URL (http/https)
            if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
                $imageData = file_get_contents($imagePath);
            } else {
                // ✅ Normalize and get file contents from Laravel storage
                $normalizedPath = ltrim($imagePath, '/');
                if (Storage::disk('public')->exists($normalizedPath)) {
                    $imageData = Storage::disk('public')->get($normalizedPath);
                } else {
                    // ✅ Try full path as fallback (in case already absolute)
                    $fullPath = storage_path('app/public/' . $normalizedPath);
                    if (file_exists($fullPath)) {
                        $imageData = file_get_contents($fullPath);
                    } else {
                        throw new \Exception("File not found in storage: {$imagePath}");
                    }
                }
            }

            return base64_encode($imageData);
        } catch (\Exception $e) {
            Log::error('Failed to convert image to Base64', [
                'path' => $imagePath,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }


    /**
     * Upload Base64 image to PPS Wallet API and return file_id.
     */
    private function uploadImageToWalletApi($base64String)
    {
        if (!$base64String) {
            return [
                'success' => false,
                'message' => 'Missing base64 string for image upload.',
            ];
        }

        try {
            $response = Http::withHeaders([
                'api-key-id' => env('PPS_API_KEY_ID'),
                'api-key-secret' => env('PPS_API_KEY_SECRET'),
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->post('https://api.ppswallet.de/file/upload', [
                        'base64_file' => $base64String,
                    ]);

            Log::info('Wallet File Upload Response', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            if ($response->failed()) {
                return [
                    'success' => false,
                    'message' => 'Wallet upload failed.',
                    'status' => $response->status(),
                    'response' => $response->json(),
                ];
            }

            $data = $response->json();
            if (($data['message'] ?? '') !== 'success' || empty($data['file_id'])) {
                return [
                    'success' => false,
                    'message' => 'Invalid API response from PPS Wallet.',
                    'response' => $data,
                ];
            }

            return [
                'success' => true,
                'file_id' => $data['file_id'],
            ];

        } catch (\Exception $e) {
            Log::error('Error uploading to Wallet API: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error uploading to Wallet API: ' . $e->getMessage(),
            ];
        }
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
                !in_array($user->role, ['editor', 'template_editor']) || (int) $card->company_id !== (int) $companyId
            )
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this card.',
            ], 403);
        }

        // ✅ Determine correct company reference
        $companyRef = $user->isCompany() ? $user->companyProfile : $user->company;

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
                'cardWebsites' => fn($q) => $q->where('company_id', $companyRef->id)
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

        $walletStatus = $card->wallet_status;
        $walletEligibility = $card->is_eligible_for_sync;
        $card->load(['cardWallet']);

        return inertia('Design/Index', [
            'pageType' => 'card',
            'company' => $company,
            'selectedCard' => $card,
            'wallet_eligibility' => $walletEligibility,
            'wallet_status' => $walletStatus,
            'isSubscriptionActive' => $company->owner->hasActiveSubscription(),
        ]);
    }

    public function cardShow($qrCode, Request $request)
    {
        $ip = $request->ip();
        $userAgent = $request->header('User-Agent');

        // Try to find NFC card first
        $nfcCard = NfcCard::with('card')->where('qr_code', $qrCode)->first();

        $associatedCard = null;
        if ($nfcCard && $nfcCard->card) {
            // NFC found
            $associatedCard = $nfcCard->card;
        } else {
            // Fallback: normal Card by code
            $associatedCard = Card::where('code', $qrCode)->firstOrFail();
            $nfcCard = null;
        }

        // Load company via associated card
        $company = $associatedCard->company()->with([
            'cardTemplate',
            'cardSocialLinks' => fn($q) => $q->where('company_id', $associatedCard->company_id)
                ->where(fn($query) => $query->whereNull('card_id')->orWhere('card_id', $associatedCard->id)),
            'cardPhoneNumbers' => fn($q) => $q->where('company_id', $associatedCard->company_id)
                ->where(fn($query) => $query->whereNull('card_id')->orWhere('card_id', $associatedCard->id)),
            'cardEmails' => fn($q) => $q->where('company_id', $associatedCard->company_id)
                ->where(fn($query) => $query->whereNull('card_id')->orWhere('card_id', $associatedCard->id)),
            'cardAddresses' => fn($q) => $q->where('company_id', $associatedCard->company_id)
                ->where(fn($query) => $query->whereNull('card_id')->orWhere('card_id', $associatedCard->id)),
            'cardWebsites' => fn($q) => $q->where('company_id', $associatedCard->company_id)
                ->where(fn($query) => $query->whereNull('card_id')->orWhere('card_id', $associatedCard->id)),
            'cardButtons' => fn($q) => $q->where('company_id', $associatedCard->company_id)
                ->where(fn($query) => $query->whereNull('card_id')->orWhere('card_id', $associatedCard->id)),
        ])->firstOrFail();

        // Increment NFC views if NFC card exists
        if ($nfcCard) {
            $nfcCard->increment('views');
        }

        // Log CardView
        if ($associatedCard) {
            CardView::create([
                'card_id' => $associatedCard->id,
                'ip_address' => $ip,
                'user_agent' => $userAgent,
                'user_id' => auth()->id(),
            ]);
        }

        // Determine selected card
        $selectedCard = $nfcCard?->status === 'active' ? $associatedCard : $associatedCard;

        // Meta info
        $companyName = $company->cardTemplate->company_name ?? null;

        // Build name
        $nameParts = array_filter([
            $selectedCard?->title ?? null,
            $selectedCard?->first_name ?? null,
            $selectedCard?->last_name ?? null,
        ], fn($v) => $v && trim($v));

        $name = $nameParts ? trim(implode(' ', $nameParts)) : null;

        // Build full title
        $fullTitle = '';

        // Add name if exists
        if ($name) {
            $fullTitle .= $name;
        }

        // Add company name with |
        if ($companyName) {
            $fullTitle .= $name ? ' | ' . $companyName : $companyName;
        }

        // Add fixed suffix - only if something before it exists
        $fullTitle .= $fullTitle ? ' - PPS Business Cards' : 'PPS Business Cards';

        $meta = [
            'title' => $fullTitle,
            'description' => ($selectedCard?->position || $selectedCard?->department)
                ? trim(strip_tags(
                    $selectedCard->position .
                    (($selectedCard->position && $selectedCard->department) ? ' - ' : '') .
                    $selectedCard->department
                ))
                : 'Get in touch via my digital business card.',
            'image' => $selectedCard?->profile_image
                ? '/storage/' . $selectedCard->profile_image
                : ($company->profile_image ?? '/assets/images/profile-placeholder.png'),
            'url' => request()->fullUrl(),
        ];


        return inertia('Cards/Show', [
            'pageType' => 'card',
            'company' => $company,
            'selectedCard' => $selectedCard,
            'nfcCard' => $nfcCard,
            'isSubscriptionActive' => $company->owner->hasActiveSubscription(),
        ])->withViewData(['meta' => $meta]);
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
                !in_array($user->role, ['editor', 'template_editor']) || (int) $card->company_id !== (int) $companyId
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
            'primary_email' => 'nullable|email|max:100',
            'position' => 'nullable|string|max:255',
            'degree' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'position_de' => 'nullable|string|max:255',
            'degree_de' => 'nullable|string|max:255',
            'department_de' => 'nullable|string|max:255',
            'internal_employee_number' => 'nullable|string|max:100',

            // Social Media Links
            'card_social_links' => 'nullable|array',
            'card_social_links.*.icon' => 'nullable|string|max:100',
            'card_social_links.*.url' => 'required_with:card_social_links|url|max:255',
            'card_social_links.*.id' => 'nullable|integer',

            // Phone numbers
            'card_phone_numbers' => 'nullable|array',
            'card_phone_numbers.*.id' => 'nullable|integer',
            'card_phone_numbers.*.icon' => 'nullable|string|max:255',
            'card_phone_numbers.*.label' => 'nullable|string|max:255',
            'card_phone_numbers.*.label_de' => 'nullable|string|max:255',
            'card_phone_numbers.*.phone_number' => 'required_with:card_phone_numbers|string|max:20',
            'card_phone_numbers.*.is_hidden' => 'nullable|boolean',
            'card_phone_numbers.*.type' => 'nullable|string|max:10',

            // Emails
            'card_emails' => 'nullable|array',
            'card_emails.*.id' => 'nullable|integer',
            'card_emails.*.label' => 'nullable|string|max:255',
            'card_emails.*.label_de' => 'nullable|string|max:255',
            'card_emails.*.email' => 'required_with:card_emails|email|max:255',
            'card_emails.*.is_hidden' => 'nullable|boolean',
            'card_emails.*.type' => 'nullable|string|max:10',

            // Websites
            'card_websites' => 'nullable|array',
            'card_websites.*.icon' => 'nullable|string|max:50',
            'card_websites.*.id' => 'nullable|integer',
            'card_websites.*.label' => 'nullable|string|max:255',
            'card_websites.*.label_de' => 'nullable|string|max:255',
            'card_websites.*.url' => 'required_with:card_websites|url|max:255',
            'card_websites.*.is_hidden' => 'nullable|boolean',

            // Addresses
            'card_addresses' => 'nullable|array',
            'card_addresses.*.id' => 'nullable|integer',
            'card_addresses.*.label' => 'nullable|string|max:255',
            'card_addresses.*.label_de' => 'nullable|string|max:255',
            'card_addresses.*.street' => 'required_with:card_addresses|string|max:255',
            'card_addresses.*.house_number' => 'nullable|string|max:50',
            'card_addresses.*.zip' => 'nullable|string|max:20',
            'card_addresses.*.city' => 'nullable|string|max:100',
            'card_addresses.*.country' => 'nullable|string|max:100',
            'card_addresses.*.map_link' => 'nullable|url|max:255',
            'card_addresses.*.is_hidden' => 'nullable|boolean',
            'card_addresses.*.type' => 'nullable|string|max:10',

            // Buttons
            'card_buttons' => 'nullable|array',
            'card_buttons.*.id' => 'nullable|integer',
            'card_buttons.*.button_text' => 'required_with:card_buttons|string|max:255',
            'card_buttons.*.button_text_de' => 'nullable|string|max:255',
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
         * 🔹 Handle Card Social Links
         */
        if ($request->has('card_social_links')) {
            $this->handleCardSocialLinks($company, $request->card_social_links, $card->id);
        } else {
            $company->cardSocialLinks()
                ->where('card_id', $card->id)
                ->delete();
        }

        /**
         * 🔹 Handle Card Phone Numbers
         */
        if ($request->has('card_phone_numbers')) {
            $this->handleCardPhoneNumbers($company, $request->card_phone_numbers, $card->id);
        } else {
            $company->cardPhoneNumbers()
                ->where('card_id', $card->id)
                ->delete();
        }

        /**
         * 🔹 Handle Card Emails
         */
        if ($request->has('card_emails')) {
            $this->handleCardEmails($company, $request->card_emails, $card->id);
        } else {
            $company->cardEmails()
                ->where('card_id', $card->id)
                ->delete();
        }

        /**
         * 🔹 Handle Card Buttons
         */
        if ($request->has('card_buttons')) {
            $this->handleCardButtons($company, $request->card_buttons, $card->id);
        } else {
            $company->cardButtons()
                ->where('card_id', $card->id)
                ->delete();
        }

        /**
         * 🔹 Handle Card Addresses
         */
        if ($request->has('card_addresses')) {
            $this->handleCardAddresses($company, $request->card_addresses, $card->id);
        } else {
            $company->cardAddresses()
                ->where('card_id', $card->id)
                ->delete();
        }

        /**
         * 🔹 Handle Card Websites
         */
        if ($request->has('card_websites')) {
            $this->handleCardWebsites($company, $request->card_websites, $card->id);
        } else {
            $company->cardWebsites()
                ->where('card_id', $card->id)
                ->delete();
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
            'cardWebsites' => fn($q) => $q->where('company_id', $user->company->id)
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

        if ($card->last_email_sent === null) {
            CardHelper::sendCardEmail($card->id);
        }

        // Check if card is eligible for sync
        if (!$card->is_eligible_for_sync['eligible']) {
            return response()->json([
                'success' => true,
                'error_code' => 'CARD_NOT_ELIGIBLE',
                'message' => 'Employee updated but cannot be synced with wallet pass because required fields are missing.',
                'missing_fields' => $card->is_eligible_for_sync['missing_fields'],
                'company' => $company,
                'selectedCard' => $card,
            ], 200);
        }

        // Check if already synced
        if ($card->wallet_status["status"] === 'synced') {
            return response()->json([
                'success' => true,
                'error_code' => 'ALREADY_SYNCED',
                'message' => 'Employee updated but cannot be synced with wallet pass because it is already synced.',
                'company' => $company,
                'selectedCard' => $card,
            ], 200);
        }
        try {
            $wallet = $this->buildCardWalletFromCardApi($card);

            if ($card->last_email_sent === null) {
                CardHelper::sendCardEmail($card->id);
            }

            return response()->json([
                'success' => true,
                'message' => 'Card Wallet updated successfully!',
                'data' => ['card_wallet' => $wallet],
                'company' => $company,
                'selectedCard' => $card,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => true,
                'error_code' => 'WALLET_API_FAILED',
                'message' => 'Employee updated successfully but wallet sync failed: ' . $e->getMessage(),
                'company' => $company,
                'selectedCard' => $card,
            ], 200);
        }
    }

    public function clearCard(Request $request, $id)
    {
        $user = Auth::user();

        // ✅ Only company or editors can clear
        if (!$user->isCompany() && !in_array($user->role, ['editor', 'template_editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action.',
            ], 403);
        }

        // ✅ Determine company
        $companyId = $user->isCompany() ? $user->companyProfile->id : $user->company_id;

        $card = Card::with([
            'cardSocialLinks',
            'cardPhoneNumbers',
            'cardEmails',
            'cardAddresses',
            'cardWebsites',
            'cardButtons',
            'cardWallet'
        ])->where('id', $id)
            ->where('company_id', $companyId)
            ->first();

        if (!$card) {
            return response()->json([
                'success' => false,
                'message' => 'Card not found or does not belong to your company.',
            ], 404);
        }

        // ✅ Delete related records
        $card->cardSocialLinks()->delete();
        $card->cardPhoneNumbers()->delete();
        $card->cardEmails()->delete();
        $card->cardAddresses()->delete();
        $card->cardWebsites()->delete();
        $card->cardButtons()->delete();
        $card->cardWallet()->delete();

        // ✅ Clear card fields except id, company_id, cards_group_id, downloads, timestamps
        $card->update([
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

        // ✅ Generate new code
        $card->code = Card::generateCode();
        $card->save();

        return response()->json([
            'success' => true,
            'message' => 'Employee deleted successfully.',
            'new_code' => $card->code, // optional, return new code
        ]);
    }

    public function bulkClearCards(Request $request)
    {
        $user = Auth::user();

        // ✅ Validate input
        $data = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:cards,id',
        ]);

        // ✅ Only company or editors can delete
        if (!$user->isCompany() && !in_array($user->role, ['editor', 'template_editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action.',
            ], 403);
        }

        $companyId = $user->isCompany() ? $user->companyProfile->id : $user->company_id;

        $cards = Card::with([
            'cardSocialLinks',
            'cardPhoneNumbers',
            'cardEmails',
            'cardAddresses',
            'cardWebsites',
            'cardButtons',
            'cardWallet'
        ])
            ->whereIn('id', $data['ids'])
            ->where('company_id', $companyId)
            ->get();

        if ($cards->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No employees found or they do not belong to your company.',
            ], 404);
        }

        foreach ($cards as $card) {
            // Delete related records
            $card->cardSocialLinks()->delete();
            $card->cardPhoneNumbers()->delete();
            $card->cardEmails()->delete();
            $card->cardAddresses()->delete();
            $card->cardWebsites()->delete();
            $card->cardButtons()->delete();
            $card->cardWallet()->delete();

            // Clear card fields except id, company_id, cards_group_id, downloads, timestamps
            $card->update([
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

            // Generate new code
            $card->code = Card::generateCode();
            $card->save();
        }

        return response()->json([
            'success' => true,
            'message' => count($cards) . ' employee(s) cleared and new codes generated successfully.',
        ]);
    }





    public function bulkCardUpdate(Request $request)
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
                        'label' => $row["card_email_label_{$i}"] ?? null,
                        'email' => $row["card_email_{$i}"] ?? null,
                        'type' => $row["card_email_{$i}_type"] ?? null,
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
                        'label' => $row["card_phone_label_$i"] ?? null,
                        'phone_number' => $row["card_phone_$i"] ?? null,
                        'type' => $row["card_phone_{$i}_type"] ?? null
                    ];
                }
            }
            if (!empty($phones))
                $this->handleCardPhoneNumbers($company, $phones, $card->id);


            // Normalize websites
            $websites = [];
            for ($i = 1; $i <= 4; $i++) {
                if (!empty($row["website_label_$i"])) {
                    $websites[] = [
                        'label' => $row["website_label_$i"] ?? null,
                        'url' => $row["website_url_$i"] ?? null,
                    ];
                }
            }
            if (!empty($websites))
                $this->handleCardWebsites($company, $websites, $card->id);

            // Normalize addresses
            $addresses = [];
            for ($i = 1; $i <= 4; $i++) {
                // Check if any of the address components exist for this address slot
                if (
                    !empty($row["address_{$i}_street"]) || !empty($row["address_{$i}_house_number"]) ||
                    !empty($row["address_{$i}_zip"]) || !empty($row["address_{$i}_city"])
                ) {

                    $addresses[] = [
                        'label' => $row["address_{$i}_label"] ?? null,
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
                        'icon' => $numberData['icon'] ?? '',
                        'label' => $numberData['label'] ?? '',
                        'label_de' => $numberData['label_de'] ?? '',
                        'phone_number' => $numberData['phone_number'] ?? '',
                        'type' => $numberData['type'] ?? "Work",
                        'is_hidden' => $numberData['is_hidden'] ?? false,
                    ]);
                }
            } else {
                $company->cardPhoneNumbers()->create([
                    'icon' => $numberData['icon'] ?? '',
                    'label' => $numberData['label'] ?? '',
                    'label_de' => $numberData['label_de'] ?? '',
                    'phone_number' => $numberData['phone_number'] ?? '',
                    'type' => $numberData['type'] ?? "Work",
                    'is_hidden' => $numberData['is_hidden'] ?? false,
                    'company_id' => $company->id,
                    'card_id' => $cardId,
                ]);
            }
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
                        'label' => $emailData['label'] ?? '',
                        'label_de' => $emailData['label_de'] ?? '',
                        'email' => $emailData['email'] ?? '',
                        'type' => $emailData['type'] ?? "Work",
                        'is_hidden' => $emailData['is_hidden'] ?? false,
                    ]);
                }
            } else {
                $company->cardEmails()->create([
                    'label' => $emailData['label'] ?? '',
                    'label_de' => $emailData['label_de'] ?? '',
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

    private function handleCardWebsites($company, $incomingWebsites, $cardId = null)
    {
        $incomingWebsites = collect($incomingWebsites);

        $existingWebsites = $company->cardWebsites()
            ->where('company_id', $company->id)
            ->when($cardId !== null, fn($q) => $q->where('card_id', $cardId), fn($q) => $q->whereNull('card_id'))
            ->get();

        foreach ($incomingWebsites as $websiteData) {
            if (!empty($websiteData['id'])) {
                $existingWebsite = $existingWebsites->firstWhere('id', $websiteData['id']);
                if ($existingWebsite) {
                    $existingWebsite->update([
                        'label' => $websiteData['label'] ?? '',
                        'label_de' => $websiteData['label_de'] ?? '',
                        'icon' => $websiteData['icon'] ?? '',
                        'url' => $websiteData['url'] ?? '',
                        'is_hidden' => $websiteData['is_hidden'] ?? false,
                    ]);
                }
            } else {
                $company->cardWebsites()->create([
                    'label' => $websiteData['label'] ?? '',
                    'label_de' => $websiteData['label_de'] ?? '',
                    'icon' => $websiteData['icon'] ?? '',
                    'url' => $websiteData['url'] ?? '',
                    'is_hidden' => $websiteData['is_hidden'] ?? false,
                    'company_id' => $company->id,
                    'card_id' => $cardId,
                ]);
            }
        }

        // Delete websites not present in the incoming list
        $incomingIds = $incomingWebsites->pluck('id')->filter()->toArray();
        $toDelete = $existingWebsites->filter(fn($website) => !in_array($website->id, $incomingIds));

        foreach ($toDelete as $website) {
            $website->delete();
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
                        'label' => $addressData['label'] ?? '',
                        'label_de' => $addressData['label_de'] ?? '',
                        'street' => $addressData['street'] ?? '',
                        'house_number' => $addressData['house_number'] ?? '',
                        'zip' => $addressData['zip'] ?? '',
                        'city' => $addressData['city'] ?? '',
                        'country' => $addressData['country'] ?? '',
                        'map_link' => $addressData['map_link'] ?? '',
                        'type' => $addressData['type'] ?? 'Work',
                        'is_hidden' => $addressData['is_hidden'] ?? false,
                    ]);
                }
            } else {
                $company->cardAddresses()->create([
                    'label' => $addressData['label'] ?? '',
                    'label_de' => $addressData['label_de'] ?? '',
                    'street' => $addressData['street'] ?? '',
                    'house_number' => $addressData['house_number'] ?? '',
                    'zip' => $addressData['zip'] ?? '',
                    'city' => $addressData['city'] ?? '',
                    'country' => $addressData['country'] ?? '',
                    'map_link' => $addressData['map_link'] ?? '',
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
                        'button_text_de' => $buttonData['button_text_de'] ?? '',
                        'button_link' => $buttonData['button_link'] ?? '',
                        'icon' => $buttonData['icon'] ?? null,
                        'text_color' => $buttonData['text_color'] ?? null,
                        'bg_color' => $buttonData['bg_color'] ?? null,
                    ]);
                }
            } else {
                $company->cardButtons()->create([
                    'button_text' => $buttonData['button_text'] ?? '',
                    'button_text_de' => $buttonData['button_text_de'] ?? '',
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
