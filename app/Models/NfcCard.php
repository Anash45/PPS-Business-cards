<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class NfcCard extends Model
{
    use HasFactory, SoftDeletes;

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
        return $this->belongsTo(Card::class);
    }

    public function cardsGroup()
    {
        return $this->belongsTo(CardsGroup::class);
    }
}
