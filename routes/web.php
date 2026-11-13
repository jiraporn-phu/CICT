<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\BorrowController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AnnualAuditController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Public / Guest Routes
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
Route::post('/register', [AuthController::class, 'register'])->name('register.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Equipment Detail View (Publicly viewable or Auth)
Route::get('/equipment/{id}', [EquipmentController::class, 'show'])->name('equipment.show');

// Authenticated Routes (All Logged-in Users)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [AuthController::class, 'profile'])->name('profile');
    Route::put('/profile', [AuthController::class, 'updateProfile'])->name('profile.update');

    Route::post('/wishlist/{equipmentId}', [HomeController::class, 'toggleWishlist'])->name('wishlist.toggle');
    Route::get('/borrow/create', [BorrowController::class, 'create'])->name('borrow.create');
    Route::post('/borrow', [BorrowController::class, 'store'])->name('borrow.store');
    Route::get('/borrow/success/{id}', [BorrowController::class, 'success'])->name('borrow.success');
    Route::get('/my-requests', [BorrowController::class, 'myRequests'])->name('my-requests');
    Route::post('/my-requests/{id}/return', [BorrowController::class, 'submitReturn'])->name('borrow.return');
    Route::post('/my-requests/{id}/cancel', [BorrowController::class, 'cancelRequest'])->name('borrow.cancel');
    Route::get('/borrow/slip/{id}', [BorrowController::class, 'slip'])->name('borrow.slip');
});

// Admin Only Routes
Route::middleware(['auth', 'admin'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/report', [DashboardController::class, 'report'])->name('dashboard.report');

    // Equipment Management
    Route::get('/equipment', [EquipmentController::class, 'index'])->name('equipment.index');
    Route::post('/equipment', [EquipmentController::class, 'store'])->name('equipment.store');
    Route::put('/equipment/{id}', [EquipmentController::class, 'update'])->name('equipment.update');
    Route::delete('/equipment/{id}', [EquipmentController::class, 'destroy'])->name('equipment.destroy');

    // Category Management
    Route::post('/categories', [EquipmentController::class, 'storeCategory'])->name('categories.store');
    Route::post('/categories/delete', [EquipmentController::class, 'destroyCategory'])->name('categories.delete');

    // Borrow & Requisition Admin Tracking
    Route::get('/borrow', [BorrowController::class, 'index'])->name('borrow.index');
    Route::post('/borrow/{id}/approve', [BorrowController::class, 'approve'])->name('borrow.approve');
    Route::post('/borrow/{id}/reject', [BorrowController::class, 'reject'])->name('borrow.reject');
    Route::post('/borrow/{id}/mark-returned', [BorrowController::class, 'markReturned'])->name('borrow.mark-returned');
    Route::delete('/borrow/{id}', [BorrowController::class, 'destroy'])->name('borrow.destroy');

    // User Management
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::put('/users/{id}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('users.destroy');

    // Annual Audits & Inspection
    Route::get('/annual-audits', [AnnualAuditController::class, 'index'])->name('annual-audits.index');
    Route::post('/annual-audits/create-year', [AnnualAuditController::class, 'createYear'])->name('annual-audits.create-year');
    Route::post('/annual-audits/records/{id}/verify', [AnnualAuditController::class, 'verifyItem'])->name('annual-audits.verify-item');
    Route::post('/annual-audits/{auditId}/batch-verify', [AnnualAuditController::class, 'batchVerify'])->name('annual-audits.batch-verify');
    Route::get('/annual-audits/{auditId}/report', [AnnualAuditController::class, 'report'])->name('annual-audits.report');
    Route::get('/annual-audits/{auditId}/export-csv', [AnnualAuditController::class, 'exportCsv'])->name('annual-audits.export-csv');
});
