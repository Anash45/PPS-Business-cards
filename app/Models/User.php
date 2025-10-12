<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',        // admin | company | team
        'created_by',  // user who created this account (usually admin)
        'company_id',  // only set for team users
        'is_impersonated',
        'impersonated_by',
        'status',
    ];

    /** 🔹 If the user is a company owner, this links to their company */
    public function companyProfile()
    {
        return $this->hasOne(Company::class, 'user_id');
    }

    /** 🔹 If the user is a team member, this links to the company they belong to */
    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }


    // 🔹 Role Helpers
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isCompany(): bool
    {
        return $this->role === 'company';
    }

    public function isTeam(): bool
    {
        return $this->role === 'team';
    }

    // 🔹 Status Helpers
    public function isActive(): bool
    {
        return $this->status === true;
    }

    public function isInactive(): bool
    {
        return $this->status === false;
    }

    public function subscription()
    {
        return $this->hasOne(Subscription::class);
    }
}
