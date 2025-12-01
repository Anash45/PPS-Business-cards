<?php

use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ApiController;
use App\Http\Controllers\BasicController;
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


Route::middleware(['auth', 'role:company'])->group(function () {
    Route::get('/design', [DesignController::class, 'index'])
        ->name('design.index');
    Route::post('/design/createOrUpdate', [DesignController::class, 'createOrUpdate'])
        ->name('design.createOrUpdate');
    Route::get('/settings', [CompanyController::class, 'settings'])
        ->name('settings.index');

});


Route::middleware(['auth', 'role:company,template_editor'])->group(function () {

    Route::get('/design', [DesignController::class, 'index'])
        ->name('design.index');
    Route::post('/design/createOrUpdate', [DesignController::class, 'createOrUpdate'])
        ->name('design.createOrUpdate');
    Route::post('/design/card_wallet/update', [DesignController::class, 'templateWalletUpdate'])
        ->name('design.templateWalletUpdate');

});


Route::middleware(['auth', 'role:company,editor,template_editor'])->group(function () {
    Route::get('/company/cards', [CardsController::class, 'companyCards'])
        ->name('company.cards');

    Route::get('/company/nfc-cards', [CardsController::class, 'companyNfcCards'])
        ->name('company.nfc_cards');

    Route::get('/company/cards/{card}/edit', [DesignController::class, 'cardEdit'])
        ->name('card.edit');

    Route::post('/company/cards/{card}/update', [DesignController::class, 'cardUpdate'])
        ->name('card.update');
    Route::put('/company/cards/{card}/delete', [DesignController::class, 'clearCard'])
        ->name('card.delete');
    Route::put('/company/cards/bulk-delete', [DesignController::class, 'bulkClearCards'])
        ->name('card.bulkDelete');

    Route::get('/csv-import', [CsvController::class, 'index'])
        ->name('csv.index');
    Route::post('/cards/bulk-update', [DesignController::class, 'bulkCardUpdate'])
        ->name('csv.import');

    Route::post('/cards/toggle-multiple-status', [CardsController::class, 'toggleMultipleStatus'])
        ->name('cards.toggleMultipleStatus');
    Route::put('/cards/{card}/toggle-status', [CardsController::class, 'toggleStatus']);

    Route::post('/nfc-cards/toggle-multiple-status', [CardsController::class, 'toggleMultipleNfcStatus'])
        ->name('cards.toggleMultipleStatus');
    Route::put('/nfc-cards/{nfcCard}/toggle-status', [CardsController::class, 'toggleNfcStatus']);

    Route::post('/nfc-cards/assign', [CardsController::class, 'assignToEmployee'])
        ->name('nfc-cards.assign');
    Route::post('/nfc-cards/unassign', [CardsController::class, 'unassignFromEmployee'])
        ->name('nfc-cards.unassign');


    Route::post('/company/cards/card_wallet/{card}/update', [DesignController::class, 'cardWalletUpdate'])
        ->name('design.cardWalletUpdate');
    Route::post('/company/cards/sync-multiple-wallets', [DesignController::class, 'cardWalletBulkUpdate'])
        ->name('design.cardWalletBulkUpdate');
    Route::post('/company/cards/sync-multiple-wallets-background', [DesignController::class, 'cardWalletBulkUpdateBackground'])
        ->name('design.cardWalletBulkUpdateBackground');
    Route::post('/company/cards/card-sending-emails', [DesignController::class, 'cardSendingEmails'])
        ->name('design.cardSendingEmails');
    Route::get('/company/cards/sync-status', [DesignController::class, 'syncStatus']);
    Route::get('/company/cards/wallet-syncable-counts', [DesignController::class, 'walletSyncableCounts']);
});


Route::get('/card/{code}', [DesignController::class, 'cardShow'])
    ->name('card.show');
Route::post('/cards/increment-downloads', [CardsController::class, 'incrementDownloadsByCode']);


Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::post('/users/{user}/impersonate', [UserController::class, 'impersonate'])->name('users.impersonate');

    Route::get('/cards/groups/{group}/download', [CardsController::class, 'downloadGroup'])
        ->name('cards.group.download');
    Route::resource('cards', CardsController::class);
    Route::delete('/cards/groups/{group}', [CardsController::class, 'destroyGroup'])
        ->name('cards.groups.destroy');
    Route::delete('/cards-group/{group}/delete-cards', [CardsController::class, 'deleteCards'])
        ->name('cards.group.deleteCards');

    Route::delete('/cards-group/{group}/delete-nfc-cards', [CardsController::class, 'deleteNfcCards'])
        ->name('cards.group.deleteNfcCards');


    Route::resource('plans', PlanController::class);

    Route::post('/subscriptions/update-or-create/{user}', [SubscriptionsController::class, 'createOrUpdate'])
        ->name('subscriptions.updateOrCreate');
});


Route::middleware(['auth', 'role:admin,company,template_editor'])->group(function () {
    Route::resource('users', UserController::class);
});

Route::middleware(['auth', 'role:admin,company'])->group(function () {
    Route::get('/api-docs', [ApiController::class, 'index'])
        ->name('api.documentation');
    Route::post('/api-key/regenerate', [ApiController::class, 'regenerate'])
        ->name('api.regenerateKey');

    Route::put('/settings/company', [CompanyController::class, 'update'])
        ->name('settings.company.update');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/views', [DashboardController::class, 'getViewsData']);
    Route::get('/dashboard/top-cards', [DashboardController::class, 'getTopCardsByViews']);

    // routes/web.php
    Route::get('/company/{company}/card-sections-order', [CompanyController::class, 'getCardSectionsOrder']);
    Route::post('/company/{company}/card-sections-order', [CompanyController::class, 'saveCardSectionsOrder']);

    Route::post('/cards/download', [CardsController::class, 'downloadCsv'])->name('cards.download');


    Route::get('/get-link-url', [BasicController::class, 'getLinkUrl']);
});




Route::get('/', function () {
    return redirect()->route('dashboard');
})->middleware(['auth', 'verified'])->name('home');
Route::get('/api-docs/full', [ApiController::class, 'full'])
    ->name('api.documentation.full');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
});

require __DIR__ . '/auth.php';
