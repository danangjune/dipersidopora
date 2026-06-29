<?php

use App\Http\Controllers\Api\AdminCrudController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'app')->name('home');

/*
|--------------------------------------------------------------------------
| Auth Breeze
|--------------------------------------------------------------------------
| Breeze akan membuat routes/auth.php.
| Letakkan sebelum fallback SPA supaya /login, /register, dll tidak ditangkap React publik.
*/
require __DIR__.'/auth.php';

/*
|--------------------------------------------------------------------------
| Admin Panel + Admin API
|--------------------------------------------------------------------------
| Sengaja admin API ditaruh di web.php agar memakai session auth + CSRF Breeze.
| URL tetap /api/admin/... supaya frontend admin lama tidak perlu banyak berubah.
*/
Route::middleware(['auth'])->group(function () {
    Route::redirect('/dashboard', '/admin')->name('dashboard');

    Route::view('/admin', 'admin')->name('admin.index');
    Route::view('/admin/{any}', 'admin')
        ->where('any', '.*')
        ->name('admin.spa');

    Route::prefix('api/admin')->name('admin.api.')->group(function () {
        Route::get('/dashboard', [AdminCrudController::class, 'dashboard']);

        Route::match(['get', 'post'], '/markets', [AdminCrudController::class, 'markets']);
        Route::patch('/markets/{market}', [AdminCrudController::class, 'updateMarket']);
        Route::delete('/markets/{market}', [AdminCrudController::class, 'destroyMarket']);

        Route::match(['get', 'post'], '/commodities', [AdminCrudController::class, 'commodities']);
        Route::patch('/commodities/{commodity}', [AdminCrudController::class, 'updateCommodity']);
        Route::delete('/commodities/{commodity}', [AdminCrudController::class, 'destroyCommodity']);

        Route::match(['get', 'post'], '/prices', [AdminCrudController::class, 'prices']);
        Route::patch('/prices/{price}', [AdminCrudController::class, 'updatePrice']);
        Route::delete('/prices/{price}', [AdminCrudController::class, 'destroyPrice']);
        Route::get('/prices/export', [AdminCrudController::class, 'exportPrices']);

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
    });
});

/*
|--------------------------------------------------------------------------
| Public React SPA Fallback
|--------------------------------------------------------------------------
| Admin dan auth jangan sampai masuk ke app.blade.php.
*/
Route::view('/{any}', 'app')
    ->where('any', '^(?!admin|dashboard|login|register|forgot-password|reset-password|verify-email|confirm-password|logout|api|storage|assets|build).*$');