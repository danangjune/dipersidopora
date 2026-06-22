<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class MarketPriceController extends Controller
{
    private array $tables = [
        'bandar' => 'data_barang_bandar',
        'pahing' => 'data_barang_pahing',
        'setonobetek' => 'data_barang_setonobetek',
    ];

    private array $locations = [
        'Pasar Bandar' => 'data_barang_bandar',
        'Pasar Pahing' => 'data_barang_pahing',
        'Pasar Setono Betek' => 'data_barang_setonobetek',
    ];

    public function latest(Request $request)
    {
        if (Schema::hasTable('commodity_price_records')) {
            return app(\App\Http\Controllers\Api\MarketDataController::class)->publicSummary($request);
        }
        $tanggal = $request->query('tanggal');
        $union = $this->unionQuery($tanggal);

        $rows = DB::query()
            ->fromSub($union, 'combined_data')
            ->selectRaw("nama_barang, FLOOR(AVG(CASE WHEN harga_sekarang > 0 THEN harga_sekarang ELSE NULL END)) AS rata_rata_harga")
            ->selectRaw("FLOOR(AVG(CASE WHEN harga_kemarin > 0 THEN harga_kemarin ELSE NULL END)) AS rata_rata_harga_kemarin")
            ->selectRaw('MAX(tanggal) AS tanggal_terupdate, gambar')
            ->where('status_validasi', 'true')
            ->groupBy('nama_barang', 'gambar')
            ->orderBy('nama_barang')
            ->get()
            ->map(function ($row) {
                $hargaSekarang = (int) ($row->rata_rata_harga ?? 0);
                $hargaKemarin = (int) ($row->rata_rata_harga_kemarin ?? 0);
                $selisih = $hargaSekarang - $hargaKemarin;

                return [
                    'nama_komoditas' => $row->nama_barang,
                    'harga_sekarang' => $hargaSekarang,
                    'harga_sebelumnya' => $hargaKemarin,
                    'selisih' => $selisih,
                    'tren' => $selisih > 0 ? 'naik' : ($selisih < 0 ? 'turun' : 'tetap'),
                    'tanggal' => $row->tanggal_terupdate,
                    'url_gambar' => asset('assets/images/komoditas/'.($row->gambar ?: 'default.png')),
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => ['list_komoditas' => $rows],
        ]);
    }

    public function table(Request $request)
    {
        if (Schema::hasTable('commodity_price_records')) {
            return app(\App\Http\Controllers\Api\MarketDataController::class)->publicSummary($request);
        }
        $tanggal = $request->query('tanggal');
        $union = $this->unionQuery($tanggal);

        $rows = DB::query()
            ->fromSub($union, 'ranked')
            ->selectRaw('nama_barang, tanggal, gambar')
            ->selectRaw("FLOOR(AVG(CASE WHEN harga_sekarang > 0 THEN harga_sekarang ELSE NULL END)) AS rata_rata_harga")
            ->selectRaw("FLOOR(AVG(CASE WHEN harga_kemarin > 0 THEN harga_kemarin ELSE NULL END)) AS rata_rata_harga_kemarin")
            ->selectRaw("FLOOR(AVG(CASE WHEN harga_sekarang > 0 AND harga_kemarin > 0 THEN harga_sekarang - harga_kemarin ELSE NULL END)) AS selisih_rata_rata")
            ->where('status_validasi', 'true')
            ->groupBy('nama_barang', 'tanggal', 'gambar')
            ->orderByDesc('tanggal')
            ->orderBy('nama_barang')
            ->get();

        return response()->json(['status' => 'success', 'data' => $rows]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tanggal' => ['required', 'date'],
            'lokasi' => ['required', Rule::in(array_keys($this->locations))],
            'items' => ['required', 'array', 'min:1'],
            'items.*.nama_barang' => ['required', 'string', 'max:100'],
            'items.*.harga_sekarang' => ['required', 'integer', 'min:0'],
            'items.*.satuan' => ['nullable', 'string', 'max:30'],
            'items.*.gambar' => ['nullable', 'string', 'max:255'],
        ]);

        $table = $this->locations[$validated['lokasi']];
        $inserted = [];

        DB::transaction(function () use ($validated, $table, &$inserted) {
            foreach ($validated['items'] as $item) {
                $lastPrice = DB::table($table)
                    ->where('nama_barang', $item['nama_barang'])
                    ->orderByDesc('tanggal')
                    ->value('harga_sekarang') ?? 0;

                $current = (int) $item['harga_sekarang'];
                $id = DB::table($table)->insertGetId([
                    'tanggal' => $validated['tanggal'],
                    'lokasi' => $validated['lokasi'],
                    'nama_barang' => $item['nama_barang'],
                    'harga_sekarang' => $current,
                    'harga_kemarin' => (int) $lastPrice,
                    'satuan' => $item['satuan'] ?? null,
                    'selisih' => $current - (int) $lastPrice,
                    'gambar' => $item['gambar'] ?? null,
                    'status_validasi' => 'pending',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $inserted[] = $id;
            }
        });

        return response()->json(['status' => 'success', 'message' => 'Data harga berhasil diajukan.', 'ids' => $inserted], 201);
    }

    public function pending(string $pasar)
    {
        $table = $this->tableFromSlug($pasar);
        $rows = DB::table($table)->where('status_validasi', 'pending')->orderByDesc('tanggal')->get();

        return response()->json(['status' => 'success', 'data' => $rows]);
    }

    public function update(Request $request, string $pasar, int $id)
    {
        $table = $this->tableFromSlug($pasar);
        $validated = $request->validate([
            'harga_sekarang' => ['required', 'integer', 'min:0'],
            'satuan' => ['nullable', 'string', 'max:30'],
            'gambar' => ['nullable', 'string', 'max:255'],
        ]);

        $row = DB::table($table)->where('id_barang', $id)->first();
        abort_if(!$row, 404, 'Data harga tidak ditemukan.');

        $hargaKemarin = (int) ($row->harga_kemarin ?? 0);
        DB::table($table)->where('id_barang', $id)->update([
            'harga_sekarang' => $validated['harga_sekarang'],
            'satuan' => $validated['satuan'] ?? $row->satuan,
            'gambar' => $validated['gambar'] ?? $row->gambar,
            'selisih' => (int) $validated['harga_sekarang'] - $hargaKemarin,
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Data harga berhasil diperbarui.']);
    }

    public function validatePrice(Request $request, string $pasar, int $id)
    {
        $table = $this->tableFromSlug($pasar);
        $validated = $request->validate([
            'status_validasi' => ['required', Rule::in(['true', 'false', 'pending'])],
        ]);

        $affected = DB::table($table)->where('id_barang', $id)->update([
            'status_validasi' => $validated['status_validasi'],
            'updated_at' => now(),
        ]);

        abort_if($affected === 0, 404, 'Data harga tidak ditemukan.');

        return response()->json(['status' => 'success', 'message' => 'Status validasi berhasil diperbarui.']);
    }

    private function unionQuery(?string $tanggal = null)
    {
        $queries = [];
        foreach ($this->tables as $table) {
            $q = DB::table($table)->select([
                'nama_barang', 'harga_sekarang', 'harga_kemarin', 'tanggal', 'gambar', 'status_validasi', 'lokasi', 'satuan', 'selisih',
            ]);
            if ($tanggal) {
                $q->whereDate('tanggal', $tanggal);
            }
            $queries[] = $q;
        }

        $base = array_shift($queries);
        foreach ($queries as $query) {
            $base->unionAll($query);
        }

        return $base;
    }

    private function tableFromSlug(string $pasar): string
    {
        abort_if(! array_key_exists($pasar, $this->tables), 404, 'Pasar tidak valid.');
        return $this->tables[$pasar];
    }
}
