<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CardWalletNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $downloadLink;
    public string $viewCardLink;
    public string $first_name;

    /**
     * Create a new message instance.
     */
    public function __construct(string $downloadLink, string $viewCardLink, string $first_name)
    {
        $this->downloadLink = $downloadLink;
        $this->viewCardLink = $viewCardLink;
        $this->first_name = $first_name;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Your Digital Business Card Wallet')
            ->view('emails.wallet-pass-notification')
            ->with([
                'downloadLink' => $this->downloadLink,
                'viewCardLink' => $this->viewCardLink,
                'first_name' => $this->first_name,
            ]);
    }
}
