<!doctype html>
<html>
<head><meta charset="utf-8"></head>
<body>
<table border="1">
    <thead>
    <tr>
        <th>Tanggal</th>
        <th>Pasar</th>
        <th>Komoditas</th>
        <th>Satuan</th>
        <th>Harga</th>
        <th>Harga Sebelumnya</th>
        <th>Indikator</th>
        <th>Status Validasi</th>
    </tr>
    </thead>
    <tbody>
    @foreach ($rows as $row)
        <tr>
            <td>{{ $row->price_date }}</td>
            <td>{{ $row->pasar }}</td>
            <td>{{ $row->komoditas }}</td>
            <td>{{ $row->unit }}</td>
            <td>{{ $row->price }}</td>
            <td>{{ $row->previous_price }}</td>
            <td>{{ $row->indicator_status }}</td>
            <td>{{ $row->status_validasi }}</td>
        </tr>
    @endforeach
    </tbody>
</table>
</body>
</html>
