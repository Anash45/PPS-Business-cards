<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BulkEmailJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'card_id',
        'status',
        'total_items',
        'processed_items',
        'last_processed_at',
        'reason',
    ];

    protected $casts = [
        'total_items' => 'integer',
        'processed_items' => 'integer',
    ];

    /* ----------------------------
     | Relationships
     |-----------------------------*/

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
        return $this->hasMany(BulkEmailJobItem::class);
    }

    /* ----------------------------
     | Helpers
     |-----------------------------*/

    public function isProcessing()
    {
        return $this->status === 'processing';
    }

    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    public function isFailed()
    {
        return $this->status === 'failed';
    }
}
