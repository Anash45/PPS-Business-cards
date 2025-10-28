<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyCardOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'order',
    ];

    protected $casts = [
        'order' => 'array',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
