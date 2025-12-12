<?php

/**
 * EXAMPLE ROUTES SETUP FOR CUSTOM DATATABLE
 * 
 * Add these routes to your routes/web.php file
 */

use App\Http\Controllers\CardsController;
use App\Http\Controllers\Examples\DataTableExampleController;
use Illuminate\Support\Facades\Route;

// ============================================
// EXAMPLES - For testing and learning
// ============================================

// Full example with multiple tables
Route::get('/examples/datatable', [DataTableExampleController::class, 'index'])
    ->name('examples.datatable.index');

// Separate endpoints for each table (recommended for multiple tables)
Route::get('/examples/datatable/cards', [DataTableExampleController::class, 'getCards'])
    ->name('examples.datatable.cards');

Route::get('/examples/datatable/users', [DataTableExampleController::class, 'getUsers'])
    ->name('examples.datatable.users');

// ============================================
// YOUR ACTUAL IMPLEMENTATION
// ============================================

/**
 * Company Cards with Server-Side Processing
 * 
 * UPDATE your existing route or add new one:
 */
Route::middleware(['auth'])->group(function () {
    
    // Option 1: Update existing route
    Route::get('/company/cards', [CardsController::class, 'companyCards1'])
        ->name('company.cards.index');

    // Option 2: Keep old route and add new one for testing
    Route::get('/company/cards-fast', [CardsController::class, 'companyCards1'])
        ->name('company.cards.fast');

    // If using separate endpoint approach
    Route::get('/company/cards/data', [CardsController::class, 'getCompanyCardsData'])
        ->name('company.cards.data');
});

/**
 * NFC Cards Example
 */
Route::middleware(['auth'])->group(function () {
    Route::get('/company/nfc-cards', [CardsController::class, 'companyNfcCards'])
        ->name('company.nfc-cards.index');
});

/**
 * Additional Card Management Routes
 * (These remain the same)
 */
Route::middleware(['auth'])->group(function () {
    // Card actions
    Route::post('/cards/{card}/toggle-status', [CardsController::class, 'toggleStatus'])
        ->name('cards.toggle-status');
    
    Route::post('/cards/toggle-multiple', [CardsController::class, 'toggleMultipleStatus'])
        ->name('cards.toggle-multiple');
    
    Route::delete('/cards/{card}', [CardsController::class, 'destroy'])
        ->name('cards.destroy');
    
    // CSV Export
    Route::post('/cards/download-csv', [CardsController::class, 'downloadCsv'])
        ->name('cards.download-csv');
});

/**
 * NOTES:
 * 
 * 1. Route Names:
 *    - Use the route name in your React component: route('company.cards.index')
 *    - This should match the 'endpoint' prop in CustomDataTable
 * 
 * 2. Middleware:
 *    - Don't forget to add authentication middleware
 *    - Add authorization checks in controller methods
 * 
 * 3. Multiple Tables:
 *    - If you have multiple tables on one page, create separate routes
 *    - Each route should return only the data for that specific table
 * 
 * 4. Testing:
 *    - Test the example routes first to understand how it works
 *    - Then migrate your actual routes one by one
 */
