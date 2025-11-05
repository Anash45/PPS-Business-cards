<?php

use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\CardsController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CsvController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DesignController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\SubscriptionsController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::middleware(['auth'])->group(function () {
    Route::post('/users/stop-impersonate', [UserController::class, 'stopImpersonate'])->name('users.stopImpersonate');


});


Route::middleware(['auth', 'company'])->group(function () {
    Route::get('/design', [DesignController::class, 'index'])
        ->name('design.index');
    Route::post('/design/createOrUpdate', [DesignController::class, 'createOrUpdate'])
        ->name('design.createOrUpdate');
    Route::get('/settings', [CompanyController::class, 'index'])
        ->name('settings.index');
    Route::put('/settings/company', [CompanyController::class, 'update'])
        ->name('settings.company.update');

});


Route::middleware(['auth', 'company_or_templateEditor'])->group(function () {

    Route::get('/design', [DesignController::class, 'index'])
        ->name('design.index');
    Route::post('/design/createOrUpdate', [DesignController::class, 'createOrUpdate'])
        ->name('design.createOrUpdate');
    Route::post('/design/card_wallet/update', [DesignController::class, 'templateWalletUpdate'])
        ->name('design.templateWalletUpdate');

});


Route::middleware(['auth', 'company_or_editor'])->group(function () {
    Route::get('/company/cards', [CardsController::class, 'companyCards'])
        ->name('company.cards');
    Route::put('/cards/{card}/toggle-status', [CardsController::class, 'toggleStatus']);

    Route::get('/company/cards/{card}/edit', [DesignController::class, 'cardEdit'])
        ->name('card.edit');

    Route::post('/company/cards/{card}/update', [DesignController::class, 'cardUpdate'])
        ->name('card.update');

    Route::get('/csv-import', [CsvController::class, 'index'])
        ->name('csv.index');
    Route::post('/cards/bulk-update', [DesignController::class, 'bulkCardUpdate'])
        ->name('csv.import');

    Route::post('/cards/toggle-multiple-status', [CardsController::class, 'toggleMultipleStatus'])
        ->name('cards.toggleMultipleStatus');
});
Route::get('/card/{code}', [DesignController::class, 'cardShow'])
    ->name('card.show');
Route::post('/cards/increment-downloads', [CardsController::class, 'incrementDownloadsByCode']);

Route::middleware(['auth', 'admin'])->group(function () {
    Route::post('/users/{user}/impersonate', [UserController::class, 'impersonate'])->name('users.impersonate');

    Route::get('/cards/groups/{group}/download', [CardsController::class, 'downloadGroup'])
        ->name('cards.group.download');
    Route::resource('cards', CardsController::class);
    Route::delete('/cards/groups/{group}', [CardsController::class, 'destroyGroup'])
        ->name('cards.groups.destroy');


    Route::resource('plans', PlanController::class);

    Route::post('/subscriptions/update-or-create/{user}', [SubscriptionsController::class, 'createOrUpdate'])
        ->name('subscriptions.updateOrCreate');
});


Route::middleware(['auth', 'admin_or_company'])->group(function () {
    Route::resource('users', UserController::class);
});

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/views', [DashboardController::class, 'getViewsData']);
    Route::get('/dashboard/top-cards', [DashboardController::class, 'getTopCardsByViews']);

    // routes/web.php
    Route::get('/company/{company}/card-sections-order', [CompanyController::class, 'getCardSectionsOrder']);
    Route::post('/company/{company}/card-sections-order', [CompanyController::class, 'saveCardSectionsOrder']);

    Route::post('/cards/download', [CardsController::class, 'downloadCsv'])->name('cards.download');

});




Route::get('/', function () {
    return redirect()->route('dashboard');
})->middleware(['auth', 'verified'])->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
});

require __DIR__ . '/auth.php';
