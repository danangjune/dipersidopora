<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SurveyResponse;
use App\Models\SurveyResult;
use App\Models\SurveySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SurveyController extends Controller
{
    public function latest()
    {
        $latest = SurveyResult::query()->latest('id')->first();
        $totalVotes = SurveyResponse::query()->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_votes' => $totalVotes,
                'nilai_interval' => $latest?->nilai_interval ? round((float) $latest->nilai_interval, 2) : 0,
                'kategori' => $this->category((float) ($latest?->nilai_interval ?? 0)),
                'setting' => SurveySetting::query()->where('is_active', true)->latest()->first(),
                'latest' => $latest,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $rules = [
            'nama' => ['required', 'string', 'max:100'],
            'domisili' => ['required', 'string', 'max:150'],
        ];
        for ($i = 1; $i <= 9; $i++) {
            $rules["U{$i}"] = ['required', 'integer', 'between:1,4'];
        }

        $validated = $request->validate($rules);

        DB::transaction(function () use ($validated) {
            SurveyResponse::create($validated);
            $this->recalculateResult();
        });

        return response()->json(['status' => 'success', 'message' => 'Terima kasih, penilaian berhasil disimpan.'], 201);
    }

    private function recalculateResult(): void
    {
        $count = SurveyResponse::query()->count();
        if ($count === 0) {
            return;
        }

        $totals = [];
        $averages = [];
        $totalAll = 0;
        for ($i = 1; $i <= 9; $i++) {
            $sum = (int) SurveyResponse::query()->sum("U{$i}");
            $totals["total_U{$i}"] = $sum;
            $averages["rata_U{$i}"] = round($sum / $count, 4);
            $totalAll += $sum;
        }

        $score = ($totalAll / (9 * $count)) * 25;

        SurveyResult::create(array_merge($totals, $averages, [
            'total_semua' => $totalAll,
            'nilai_interval' => round($score, 4),
        ]));
    }

    private function category(float $score): string
    {
        return match (true) {
            $score >= 88.31 => 'Sangat Baik',
            $score >= 76.61 => 'Baik',
            $score >= 65.00 => 'Kurang Baik',
            $score > 0 => 'Tidak Baik',
            default => 'Belum ada data',
        };
    }
}
