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
        'type',
        'street',
        'house_number',
        'zip',
        'city',
        'country',
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
