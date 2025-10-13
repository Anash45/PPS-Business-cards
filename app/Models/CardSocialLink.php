<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CardSocialLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'card_id',
        'icon',
        'url',
    ];

    /**
     * Relationships
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function card()
    {
        return $this->belongsTo(Card::class);
    }

    /**
     * Scope: Template links (no card_id)
     */
    public function scopeTemplate($query)
    {
        return $query->whereNull('card_id');
    }

    /**
     * Scope: Card-specific links
     */
    public function scopeForCard($query, $cardId)
    {
        return $query->where('card_id', $cardId);
    }
}
