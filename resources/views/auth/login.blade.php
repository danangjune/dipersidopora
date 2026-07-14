<x-guest-layout>
    <x-auth-session-status class="mb-4" :status="session('status')" />

    <form method="POST" action="{{ route('login') }}" class="space-y-5">
        @csrf

        <!-- Username / Email -->
        <div>
            <x-input-label for="login" :value="__('Username / Email')" />
            <x-text-input id="login" class="block mt-1.5 w-full px-4 py-3 rounded-xl border-gray-300 focus:border-[#0f2d52] focus:ring-[#0f2d52] shadow-sm" type="text" name="login" :value="old('login')" required autofocus autocomplete="username" placeholder="Masukkan username atau email" />
            <x-input-error :messages="$errors->get('login')" class="mt-2" />
        </div>

        <!-- Password -->
        <div>
            <x-input-label for="password" :value="__('Password')" />
            <x-text-input id="password" class="block mt-1.5 w-full px-4 py-3 rounded-xl border-gray-300 focus:border-[#0f2d52] focus:ring-[#0f2d52] shadow-sm" type="password" name="password" required autocomplete="current-password" placeholder="Masukkan password" />
            <x-input-error :messages="$errors->get('password')" class="mt-2" />
        </div>

        <!-- Remember + Forgot -->
        <div class="flex items-center justify-between">
            <label for="remember_me" class="inline-flex items-center gap-2 cursor-pointer">
                <input id="remember_me" type="checkbox" class="rounded border-gray-300 text-[#0f2d52] focus:ring-[#0f2d52] shadow-sm" name="remember">
                <span class="text-sm text-gray-600">{{ __('Remember me') }}</span>
            </label>

            @if (Route::has('password.request'))
                <a class="text-sm text-[#0f2d52] hover:text-[#1a4a7a] font-medium underline-offset-2 hover:underline" href="{{ route('password.request') }}">
                    Lupa password?
                </a>
            @endif
        </div>

        <!-- Submit -->
        <button type="submit" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0f2d52] hover:bg-[#1a3f6a] text-white font-semibold rounded-xl shadow-sm transition duration-150">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
            {{ __('Log in') }}
        </button>
    </form>
</x-guest-layout>
