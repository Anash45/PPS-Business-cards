<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CardAddress extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'card_id',
        'label',
        'label_de',
        'type',
        'street',
        'house_number',
        'zip',
        'city',
        'country',
        'map_link',
        'is_hidden',
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
