<?php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\NfcController;

Route::prefix('v1')->group(function () {
    Route::post('/authenticate', [AuthController::class, 'authenticate']);
});

Route::middleware('check_company_api_token')->prefix('v1')->group(function () {
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::get('/employees/{cardId}', [EmployeeController::class, 'show']);
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::put('/employees/{cardId}/clear', [EmployeeController::class, 'clearEmployee']);
    Route::put('/employees/{cardId}/bulk-clear', [EmployeeController::class, 'bulkClearEmployees']);
    Route::post('/createBulkEmployees', [EmployeeController::class, 'createBulkEmployees']);

    
    Route::put('/nfc/multi-assign', [NfcController::class, 'assignMultipleToEmployees']);
    Route::put('/nfc/multi-unassign', [NfcController::class, 'unassignMultipleFromEmployees']);
});