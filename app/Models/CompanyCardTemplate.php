<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyCardTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'banner_image',
        'company_name',
        'card_bg_color',
        'name_text_color',
        'company_text_color',
        'contact_btn_text',
        'btn_bg_color',
        'btn_text_color',
        'phone_bg_color',
        'phone_text_color',
        'email_bg_color',
        'email_text_color',
        'address_bg_color',
        'address_text_color',
        'vcard_btn_text_color',
        'vcard_btn_bg_color',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
