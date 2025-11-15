<?php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmployeeController;

Route::prefix('v1')->group(function () {
    Route::post('/authenticate', [AuthController::class, 'authenticate']);
});

Route::middleware('check_company_api_token')->prefix('v1')->group(function () {
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::get('/employees/{cardId}', [EmployeeController::class, 'index']);
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::post('/createBulkEmployees', [EmployeeController::class, 'createBulkEmployees']);
});