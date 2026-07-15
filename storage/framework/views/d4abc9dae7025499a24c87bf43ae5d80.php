<!DOCTYPE html>
<html lang="<?php echo e(str_replace('_', '-', app()->getLocale())); ?>">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">

        <title><?php echo e(config('app.name', 'Laravel')); ?> — Panel Admin</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700,800&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        <?php echo app('Illuminate\Foundation\Vite')(['resources/css/app.css', 'resources/js/app.js']); ?>
    </head>
    <body class="font-sans antialiased">
        <div class="min-h-screen flex">
            <!-- Left Panel: Brand / Ilustrasi -->
            <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0f2d52] to-[#1a4a7a] items-center justify-center p-12 relative overflow-hidden">
                <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(circle at 25% 50%, #fff 1px, transparent 1px); background-size: 32px 32px;"></div>
                <div class="relative text-center max-w-md">
                    <img src="/assets/images/project/logo.png" alt="Logo Disperdagin" class="h-28 w-auto mx-auto mb-8 brightness-0 invert opacity-90" />
                    <h2 class="text-3xl font-bold text-white mb-4">DISPERDAGIN</h2>
                    <p class="text-white/70 text-lg leading-relaxed">
                        Dinas Perdagangan dan Perindustrian<br>Kota Kediri
                    </p>
                    <div class="mt-10 h-px bg-white/10 w-24 mx-auto"></div>
                    <p class="mt-6 text-white/40 text-sm">
                        Sistem Informasi Harga & Pengelolaan Data Pasar
                    </p>
                </div>
            </div>

            <!-- Right Panel: Form -->
            <div class="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
                <div class="w-full max-w-sm">
                    <!-- Mobile logo -->
                    <div class="lg:hidden text-center mb-8">
                        <img src="/assets/images/project/logo.png" alt="Logo" class="h-16 w-auto mx-auto mb-3" />
                        <h2 class="text-xl font-bold text-[#0f2d52]">DISPERDAGIN Kota Kediri</h2>
                    </div>

                    <div class="bg-white rounded-2xl shadow-lg shadow-gray-200/80 p-8">
                        <div class="text-center mb-6">
                            <h1 class="text-2xl font-bold text-gray-900">Selamat Datang</h1>
                            <p class="text-sm text-gray-500 mt-1">Silakan masuk ke panel admin</p>
                        </div>

                        <?php echo e($slot); ?>

                    </div>

                    <p class="text-center text-xs text-gray-400 mt-8">
                        &copy; <?php echo e(date('Y')); ?> DISPERDAGIN Kota Kediri
                    </p>
                </div>
            </div>
        </div>
    </body>
</html>
<?php /**PATH C:\laragon\www\disperdagin-laravel-react2\resources\views/layouts/guest.blade.php ENDPATH**/ ?>