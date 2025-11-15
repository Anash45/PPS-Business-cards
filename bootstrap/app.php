<?php

use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\AdminOrCompanyMiddleware;
use App\Http\Middleware\CompanyMiddleware;
use App\Http\Middleware\CompanyOrEditorMiddleware;
use App\Http\Middleware\CompanyOrTemplateEditor;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Middleware\CheckCompanyApiToken; // <-- import your middleware
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php', // make sure this exists
        commands: __DIR__ . '/../routes/console.php',
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
            'company_or_templateEditor' => CompanyOrTemplateEditor::class,
            'role' => RoleMiddleware::class,
            'check_company_api_token' => CheckCompanyApiToken::class, // <-- register the API middleware alias
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
