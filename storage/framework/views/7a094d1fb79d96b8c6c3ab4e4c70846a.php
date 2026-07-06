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
    <?php $__currentLoopData = $rows; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $row): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
        <tr>
            <td><?php echo e($row->price_date); ?></td>
            <td><?php echo e($row->pasar); ?></td>
            <td><?php echo e($row->komoditas); ?></td>
            <td><?php echo e($row->unit); ?></td>
            <td><?php echo e($row->price); ?></td>
            <td><?php echo e($row->previous_price); ?></td>
            <td><?php echo e($row->indicator_status); ?></td>
            <td><?php echo e($row->status_validasi); ?></td>
        </tr>
    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    </tbody>
</table>
</body>
</html>
<?php /**PATH C:\laragon\www\disperdagin-laravel-react2\resources\views/exports/prices.blade.php ENDPATH**/ ?>