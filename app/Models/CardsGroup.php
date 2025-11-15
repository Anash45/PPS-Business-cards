<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CardsGroup extends Model
{
    use HasFactory;

    protected $fillable = ['uuid', 'company_id'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function cards()
    {
        return $this->hasMany(Card::class);
    }

    public function nfcCards()
    {
        return $this->hasMany(NfcCard::class);
    }
}
