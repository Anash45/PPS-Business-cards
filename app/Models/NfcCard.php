<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NfcCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'qr_code',
        'card_id',
        'company_id',
        'cards_group_id',
        'status',
        'views',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function card()
    {
        return $this->belongsTo(Card::class, 'card_code', 'code');
    }

    public function cardsGroup()
    {
        return $this->belongsTo(CardsGroup::class);
    }
}
