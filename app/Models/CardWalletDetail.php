<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CardWalletDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'card_id',
        'template_id',
        'pass_id',
        'company_logo',
        'user_image',
        'company_logo_string',
        'user_image_string',
        'user_image_google_string',
        'google_company_logo',
        'google_company_logo_string',
        'bg_color',
        'text_color',
        'card_code',
        'qr_caption',
        'wallet_email',
        'label_1',
        'label_1_value',
        'label_2',
        'label_2_value',
        'label_3',
        'label_3_value',
        'wallet_title',
        'download_link',
    ];

    // ✅ Relationship
    public function card()
    {
        return $this->belongsTo(Card::class);
    }
}