<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'cards_included',
        'price_monthly',
        'price_annual',
        'is_custom',
        'description',
        'active',
    ];
    public function subscription()
    {
        return $this->hasMany(Subscription::class);
    }
}
