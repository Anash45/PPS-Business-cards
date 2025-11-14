<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CardPhoneNumber extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'card_id',
        'icon',
        'label',
        'label_de',
        'type',
        'phone_number',
        'is_hidden',
    ];

    protected $casts = [
        'is_hidden' => 'boolean',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function card()
    {
        return $this->belongsTo(Card::class);
    }
}