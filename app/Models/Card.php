<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // ✅ import SoftDeletes

class Card extends Model
{
    use HasFactory, SoftDeletes; // ✅ add SoftDeletes

    protected $fillable = [
        'salutation',
        'title',
        'first_name',
        'last_name',
        'profile_image',
        'position',
        'degree',
        'department',
        'code',
        'company_id',
        'cards_group_id',
        'status'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function cardsGroup()
    {
        return $this->belongsTo(CardsGroup::class);
    }

    /**
     * Generate a unique 8-character code
     */
    public static function generateCode()
    {
        $allowedChars = 'ABCDEFGHJKMNPQRSTUVWX2346789';
        $code = '';
        for ($i = 0; $i < 8; $i++) {
            $code .= $allowedChars[random_int(0, strlen($allowedChars) - 1)];
        }

        // Ensure uniqueness
        if (self::where('code', $code)->exists()) {
            return self::generateCode();
        }

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
        return $this->hasMany(CardSocialLink::class, 'user_id');
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

    public function cardButtons()
    {
        return $this->hasMany(CardButton::class);
    }
}
