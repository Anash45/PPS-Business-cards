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
        'role',
        'company_name',
        'created_by',
        'company_id',
        'status',
    ];

    // 🔹 Relationships
    public function createdUsers()
    {
        return $this->hasMany(User::class, 'created_by');
    }

    public function company()
    {
        return $this->belongsTo(User::class, 'company_id');
    }

    public function teamMembers()
    {
        return $this->hasMany(User::class, 'company_id');
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
}
