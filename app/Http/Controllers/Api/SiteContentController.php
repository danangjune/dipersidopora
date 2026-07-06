<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DownloadDocument;
use App\Models\Komoditas;
use App\Models\Pasar;
use App\Models\Pedagang;
use App\Models\SiteBanner;
use App\Models\SitePage;
use App\Models\SiteSetting;
use App\Models\SurveySetting;

class SiteContentController extends Controller
{
    public function page(string $slug)
    {
        $slug = trim($slug, '/');
        $slug = str_replace('_', '-', $slug);
        $slug = preg_replace('/\.php$/', '', $slug);

        $aliases = [
            'programkegiatan' => 'program-kegiatan',
            'td-gudang' => 'layanan/td-gudang',
            'tdgudang' => 'layanan/td-gudang',
            'halal' => 'layanan/halal',
            'merk' => 'layanan/merk',
            'sinas' => 'layanan/sinas',
            'tera' => 'layanan/tera',
            'minhol' => 'layanan/minhol',
            'contact' => 'kontak',
            'maintance' => 'maintenance',
        ];

        $slug = $aliases[$slug] ?? $slug;

        $page = SitePage::query()
            ->where('slug', $slug)
            ->where('is_published', true)
            ->first();

        if (! $page) {
            abort(404, 'Halaman tidak ditemukan.');
        }

        $data = $page->toArray();

        if ($slug === 'pasar') {
            $data['cards'] = Pasar::query()
                ->where('is_active', true)
                ->where('category', 'Pasar Rakyat')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get()
                ->map(fn($item) => [
                    'title' => $item->name,
                    'text' => $item->address ?: $item->category,
                    'image' => $item->image,
                ])
                ->values();
        }

        if ($slug === 'pasar-modern') {
            $data['cards'] = Pasar::query()
                ->where('is_active', true)
                ->where('category', 'Pasar Modern')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get()
                ->map(fn($item) => [
                    'title' => $item->name,
                    'text' => $item->address ?: $item->category,
                    'image' => $item->image,
                ])
                ->values();
        }

        if ($slug === 'minimarket') {
            $data['cards'] = Pasar::query()
                ->where('is_active', true)
                ->where('category', 'Minimarket')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get()
                ->map(fn($item) => [
                    'title' => $item->name,
                    'text' => $item->address ?: $item->category,
                    'image' => $item->image,
                ])
                ->values();
        }

        if ($slug === 'mall') {
            $data['cards'] = Pasar::query()
                ->where('is_active', true)
                ->whereIn('category', ['Mall', 'Pusat Perbelanjaan'])
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get()
                ->map(fn($item) => [
                    'title' => $item->name,
                    'text' => $item->address ?: $item->category,
                    'image' => $item->image,
                ])
                ->values();
        }

        if ($slug === 'komoditas') {
            $data['cards'] = Komoditas::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get()
                ->map(fn($item) => [
                    'title' => $item->name,
                    'text' => 'Satuan: ' . ($item->unit ?: '-'),
                    'image' => $item->image,
                ])
                ->values();
        }

        if ($slug === 'pedagang') {
            $total = Pedagang::count();
            $valid = Pedagang::where('status_validasi', 'true')->count();
            $pending = Pedagang::where('status_validasi', 'pending')->count();

            $data['cards'] = [
                [
                    'title' => 'Total Pedagang',
                    'text' => "{$total} data pedagang terdaftar",
                ],
                [
                    'title' => 'Tervalidasi',
                    'text' => "{$valid} data sudah tervalidasi",
                ],
                [
                    'title' => 'Menunggu Validasi',
                    'text' => "{$pending} data menunggu validasi",
                ],
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }
    public function downloads(string $category)
    {
        $items = DownloadDocument::query()
            ->where('category', $category)
            ->where('is_published', true)
            ->orderBy('sort_order')
            ->orderBy('title')
            ->get();
        return response()->json(['status' => 'success', 'data' => $items]);
    }

    public function surveySetting()
    {
        $setting = SurveySetting::query()->where('is_active', true)->latest()->first();
        return response()->json(['status' => 'success', 'data' => $setting]);
    }

    public function banners()
    {
        $items = SiteBanner::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();
        return response()->json(['status' => 'success', 'data' => $items]);
    }

    public function services()
    {
        $items = SitePage::query()
            ->where('group', 'Layanan')
            ->where('is_published', true)
            ->orderBy('sort_order')
            ->orderBy('title')
            ->get(['id', 'title', 'slug', 'excerpt', 'content', 'image', 'external_url']);
        return response()->json(['status' => 'success', 'data' => $items]);
    }

    public function settings()
    {
        $items = SiteSetting::query()->pluck('value', 'key');
        return response()->json(['status' => 'success', 'data' => $items]);
    }
}
