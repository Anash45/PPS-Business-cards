<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BulkWalletApiJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'card_id',
        'status',
        'total_items',
        'processed_items',
        'last_processed_at',
        'reason'
    ];

    protected $casts = [
        'total_items' => 'integer',
        'processed_items' => 'integer',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function card()
    {
        return $this->belongsTo(Card::class);
    }

    public function items()
    {
        return $this->hasMany(BulkWalletApiJobItem::class);
    }
}
