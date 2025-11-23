<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class BasicController extends Controller
{
    public function getLinkUrl()
    {
        // Fetch from .env or use default if not set
        $linkUrl = env('LINK_URL', 'https://app.ppsbusinesscards.de');

        return response()->json([
            'success' => true,
            'link_url' => $linkUrl
        ]);
    }
}
