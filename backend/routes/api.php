<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\V1\VehicleController;
use App\Http\Controllers\Api\V1\Security\VisitorController;
use App\Http\Controllers\Api\V1\DriverController;
use App\Http\Controllers\Api\V1\Security\CheckpointController;
use App\Http\Controllers\Api\V1\Security\CheckInOutController;

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::post('forgot-password', [AuthController::class, 'sendResetLinkEmail']);
Route::put('users/{userId}/reset-password', [AuthController::class, 'resetPassword']);


Route::prefix('checkinout')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [CheckInOutController::class, 'index']);
    Route::post('/check-in', [CheckInOutController::class, 'checkIn']);
    Route::put('/check-out/{id}', [CheckInOutController::class, 'checkOut']);
    Route::get('/{id}', [CheckInOutController::class, 'show']);
    Route::delete('/{id}', [CheckInOutController::class, 'destroy']);
});


Route::middleware('auth:sanctum')->group(function () {
    // Authenticated user routes
    Route::get('me', [AuthController::class, 'me']);
    Route::get('users', [AuthController::class, 'index']);
    Route::post('logout', [AuthController::class, 'logout']);

    // Visitor routes
    Route::get('/visitors', [VisitorController::class, 'index']);
    Route::post('/visitors', [VisitorController::class, 'store']);
    Route::put('/visitors/{visitor}', [VisitorController::class, 'update']);
    Route::delete('/visitors/{visitor}', [VisitorController::class, 'destroy']);

    // Vehicle routes
    Route::prefix('vehicles')->group(function () {
        Route::get('/', [VehicleController::class, 'index']);
        Route::post('/', [VehicleController::class, 'store']);
        Route::put('/{id}', [VehicleController::class, 'update']);
        Route::delete('/{id}', [VehicleController::class, 'destroy']);
    });

    // 

    // Driver routes
    Route::get('/drivers', [DriverController::class, 'index']);
    Route::post('/drivers', [DriverController::class, 'store']);
    Route::get('/drivers/{driver}', [DriverController::class, 'show']);
    Route::put('/drivers/{driver}', [DriverController::class, 'update']);
    Route::delete('/drivers/{driver}', [DriverController::class, 'destroy']);


    // checkpoint routes
    Route::get('checkpoints', [CheckpointController::class, 'index'])->name('checkpoints.index');
    Route::get('checkpoints/create', [CheckpointController::class, 'create'])->name('checkpoints.create');
    Route::post('checkpoints', [CheckpointController::class, 'store'])->name('checkpoints.store');
    Route::get('checkpoints/{checkpoint}/edit', [CheckpointController::class, 'edit'])->name('checkpoints.edit');
    Route::put('checkpoints/{checkpoint}', [CheckpointController::class, 'update'])->name('checkpoints.update');
    Route::delete('checkpoints/{checkpoint}', [CheckpointController::class, 'destroy'])->name('checkpoints.destroy');
    // Optional: get currently authenticated user
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
