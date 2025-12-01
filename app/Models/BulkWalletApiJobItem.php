<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BulkWalletApiJobItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'bulk_wallet_api_job_id',
        'company_id',
        'card_id',
        'status',
        'reason',
    ];

    public function job()
    {
        return $this->belongsTo(BulkWalletApiJob::class, 'bulk_wallet_api_job_id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function card()
    {
        return $this->belongsTo(Card::class);
    }
}
