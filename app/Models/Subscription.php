<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plan_id',
        'start_date',
        'end_date',
        'is_active',
        'assigned_by_admin',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
        'assigned_by_admin' => 'boolean',
    ];

    /**
     * Relationships
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    /**
     * Accessor: Check if subscription is currently valid
     */
    public function getIsValidAttribute()
    {
        return $this->is_active && Carbon::now()->between($this->start_date, $this->end_date);
    }

    /**
     * Scope: Active subscriptions only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                     ->whereDate('end_date', '>=', now());
    }

    /**
     * Deactivate expired subscriptions automatically (optional)
     */
    public function checkAndDeactivateIfExpired()
    {
        if ($this->is_active && $this->end_date->lt(now())) {
            $this->update(['is_active' => false]);
        }
    }
}