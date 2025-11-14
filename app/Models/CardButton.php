<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CardButton extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'card_id',
        'icon',
        'button_text',
        'button_text_de',
        'button_link',
        'text_color',
        'bg_color',
    ];

    // Example relationships
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function card()
    {
        return $this->belongsTo(Card::class);
    }
}
