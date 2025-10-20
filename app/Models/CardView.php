<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CardView extends Model
{
    use HasFactory;

    protected $fillable = [
        'card_id',
        'user_id',
        'ip_address',
        'user_agent',
    ];

    public function card()
    {
        return $this->belongsTo(Card::class);
    }
}
