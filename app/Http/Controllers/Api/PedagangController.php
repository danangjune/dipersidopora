<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pedagang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class PedagangController extends Controller
{
    public function index(Request $request)
    {
        $query = Pedagang::query()
            ->when($request->query('q'), function ($q, string $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('nama_pemilik', 'like', "%{$search}%")
                        ->orWhere('nama_usaha', 'like', "%{$search}%")
                        ->orWhere('no_registrasi', 'like', "%{$search}%")
                        ->orWhere('jenis_jualan', 'like', "%{$search}%");
                });
            })
            ->when($request->query('status'), fn ($q, $status) => $q->where('status_validasi', $status))
            ->latest();

        return response()->json($query->paginate((int) $request->query('per_page', 15)));
    }

    public function store(Request $request)
    {
        $validated = $this->validatedPayload($request);
        $this->handleUploads($request, $validated);
        $validated['status_validasi'] = $validated['status_validasi'] ?? 'pending';

        $pedagang = Pedagang::create($validated);

        return response()->json(['status' => 'success', 'message' => 'Data pedagang berhasil disimpan.', 'data' => $pedagang], 201);
    }

    public function show(Pedagang $pedagang)
    {
        return response()->json(['status' => 'success', 'data' => $pedagang]);
    }

    public function update(Request $request, Pedagang $pedagang)
    {
        $validated = $this->validatedPayload($request, true);
        $this->handleUploads($request, $validated);
        $pedagang->update($validated);

        return response()->json(['status' => 'success', 'message' => 'Data pedagang berhasil diperbarui.', 'data' => $pedagang->fresh()]);
    }

    public function destroy(Pedagang $pedagang)
    {
        foreach (['foto_ktp', 'foto_nib', 'foto_lapak'] as $field) {
            if ($pedagang->{$field}) {
                Storage::disk('public')->delete($pedagang->{$field});
            }
        }
        $pedagang->delete();

        return response()->json(['status' => 'success', 'message' => 'Data pedagang berhasil dihapus.']);
    }

    public function validateStatus(Request $request, Pedagang $pedagang)
    {
        $validated = $request->validate([
            'status_validasi' => ['required', Rule::in(['pending', 'true', 'false'])],
        ]);

        $pedagang->update($validated);

        return response()->json(['status' => 'success', 'message' => 'Status validasi pedagang berhasil diperbarui.']);
    }

    public function stats()
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'total' => Pedagang::count(),
                'status' => Pedagang::selectRaw('status_validasi, COUNT(*) as total')->groupBy('status_validasi')->pluck('total', 'status_validasi'),
                'jenis_jualan' => Pedagang::selectRaw('jenis_jualan, COUNT(*) as total')->groupBy('jenis_jualan')->orderByDesc('total')->limit(10)->get(),
                'kecamatan' => Pedagang::selectRaw('kecamatan, COUNT(*) as total')->groupBy('kecamatan')->orderByDesc('total')->get(),
            ],
        ]);
    }

    public function export()
    {
        $filename = 'pedagang-'.now()->format('Ymd-His').'.csv';
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['No Registrasi', 'NIK', 'Nama Pemilik', 'Nama Usaha', 'Kecamatan', 'Kelurahan', 'Jenis Jualan', 'No HP', 'Status']);
            Pedagang::query()->orderBy('no_registrasi')->chunk(200, function ($rows) use ($handle) {
                foreach ($rows as $row) {
                    fputcsv($handle, [$row->no_registrasi, $row->nik, $row->nama_pemilik, $row->nama_usaha, $row->kecamatan, $row->nama_kelurahan, $row->jenis_jualan, $row->no_hp, $row->status_validasi]);
                }
            });
            fclose($handle);
        }, 200, $headers);
    }

    private function validatedPayload(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'no_registrasi' => [$partial ? 'sometimes' : 'nullable', 'string', 'max:30'],
            'nik' => ['nullable', 'regex:/^[0-9]{16}$/'],
            'nama_pemilik' => [$required, 'string', 'max:100'],
            'nama_usaha' => ['nullable', 'string', 'max:100'],
            'alamat_ktp' => ['nullable', 'string', 'max:500'],
            'kecamatan' => ['nullable', 'string', 'max:50'],
            'nama_kelurahan' => ['nullable', 'string', 'max:50'],
            'alamat_usaha' => ['nullable', 'string', 'max:500'],
            'deskripsi_alamat' => ['nullable', 'string', 'max:500'],
            'jenis_jualan' => ['nullable', 'string', 'max:80'],
            'jam_operasional' => ['nullable', 'string', 'max:80'],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'status_validasi' => ['nullable', Rule::in(['pending', 'true', 'false'])],
            'foto_ktp' => ['nullable', 'image', 'max:2048'],
            'foto_nib' => ['nullable', 'image', 'max:2048'],
            'foto_lapak' => ['nullable', 'image', 'max:2048'],
        ]);
    }

    private function handleUploads(Request $request, array &$validated): void
    {
        foreach (['foto_ktp', 'foto_nib', 'foto_lapak'] as $field) {
            if ($request->hasFile($field)) {
                $validated[$field] = $request->file($field)->store('pedagang', 'public');
            } else {
                unset($validated[$field]);
            }
        }
    }
}
