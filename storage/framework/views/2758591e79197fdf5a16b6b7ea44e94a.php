<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">
    <title><?php echo e(config('app.name', 'DISPERDAGIN Kota Kediri')); ?></title>
    <link rel="icon" href="/assets/images/lpicon2.png">
    <?php echo app('Illuminate\Foundation\Vite')->reactRefresh(); ?>
    <?php echo app('Illuminate\Foundation\Vite')(['resources/css/public.css', 'resources/js/app.jsx']); ?>
</head>
<body>
    <div id="root"></div>
</body>
</html>
<?php /**PATH C:\laragon\www\dagang\resources\views/app.blade.php ENDPATH**/ ?>