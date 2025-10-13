<?php

namespace App\Http\Controllers;

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
        $company = $user->company;

        // Ensure user is a company
        if (!$user->isCompany()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $company = $user->company()->with([
            'cardTemplate',
            'cardSocialLinks',
            'cardPhoneNumbers',
            'cardEmails',
            'cardAddresses',
        ])->first();

        if (!$company) {
            return response()->json(['message' => 'No company associated with this user'], 404);
        }

        return inertia('Design/Index', [
            'pageType' => "template",
            'company' => $company,
            'isSubscriptionActive' => $user->hasActiveSubscription(),
        ]);
    }

    public function createOrUpdate(Request $request)
    {
        $user = Auth::user();

        // Ensure the logged-in user has a company
        if (!$user->isCompany() || !$user->company) {
            return response()->json([
                'success' => false,
                'message' => 'You must be a company to create or update a template.',
            ], 403);
        }

        $validated = $request->validate([
            'banner_image' => 'nullable|image|max:5120',
            'company_name' => 'required|string|max:255',
            'card_bg_color' => 'nullable|string|max:100',
            'name_text_color' => 'nullable|string|max:100',
            'company_text_color' => 'nullable|string|max:100',
            'btn_bg_color' => 'nullable|string|max:100',
            'btn_text_color' => 'nullable|string|max:100',

            // Social Media Links
            'card_social_links' => 'nullable|array',
            'card_social_links.*.icon' => 'required_with:card_social_links|string|max:100',
            'card_social_links.*.url' => 'required_with:card_social_links|string|max:255',
            'card_social_links.*.id' => 'nullable|integer',

            // Phone numbers
            'card_phone_numbers' => 'nullable|array',
            'card_phone_numbers.*.id' => 'nullable|integer',
            'card_phone_numbers.*.phone_number' => 'required_with:card_phone_numbers|string|max:20',
            'card_phone_numbers.*.is_hidden' => 'nullable|boolean',
            'card_phone_numbers.*.text_color' => 'nullable|string|max:100',
            'card_phone_numbers.*.bg_color' => 'nullable|string|max:100',

            // Emails
            'card_emails' => 'nullable|array',
            'card_emails.*.id' => 'nullable|integer',
            'card_emails.*.email' => 'required_with:card_emails|email|max:255',
            'card_emails.*.is_hidden' => 'nullable|boolean',
            'card_emails.*.text_color' => 'nullable|string|max:100',
            'card_emails.*.bg_color' => 'nullable|string|max:100',

            // Addresses
            'card_addresses' => 'nullable|array',
            'card_addresses.*.id' => 'nullable|integer',
            'card_addresses.*.address' => 'required_with:card_addresses|string|max:500',
            'card_addresses.*.is_hidden' => 'nullable|boolean',
            'card_addresses.*.text_color' => 'nullable|string|max:100',
            'card_addresses.*.bg_color' => 'nullable|string|max:100',
        ]);

        $company = $user->company;

        // Get or create template
        $template = CompanyCardTemplate::firstOrNew(['company_id' => $company->id]);

        // Handle banner image removal or replacement
        if ($request->boolean('banner_removed')) {
            if ($template->banner_image && Storage::exists($template->banner_image)) {
                Storage::delete($template->banner_image);
            }
            $validated['banner_image'] = null;
        }

        // Handle banner upload
        if ($request->hasFile('banner_image')) {
            if ($template->banner_image && Storage::exists($template->banner_image)) {
                Storage::delete($template->banner_image);
            }
            $path = $request->file('banner_image')->store('company_banners', 'public');
            $validated['banner_image'] = $path;
        }

        // Save template
        $template->fill($validated);
        $template->company_id = $company->id;
        $template->save();

        /**
         * 🔹 Handle Card Social Links (separate function)
         */
        if ($request->has('card_social_links')) {
            $this->handleCardSocialLinks($company, $request->card_social_links);
        }


        /**
         * 🔹 Handle Card Phone Numbers (separate function)
         */
        if ($request->has('card_phone_numbers')) {
            $this->handleCardPhoneNumbers($company, $request->card_phone_numbers);
        }


        /**
         * 🔹 Handle Card Phone Numbers (separate function)
         */
        if ($request->has('card_emails')) {
            $this->handleCardEmails($company, $request->card_emails);
        }


        /**
         * 🔹 Handle Card Addresses (separate function)
         */
        Log::info('Request has card_addresses: ' . ($request->has('card_addresses') ? 'true' : 'false'));
        if ($request->has('card_addresses')) {
            $this->handleCardAddresses($company, $request->card_addresses);
        }

        // Reload updated company data
        $company = $user->company()
            ->with([
                'cardTemplate',
                'cardSocialLinks',
                'cardPhoneNumbers',
                'cardEmails',
                'cardAddresses',
            ])
            ->first();

        return response()->json([
            'success' => true,
            'message' => 'Template ' . ($template->wasRecentlyCreated ? 'created' : 'updated') . ' successfully!',
            'company' => $company,
        ]);
    }

    /**
     * Handle create, update, and delete logic for company-level card social links.
     */
    private function handleCardSocialLinks($company, $incomingLinks)
    {

        $incomingLinks = collect($incomingLinks);

        // Existing template-level links (no card_id)
        $existingLinks = $company->cardSocialLinks()
            ->whereNull('card_id')
            ->get();

        // --- CREATE / UPDATE ---
        foreach ($incomingLinks as $linkData) {
            if (!empty($linkData['id'])) {
                $existingLink = $existingLinks->firstWhere('id', $linkData['id']);
                if ($existingLink) {
                    $existingLink->update([
                        'icon' => $linkData['icon'],
                        'url' => $linkData['url'],
                    ]);
                }
            } else {
                $company->cardSocialLinks()->create([
                    'icon' => $linkData['icon'],
                    'url' => $linkData['url'],
                    'company_id' => $company->id,
                    'card_id' => null, // Template-level only
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

    private function handleCardPhoneNumbers($company, $incomingNumbers)
    {
        $incomingNumbers = collect($incomingNumbers);

        // Existing template-level phone numbers (no card_id)
        $existingNumbers = $company->cardPhoneNumbers()
            ->whereNull('card_id')
            ->get();

        // --- CREATE / UPDATE ---
        foreach ($incomingNumbers as $numberData) {
            if (!empty($numberData['id'])) {
                $existingNumber = $existingNumbers->firstWhere('id', $numberData['id']);
                if ($existingNumber) {
                    $existingNumber->update([
                        'phone_number' => $numberData['phone_number'] ?? '',
                        'is_hidden' => $numberData['is_hidden'] ?? false,
                        'text_color' => $numberData['text_color'] ?? null,
                        'bg_color' => $numberData['bg_color'] ?? null,
                    ]);
                }
            } else {
                $company->cardPhoneNumbers()->create([
                    'phone_number' => $numberData['phone_number'] ?? '',
                    'is_hidden' => $numberData['is_hidden'] ?? false,
                    'text_color' => $numberData['text_color'] ?? null,
                    'bg_color' => $numberData['bg_color'] ?? null,
                    'company_id' => $company->id,
                    'card_id' => null, // Template-level only
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

    private function handleCardEmails($company, $incomingEmails)
    {
        $incomingEmails = collect($incomingEmails);

        // Existing template-level emails (no card_id)
        $existingEmails = $company->cardEmails()
            ->whereNull('card_id')
            ->get();

        // --- CREATE / UPDATE ---
        foreach ($incomingEmails as $emailData) {
            if (!empty($emailData['id'])) {
                $existingEmail = $existingEmails->firstWhere('id', $emailData['id']);
                if ($existingEmail) {
                    $existingEmail->update([
                        'email' => $emailData['email'] ?? '',
                        'is_hidden' => $emailData['is_hidden'] ?? false,
                        'text_color' => $emailData['text_color'] ?? null,
                        'bg_color' => $emailData['bg_color'] ?? null,
                    ]);
                }
            } else {
                $company->cardEmails()->create([
                    'email' => $emailData['email'] ?? '',
                    'is_hidden' => $emailData['is_hidden'] ?? false,
                    'text_color' => $emailData['text_color'] ?? null,
                    'bg_color' => $emailData['bg_color'] ?? null,
                    'company_id' => $company->id,
                    'card_id' => null, // Template-level only
                ]);
            }
        }

        // --- DELETE ---
        $incomingIds = $incomingEmails->pluck('id')->filter()->toArray();
        $toDelete = $existingEmails->filter(fn($email) => !in_array($email->id, $incomingIds));

        foreach ($toDelete as $email) {
            $email->delete();
        }
    }

    private function handleCardAddresses($company, $incomingAddresses)
    {
        $incomingAddresses = collect($incomingAddresses);

        // Existing template-level addresses (no card_id)
        $existingAddresses = $company->cardAddresses()
            ->whereNull('card_id')
            ->get();

        // --- CREATE / UPDATE ---
        foreach ($incomingAddresses as $addressData) {
            if (!empty($addressData['id'])) {
                $existingAddress = $existingAddresses->firstWhere('id', $addressData['id']);
                if ($existingAddress) {
                    $existingAddress->update([
                        'address' => $addressData['address'] ?? '',
                        'is_hidden' => $addressData['is_hidden'] ?? false,
                        'text_color' => $addressData['text_color'] ?? null,
                        'bg_color' => $addressData['bg_color'] ?? null,
                    ]);
                }
            } else {
                $company->cardAddresses()->create([
                    'address' => $addressData['address'] ?? '',
                    'is_hidden' => $addressData['is_hidden'] ?? false,
                    'text_color' => $addressData['text_color'] ?? null,
                    'bg_color' => $addressData['bg_color'] ?? null,
                    'company_id' => $company->id,
                    'card_id' => null, // Template-level only
                ]);
            }
        }

        // --- DELETE ---
        $incomingIds = $incomingAddresses->pluck('id')->filter()->toArray();
        $toDelete = $existingAddresses->filter(fn($address) => !in_array($address->id, $incomingIds));

        foreach ($toDelete as $address) {
            $address->delete();
        }
    }

}
