<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    use HasFactory; // ✅ add SoftDeletes

    protected $fillable = [
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
        'internal_employee_number',
        'code',
        'company_id',
        'cards_group_id',
        'status',
        'is_syncing',
        'downloads',
        'last_email_sent',
    ];

    protected $appends = ['is_eligible_for_sync', 'wallet_status'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function cardsGroup()
    {
        return $this->belongsTo(CardsGroup::class);
    }

    public function nfcCards()
    {
        return $this->hasMany(NfcCard::class, 'card_code', 'code');
    }

    protected static function booted()
    {
        static::updating(function ($card) {
            if ($card->isDirty('code')) {
                NfcCard::where('card_code', $card->getOriginal('code'))
                    ->update(['card_code' => null]);
            }
        });
    }

    /**
     * Generate a unique 8-character code
     */
    public static function generateCode()
    {
        $allowedChars = 'ABCDEFGHJKMNPQRSTUVWX2346789';
        $length = 8;

        do {
            $code = '';
            for ($i = 0; $i < $length; $i++) {
                $code .= $allowedChars[random_int(0, strlen($allowedChars) - 1)];
            }
            // Check uniqueness across both cards and nfc_cards
            $existsInCards = self::where('code', $code)->exists();
            $existsInNfc = NfcCard::where('qr_code', $code)->exists();
        } while ($existsInCards || $existsInNfc);

        return $code;
    }

    /**
     * Check if this card's company's user has an active subscription
     */
    public function hasActiveSubscription()
    {
        $user = $this->company?->user;

        if (!$user || !$user->isCompany()) {
            return false;
        }

        return $user->company?->subscription()
            ->active()
            ->exists();
    }

    public function cardSocialLinks()
    {
        return $this->hasMany(CardSocialLink::class);
    }

    public function cardPhoneNumbers()
    {
        return $this->hasMany(CardPhoneNumber::class);
    }

    public function cardEmails()
    {
        return $this->hasMany(CardEmail::class);
    }

    public function cardAddresses()
    {
        return $this->hasMany(CardAddress::class);
    }

    public function cardWebsites()
    {
        return $this->hasMany(CardWebsite::class);
    }

    public function cardButtons()
    {
        return $this->hasMany(CardButton::class);
    }

    public function cardWallet()
    {
        return $this->hasOne(CardWalletDetail::class);
    }

    public function views()
    {
        return $this->hasMany(CardView::class);
    }

    public function getWalletStatusAttribute()
    {
        $wallet = $this->cardWallet;

        // 🟥 If wallet record doesn't exist
        if (!$wallet) {
            return [
                'status' => 'missing',
                'message' => 'No wallet pass found for this card.',
            ];
        }

        $template = optional(optional($this->company)->cardTemplate);

        // 🟦 Define field pairs (expected vs actual)
        $fields = [
            'label_1_value' => [
                'expected' => trim(implode(' ', array_filter([
                    $this->title,
                    $this->first_name,
                    $this->last_name,
                ]))),
                'actual' => trim($wallet->label_1_value),
            ],
            'wallet_email' => [
                'expected' => $this->primary_email,
                'actual' => $wallet->wallet_email,
            ],
            'user_image' => [
                'expected' => $this->profile_image,
                'actual' => $wallet->user_image,
            ],
            'user_image_google_string' => [
                'expected' => !empty($this->profile_image) ? 'present' : '',
                'actual' => !empty($wallet->user_image_google_string) ? 'present' : '',
            ],
            'label_3_value' => [
                'expected' => $this->position,
                'actual' => $wallet->label_3_value,
            ],

            // 🏢 Company Template fields
            'label_2_value' => [
                'expected' => $template?->company_name,
                'actual' => $wallet->label_2_value,
            ],
            'bg_color' => [
                'expected' => $template?->wallet_bg_color,
                'actual' => $wallet->bg_color,
            ],
            'text_color' => [
                'expected' => $template?->wallet_text_color,
                'actual' => $wallet->text_color,
            ],
            'label_color' => [
                'expected' => $template?->wallet_label_color,
                'actual' => $wallet->label_color,
            ],
            'label_1' => [
                'expected' => $template?->wallet_label_1,
                'actual' => $wallet->label_1,
            ],
            'label_2' => [
                'expected' => $template?->wallet_label_2,
                'actual' => $wallet->label_2,
            ],
            'label_3' => [
                'expected' => $template?->wallet_label_3,
                'actual' => $wallet->label_3,
            ],
            'qr_caption' => [
                'expected' => $template?->wallet_qr_caption,
                'actual' => $wallet->qr_caption,
            ],
            'company_logo' => [
                'expected' => $template?->wallet_logo_image,
                'actual' => $wallet->company_logo,
            ],
            'google_company_logo' => [
                'expected' => $template?->google_wallet_logo_image,
                'actual' => $wallet->google_company_logo,
            ],
        ];

        // 🧩 Compare and collect mismatches
        $mismatched = [];
        foreach ($fields as $key => $pair) {
            if ($pair['expected'] !== $pair['actual']) {
                $mismatched[$key] = [
                    'expected' => $pair['expected'],
                    'actual' => $pair['actual'],
                ];
            }
        }

        // 🟩 Determine status
        $status = empty($mismatched) ? 'synced' : 'out_of_sync';

        return [
            'status' => $status,
            'mismatched_fields' => $mismatched,
        ];
    }

    public function getIsEligibleForSyncAttribute()
    {
        $template = optional(optional($this->company)->cardTemplate);

        // Required fields for the card
        $requiredCardFields = [
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'position' => $this->position,
            'profile_image' => $this->profile_image,
            'primary_email' => $this->primary_email,
        ];

        // Required template fields
        $requiredTemplateFields = [
            'company_name' => $template?->company_name,
            'wallet_bg_color' => $template?->wallet_bg_color,
            'wallet_text_color' => $template?->wallet_text_color,
            'wallet_label_1' => $template?->wallet_label_1,
            'wallet_label_2' => $template?->wallet_label_2,
            'wallet_label_3' => $template?->wallet_label_3,
            'wallet_qr_caption' => $template?->wallet_qr_caption,
            'wallet_logo_image' => $template?->wallet_logo_image,
            'google_wallet_logo_image' => $template?->google_wallet_logo_image,
        ];

        $missing = [];

        foreach ($requiredCardFields as $key => $value) {
            if (empty(trim((string) $value))) {
                $missing[] = $key;
            }
        }

        foreach ($requiredTemplateFields as $key => $value) {
            if (empty(trim((string) $value))) {
                $missing[] = $key;
            }
        }

        return [
            'eligible' => empty($missing),
            'missing_fields' => $missing,
        ];
    }

    /**
     * Get a relation with only selected fields.
     *
     * @param string $relation
     * @param array $fields
     * @return array
     */
    public function getRelationFields(string $relation, array $fields = []): array
    {
        if (!$this->$relation) {
            return [];
        }

        return $this->$relation->map(function ($item) use ($fields) {
            if (!empty($fields)) {
                return collect($item)->only($fields)->all();
            }
            return $item; // return full object if no fields specified
        })->all();
    }
}
