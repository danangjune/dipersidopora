<!doctype html>
<html>
<head><meta charset="utf-8"></head>
<body>
<table border="1">
    <thead>
    <tr>
        <th>Tanggal</th>
        <th>Komoditas</th>
        <th>Satuan</th>
        <th>Harga Sekarang</th>
        <th>Harga Kemarin</th>
        <th>Selisih</th>
        <th>Rata-rata ({{ $dateFrom ?? '-' }} sd {{ $dateTo ?? '-' }})</th>
        <th>Indikator</th>
    </tr>
    </thead>
    <tbody>
    @foreach ($rows as $row)
        <tr>
            <td>{{ $row->price_date }}</td>
            <td>{{ $row->komoditas }}</td>
            <td>{{ $row->unit }}</td>
            <td>{{ number_format($row->harga_sekarang, 0, ',', '.') }}</td>
            <td>{{ number_format($row->harga_kemarin, 0, ',', '.') }}</td>
            <td>{{ $row->selisih > 0 ? '+' : '' }}{{ number_format($row->selisih, 0, ',', '.') }}</td>
            <td>{{ number_format($row->rata_rata, 0, ',', '.') }}</td>
            <td>{{ $row->indikator }}</td>
        </tr>
    @endforeach
    </tbody>
</table>
</body>
</html>
