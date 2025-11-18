<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TwoFactorCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public int $code;

    /**
     * Create a new message instance.
     */
    public function __construct(int $code)
    {
        $this->code = $code;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this
            ->subject('Your 2FA Login Code')
            ->markdown('emails.two_factor_code'); // We'll create this markdown next
    }
}
