<?php

use App\Http\Controllers\Api\AdminCrudController;
use App\Http\Controllers\Api\MarketDataController;
use App\Http\Controllers\Api\MarketPriceController;
use App\Http\Controllers\Api\PedagangController;
use App\Http\Controllers\Api\SiteContentController;
use App\Http\Controllers\Api\SurveyController;
use App\Http\Controllers\Api\VisitorController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn() => ['status' => 'ok', 'app' => config('app.name')]);
Route::post('/visitors/increment', [VisitorController::class, 'increment']);

// Public dynamic content.
Route::get('/site/page/{slug}', [SiteContentController::class, 'page'])
    ->where('slug', '.*');

Route::get('/site/downloads/{category}', [SiteContentController::class, 'downloads']);
Route::get('/site/download-categories', [SiteContentController::class, 'downloadCategories']);

Route::get('/site/survey-setting', [SiteContentController::class, 'surveySetting']);

Route::get('/site/banners', [SiteContentController::class, 'banners']);
Route::get('/site/services', [SiteContentController::class, 'services']);
Route::get('/site/settings', [SiteContentController::class, 'settings']);
Route::get('/site/tentang', [SiteContentController::class, 'tentang']);
Route::get('/site/layanan-halal', [SiteContentController::class, 'layananHalal']);
Route::get('/site/layanan-merk', [SiteContentController::class, 'layananMerk']);
Route::get('/site/layanan-sinas', [SiteContentController::class, 'layananSinas']);
Route::get('/site/layanan-tera', [SiteContentController::class, 'layananTera']);
Route::get('/site/layanan-tdg', [SiteContentController::class, 'layananTdg']);
Route::get('/site/layanan-minhol', [SiteContentController::class, 'layananMinhol']);
Route::get('/site/zona-integritas', [SiteContentController::class, 'zonaIntegritas']);
Route::get('/site/program-kegiatan', [SiteContentController::class, 'programKegiatan']);
Route::get('/site/pasar', [SiteContentController::class, 'pasar']);
Route::get('/site/pasar-modern', [SiteContentController::class, 'pasarModern']);
Route::get('/site/mall', [SiteContentController::class, 'mall']);
Route::get('/site/ikm', [SiteContentController::class, 'ikm']);

// New normalized, dynamic commodity price API.
Route::get('/market/filters', [MarketDataController::class, 'filters']);
Route::get('/market/summary', [MarketDataController::class, 'publicSummary']);
Route::get('/market/chart', [MarketDataController::class, 'chart']);
Route::get('/market/admin-averages', [MarketDataController::class, 'adminAverages']);

// Backward-compatible endpoints from the native PHP conversion.
Route::get('/market-prices', [MarketPriceController::class, 'latest']);
Route::get('/market-prices/table', [MarketPriceController::class, 'table']);
Route::post('/market-prices', [MarketPriceController::class, 'store']);
Route::get('/market-prices/pending/{pasar}', [MarketPriceController::class, 'pending']);
Route::patch('/market-prices/{pasar}/{id}', [MarketPriceController::class, 'update']);
Route::patch('/market-prices/{pasar}/{id}/validate', [MarketPriceController::class, 'validatePrice']);

Route::get('/survey/latest', [SurveyController::class, 'latest']);
Route::post('/survey', [SurveyController::class, 'store']);

Route::get('/pedagang/stats', [PedagangController::class, 'stats']);
Route::get('/pedagang/export', [PedagangController::class, 'export']);
Route::apiResource('/pedagang', PedagangController::class);
Route::patch('/pedagang/{pedagang}/validate', [PedagangController::class, 'validateStatus']);


Route::get('/dashboard', [AdminCrudController::class, 'dashboard']);
Route::match(['get', 'post'], '/markets', [AdminCrudController::class, 'markets']);
Route::patch('/markets/{market}', [AdminCrudController::class, 'updateMarket']);
Route::delete('/markets/{market}', [AdminCrudController::class, 'destroyMarket']);

Route::match(['get', 'post'], '/commodities', [AdminCrudController::class, 'commodities']);
Route::patch('/commodities/{commodity}', [AdminCrudController::class, 'updateCommodity']);
Route::delete('/commodities/{commodity}', [AdminCrudController::class, 'destroyCommodity']);

Route::match(['get', 'post'], '/prices', [AdminCrudController::class, 'prices']);
Route::post('/prices/bulk', [AdminCrudController::class, 'bulkPrices']);
Route::patch('/prices/{price}', [AdminCrudController::class, 'updatePrice']);
Route::delete('/prices/{price}', [AdminCrudController::class, 'destroyPrice']);
Route::get('/prices/export', [AdminCrudController::class, 'exportPrices']);
Route::get('/prices/export-avg', [AdminCrudController::class, 'exportPricesAggregated']);

Route::match(['get', 'post'], '/het-hap', [AdminCrudController::class, 'hetHap']);
Route::patch('/het-hap/{setting}', [AdminCrudController::class, 'updateHetHap']);
Route::delete('/het-hap/{setting}', [AdminCrudController::class, 'destroyHetHap']);

Route::match(['get', 'post'], '/pages', [AdminCrudController::class, 'pages']);
Route::patch('/pages/{page}', [AdminCrudController::class, 'updatePage']);
Route::delete('/pages/{page}', [AdminCrudController::class, 'destroyPage']);

Route::match(['get', 'post'], '/downloads', [AdminCrudController::class, 'downloads']);
Route::patch('/downloads/{download}', [AdminCrudController::class, 'updateDownload']);
Route::delete('/downloads/{download}', [AdminCrudController::class, 'destroyDownload']);

Route::match(['get', 'post'], '/download-categories', [AdminCrudController::class, 'downloadCategories']);
Route::patch('/download-categories/{downloadCategory}', [AdminCrudController::class, 'updateDownloadCategory']);
Route::delete('/download-categories/{downloadCategory}', [AdminCrudController::class, 'destroyDownloadCategory']);

Route::match(['get', 'post'], '/survey-settings', [AdminCrudController::class, 'surveySettings']);
Route::patch('/survey-settings/{surveySetting}', [AdminCrudController::class, 'updateSurveySetting']);
Route::delete('/survey-settings/{surveySetting}', [AdminCrudController::class, 'destroySurveySetting']);
