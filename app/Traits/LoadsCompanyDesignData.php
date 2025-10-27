<?php

namespace App\Traits;

use Illuminate\Support\Facades\Auth;

trait LoadsCompanyDesignData
{
    /**
     * Get the company with all related design data.
     */
    public function getCompanyWithDesignData($user = null)
    {
        $user = $user ?? Auth::user();

        // Determine correct company reference
        $company = $user->isCompany() ? $user->companyProfile : $user->company;

        if (!$company) {
            return null;
        }

        // Load related data
        $company->load([
            'cardTemplate',
            'cardSocialLinks' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
            'cardPhoneNumbers' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
            'cardEmails' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
            'cardWebsites' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
            'cardAddresses' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
            'cardButtons' => fn($q) => $q->where('company_id', $company->id)->whereNull('card_id'),
        ]);

        return $company;
    }
}
