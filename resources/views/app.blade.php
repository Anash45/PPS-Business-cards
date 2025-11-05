<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title inertia>{{ $meta['title'] ?? config('app.name', 'PPS Business Cards') }}</title>
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/favicons/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicons/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/images/favicons/favicon-16x16.png">
    <link rel="icon" type="image/png" sizes="192x192" href="/assets/images/favicons/android-chrome-192x192.png">
    <link rel="icon" type="image/png" sizes="512x512" href="/assets/images/favicons/android-chrome-512x512.png">
    <link rel="shortcut icon" href="/assets/images/favicons/favicon.ico">

    {{-- ✅ Optional Server-side OG / Twitter Meta --}}
    <meta property="og:title" content="{{ $meta['title'] ?? config('app.name', 'PPS Business Cards') }}">
    <meta property="og:description"
        content="{{ $meta['description'] ?? 'Get in touch via my digital business card.' }}">
    <meta property="og:image" content="{{ $meta['image'] ?? asset('/assets/images/profile-placeholder.png') }}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ $meta['url'] ?? request()->fullUrl() }}">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $meta['title'] ?? config('app.name', 'PPS Business Cards') }}">
    <meta name="twitter:description" content="{{ $meta['description'] ?? 'Get in touch via my digital business card.' }}">
    <meta name="twitter:image" content="{{ $meta['image'] ?? asset('/assets/images/profile-placeholder.png') }}">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
    @inertiaHead
</head>

<body class="font-jakarta-sans antialiased">
    @inertia
</body>

</html>