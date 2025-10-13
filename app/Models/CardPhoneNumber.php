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
        'phone_number',
        'text_color',
        'bg_color',
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