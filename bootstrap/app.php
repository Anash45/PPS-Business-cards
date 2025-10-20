<?php

use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\AdminOrCompanyMiddleware;
use App\Http\Middleware\CompanyMiddleware;
use App\Http\Middleware\CompanyOrEditorMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin' => AdminMiddleware::class,
            'company' => CompanyMiddleware::class,
            'admin_or_company' => AdminOrCompanyMiddleware::class,
            'company_or_editor' => CompanyOrEditorMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
