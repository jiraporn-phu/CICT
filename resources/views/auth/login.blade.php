@extends('layouts.guest')

@section('title', 'เข้าสู่ระบบ — ICTC-Asset')

@section('content')
<div x-data="{
    fillCreds(u, p) {
        $refs.username.value = u;
        $refs.password.value = p;
    }
}" class="bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 shadow-2xl space-y-6">
    <!-- Header -->
    <div class="text-center space-y-2">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-sky-500/10 border border-sky-500/20 p-2.5 flex items-center justify-center">
            <img src="{{ asset('logo_ictc.png') }}" alt="ICTC Logo" class="w-full h-full object-contain">
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-white">เข้าสู่ระบบ</h1>
        <p class="text-xs text-slate-400">ระบบบริหารจัดการยืม-คืนอุปกรณ์ ICTC-Asset</p>
    </div>

    <!-- Flash notifications -->
    @if(session('success'))
        <div class="p-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs flex items-center gap-2.5">
            <i data-lucide="check-circle" class="w-4 h-4 text-emerald-400 shrink-0"></i>
            <span>{{ session('success') }}</span>
        </div>
    @endif

    @if(session('info'))
        <div class="p-3.5 bg-sky-500/15 border border-sky-500/30 text-sky-300 rounded-2xl text-xs flex items-center gap-2.5">
            <i data-lucide="info" class="w-4 h-4 text-sky-400 shrink-0"></i>
            <span>{{ session('info') }}</span>
        </div>
    @endif

    @if($errors->any())
        <div class="p-3.5 bg-red-500/15 border border-red-500/30 text-red-300 rounded-2xl text-xs flex items-center gap-2.5">
            <i data-lucide="alert-circle" class="w-4 h-4 text-red-400 shrink-0"></i>
            <span>{{ $errors->first() }}</span>
        </div>
    @endif

    <!-- Login Form -->
    <form action="{{ route('login.post') }}" method="POST" class="space-y-4">
        @csrf
        <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">ชื่อผู้ใช้งาน (Username)</label>
            <div class="relative">
                <i data-lucide="user" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input x-ref="username" type="text" name="username" value="{{ old('username') }}" required autofocus
                       placeholder="กรอกชื่อผู้ใช้งาน"
                       class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all">
            </div>
        </div>

        <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">รหัสผ่าน (Password)</label>
            <div class="relative">
                <i data-lucide="lock" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input x-ref="password" type="password" name="password" required
                       placeholder="กรอกรหัสผ่าน"
                       class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all">
            </div>
        </div>

        <div class="flex items-center justify-between text-xs">
            <label class="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                <input type="checkbox" name="remember" class="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0">
                <span>จดจำการเข้าสู่ระบบ</span>
            </label>
        </div>

        <button type="submit" 
                class="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-500/25 transition-all text-sm flex items-center justify-center gap-2">
            <span>เข้าสู่ระบบ</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </button>
    </form>

    <!-- Demo Accounts Quick Fill -->
    <div class="pt-2 border-t border-slate-700/60">
        <p class="text-[11px] font-semibold text-slate-400 text-center mb-2">บัญชีทดสอบในระบบ (คลิกเพื่อกรอกอัตโนมัติ):</p>
        <div class="grid grid-cols-2 gap-2 text-xs">
            <button type="button" @click="fillCreds('admin', 'admin1234')"
                    class="p-2 rounded-xl bg-slate-900/40 hover:bg-slate-700 border border-slate-700/60 text-left transition-all">
                <span class="block font-bold text-sky-400">Admin</span>
                <span class="text-[10px] text-slate-400">admin / admin1234</span>
            </button>
            <button type="button" @click="fillCreds('user01', 'user1234')"
                    class="p-2 rounded-xl bg-slate-900/40 hover:bg-slate-700 border border-slate-700/60 text-left transition-all">
                <span class="block font-bold text-emerald-400">ผู้ใช้ทั่วไป</span>
                <span class="text-[10px] text-slate-400">user01 / user1234</span>
            </button>
        </div>
    </div>

    <!-- Register Link -->
    <div class="text-center pt-2">
        <p class="text-xs text-slate-400">
            ยังไม่มีบัญชีผู้ใช้งาน? 
            <a href="{{ route('register') }}" class="font-bold text-sky-400 hover:underline">ลงทะเบียนสมัครสมาชิก</a>
        </p>
    </div>
</div>
@endsection

