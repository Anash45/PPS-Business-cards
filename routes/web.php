<?php

use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\CardsController;
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
    Route::get('/company/cards', [CardsController::class, 'companyCards'])
        ->name('company.cards');
    Route::put('/cards/{card}/toggle-status', [CardsController::class, 'toggleStatus']);

    Route::get('/company/cards/{card}/edit', [DesignController::class, 'cardEdit'])
        ->name('card.edit');

    Route::post('/company/cards/{card}/update', [DesignController::class, 'cardUpdate'])
        ->name('card.update');

});
Route::get('/card/{code}', [DesignController::class, 'cardShow'])
    ->name('card.show');

Route::middleware(['auth', 'admin'])->group(function () {
    Route::resource('users', UserController::class);
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


Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/', function () {
    return redirect()->route('dashboard');
})->middleware(['auth', 'verified'])->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
