<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use App\Helpers\RoleHelper;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'created_by',
        'company_id',
        'is_impersonated',
        'impersonated_by',
        'status',
        // 2FA fields
        'two_factor_prompt_interval',
        'two_factor_last_verified_at',
        'two_factor_device_hash',

    ];

    protected $casts = [
        'two_factor_recovery_codes' => 'array',
        'email_2fa_expires_at' => 'datetime',
        'is_email_2fa_enabled' => 'boolean',
        'is_totp_2fa_enabled' => 'boolean',
        'two_factor_last_verified_at' => 'datetime',
    ];

    public function hasAny2FA()
    {
        return $this->is_email_2fa_enabled || $this->is_totp_2fa_enabled;
    }

    public function twoFactorExpiresAt()
    {
        if (!$this->two_factor_last_verified_at || !$this->two_factor_prompt_interval) {
            return null;
        }

        return match ($this->two_factor_prompt_interval) {
            'daily' => $this->two_factor_last_verified_at->addDay(),
            'weekly' => $this->two_factor_last_verified_at->addWeek(),
            '15_days' => $this->two_factor_last_verified_at->addDays(15),
            default => null,
        };
    }

    public function generateDeviceHash(): string
    {
        return hash('sha256', request()->userAgent() . '|' . request()->ip());
    }

    public function requires2FA(): bool
    {
        if (!$this->hasAny2FA()) {
            return false;
        }

        $currentDevice = $this->generateDeviceHash();

        // Device changed
        if ($this->two_factor_device_hash !== $currentDevice) {
            return true;
        }

        // First time verification
        if (!$this->two_factor_last_verified_at) {
            return true;
        }

        // Check expiration
        $expiresAt = $this->twoFactorExpiresAt();

        if ($expiresAt && now()->greaterThan($expiresAt)) {
            return true;
        }

        return false;
    }


    public function isUsingEmail2FA()
    {
        return $this->is_email_2fa_enabled === true;
    }

    public function isUsingTOTP2FA()
    {
        return $this->is_totp_2fa_enabled === true;
    }

    protected $appends = ['role_name'];

    public function getRoleNameAttribute(): string
    {
        return RoleHelper::displayName($this->role);
        // or if you used the function-based helper: return getRoleDisplayName($this->role);
    }

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

    public function isEditor(): bool
    {
        return $this->role === 'editor';
    }

    public function isTemplateEditor(): bool
    {
        return $this->role === 'template_editor';
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

    public function hasActiveSubscription()
    {
        $subscription = $this->subscription;

        return $subscription &&
            $subscription->is_active;
    }

}
