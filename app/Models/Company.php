<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'name',
        'billing_email',
        'street_address',
        'postal_code',
        'city',
        'country',
        'vat_id',
        'user_id', // owner user (role = company)
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($company) {
            if (empty($company->uuid)) {
                $company->uuid = Str::uuid();
            }
        });
    }

    /** 🔹 Company owner */
    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** 🔹 Company team members */
    public function teamMembers()
    {
        return $this->hasMany(User::class, 'company_id');
    }
}
