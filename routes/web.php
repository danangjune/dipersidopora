<?php

use App\Http\Controllers\Api\AdminCrudController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'app')->name('home');

/*
|--------------------------------------------------------------------------
| Auth Breeze
|--------------------------------------------------------------------------
*/
require __DIR__.'/auth.php';

/*
|--------------------------------------------------------------------------
| Admin Panel (SPA) - semua role terautentikasi bisa akses
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {
    Route::redirect('/dashboard', '/admin')->name('dashboard');

    Route::view('/admin', 'admin')->name('admin.index');
    Route::view('/admin/{any}', 'admin')
        ->where('any', '.*')
        ->name('admin.spa');
});

/*
|--------------------------------------------------------------------------
| Admin API - endpoint umum (dashboard, me, prices) untuk semua role
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->prefix('api/admin')->name('admin.api.')->group(function () {
    Route::get('/me', [AdminCrudController::class, 'me']);
    Route::get('/dashboard', [AdminCrudController::class, 'dashboard']);

    Route::get('/markets', [AdminCrudController::class, 'markets']);
    Route::get('/commodities', [AdminCrudController::class, 'commodities']);

    Route::match(['get', 'post'], '/prices', [AdminCrudController::class, 'prices']);
    Route::patch('/prices/{price}', [AdminCrudController::class, 'updatePrice']);
    Route::delete('/prices/{price}', [AdminCrudController::class, 'destroyPrice']);
    Route::get('/prices/export', [AdminCrudController::class, 'exportPrices']);
});

/*
|--------------------------------------------------------------------------
| Admin API - khusus admin (master data, CMS, dll)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:admin'])->prefix('api/admin')->group(function () {
    Route::post('/markets', [AdminCrudController::class, 'markets']);
    Route::patch('/markets/{market}', [AdminCrudController::class, 'updateMarket']);
    Route::delete('/markets/{market}', [AdminCrudController::class, 'destroyMarket']);

    Route::post('/commodities', [AdminCrudController::class, 'commodities']);
    Route::patch('/commodities/{commodity}', [AdminCrudController::class, 'updateCommodity']);
    Route::delete('/commodities/{commodity}', [AdminCrudController::class, 'destroyCommodity']);

    Route::match(['get', 'post'], '/het-hap', [AdminCrudController::class, 'hetHap']);
    Route::patch('/het-hap/{setting}', [AdminCrudController::class, 'updateHetHap']);
    Route::delete('/het-hap/{setting}', [AdminCrudController::class, 'destroyHetHap']);

    Route::match(['get', 'post'], '/pages', [AdminCrudController::class, 'pages']);
    Route::patch('/pages/{page}', [AdminCrudController::class, 'updatePage']);
    Route::delete('/pages/{page}', [AdminCrudController::class, 'destroyPage']);

    Route::match(['get', 'post'], '/downloads', [AdminCrudController::class, 'downloads']);
    Route::patch('/downloads/{download}', [AdminCrudController::class, 'updateDownload']);
    Route::delete('/downloads/{download}', [AdminCrudController::class, 'destroyDownload']);

    Route::match(['get', 'post'], '/survey-settings', [AdminCrudController::class, 'surveySettings']);
    Route::patch('/survey-settings/{surveySetting}', [AdminCrudController::class, 'updateSurveySetting']);
    Route::delete('/survey-settings/{surveySetting}', [AdminCrudController::class, 'destroySurveySetting']);

    Route::match(['get', 'post'], '/banners', [AdminCrudController::class, 'banners']);
    Route::patch('/banners/{banner}', [AdminCrudController::class, 'updateBanner']);
    Route::delete('/banners/{banner}', [AdminCrudController::class, 'destroyBanner']);

    Route::match(['get', 'post'], '/users', [AdminCrudController::class, 'users']);
    Route::patch('/users/{user}', [AdminCrudController::class, 'updateUser']);
    Route::delete('/users/{user}', [AdminCrudController::class, 'destroyUser']);
});

/*
|--------------------------------------------------------------------------
| Public React SPA Fallback
|--------------------------------------------------------------------------
*/
Route::view('/{any}', 'app')
    ->where('any', '^(?!admin|dashboard|login|register|forgot-password|reset-password|verify-email|confirm-password|logout|api|storage|assets|build).*$');