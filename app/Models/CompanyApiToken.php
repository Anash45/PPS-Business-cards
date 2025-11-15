<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CompanyApiToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'token',
        'last_used_at',
    ];

    /**
     * Generate a unique API token for the company.
     */
    public static function generateToken(int $companyId): string
    {
        do {
            $token = 'pps_api_' . hash('sha256', Str::random(40));
        } while (self::where('token', $token)->exists());

        self::create([
            'company_id' => $companyId,
            'token' => $token,
        ]);

        return $token;
    }

    /**
     * Relationship: token belongs to a company.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}