<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BulkEmailJobItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'bulk_email_job_id',
        'company_id',
        'card_id',
        'email',
        'status',
        'reason',
    ];

    /* ----------------------------
     | Relationships
     |-----------------------------*/

    public function job()
    {
        return $this->belongsTo(BulkEmailJob::class, 'bulk_email_job_id');
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
