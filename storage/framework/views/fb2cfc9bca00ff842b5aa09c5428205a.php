<!DOCTYPE html>
<html lang="<?php echo e(str_replace('_', '-', app()->getLocale())); ?>">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">

    <title>Admin Panel - <?php echo e(config('app.name', 'DISPERDAGIN')); ?></title>

    <?php echo app('Illuminate\Foundation\Vite')->reactRefresh(); ?>
    <?php echo app('Illuminate\Foundation\Vite')(['resources/css/admin.css', 'resources/js/admin.jsx']); ?>
</head>
<body>
    <div id="admin-root"></div>
</body>
</html><?php /**PATH C:\laragon\www\dagang\resources\views/admin.blade.php ENDPATH**/ ?>