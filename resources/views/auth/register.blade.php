@extends('layouts.guest')

@section('title', 'สมัครสมาชิก — ICTC-Asset')

@section('content')
<div class="bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 shadow-2xl space-y-6">
    <!-- Header -->
    <div class="text-center space-y-2">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-sky-500/10 border border-sky-500/20 p-2 flex items-center justify-center">
            <img src="{{ asset('logo_ictc.png') }}" alt="ICTC Logo" class="w-full h-full object-contain">
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-white">สมัครสมาชิก</h1>
        <p class="text-xs text-slate-400">ลงทะเบียนเข้าใช้งานระบบ ICTC-Asset</p>
    </div>

    <!-- Alert about approval -->
    <div class="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-2xl text-xs flex items-center gap-2.5">
        <i data-lucide="info" class="w-4 h-4 text-amber-400 shrink-0"></i>
        <span>เมื่อลงทะเบียนแล้ว บัญชีจะต้องรอการอนุมัติจากผู้ดูแลระบบก่อนจึงจะเข้าสู่ระบบได้</span>
    </div>

    @if($errors->any())
        <div class="p-3.5 bg-red-500/15 border border-red-500/30 text-red-300 rounded-2xl text-xs space-y-1">
            <div class="font-bold flex items-center gap-1.5">
                <i data-lucide="alert-circle" class="w-4 h-4"></i>
                <span>เกิดข้อผิดพลาด:</span>
            </div>
            <ul class="list-disc list-inside pl-4 text-[11px] space-y-0.5">
                @foreach($errors->all() as $err)
                    <li>{{ $err }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="{{ route('register.post') }}" method="POST" class="space-y-3.5">
        @csrf
        <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">ชื่อผู้ใช้งาน (Username) *</label>
            <input type="text" name="username" value="{{ old('username') }}" required
                   placeholder="ตัวอักษรภาษาอังกฤษหรือตัวเลขอย่างน้อย 4 ตัว"
                   class="w-full px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all">
        </div>

        <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">ชื่อ - นามสกุล *</label>
            <input type="text" name="fullName" value="{{ old('fullName') }}" required
                   placeholder="เช่น สมชาย ใจดี"
                   class="w-full px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all">
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">เบอร์โทรศัพท์ *</label>
                <input type="text" name="phone" value="{{ old('phone') }}" required
                       placeholder="08xxxxxxxx"
                       class="w-full px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all">
            </div>
            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">แผนก / ฝ่าย</label>
                <select name="department" class="w-full px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all">
                    <option value="IT" {{ old('department') == 'IT' ? 'selected' : '' }}>IT (เทคโนโลยีสารสนเทศ)</option>
                    <option value="PR" {{ old('department') == 'PR' ? 'selected' : '' }}>PR (ประชาสัมพันธ์)</option>
                    <option value="General" {{ old('department') == 'General' ? 'selected' : '' }}>ทั่วไป (General)</option>
                </select>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">รหัสผ่าน *</label>
                <input type="password" name="password" required
                       placeholder="อย่างน้อย 8 ตัวอักษร"
                       class="w-full px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all">
            </div>
            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">ยืนยันรหัสผ่าน *</label>
                <input type="password" name="password_confirmation" required
                       placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                       class="w-full px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all">
            </div>
        </div>

        <button type="submit" 
                class="w-full mt-2 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-500/25 transition-all text-sm flex items-center justify-center gap-2">
            <span>ยืนยันการลงทะเบียน</span>
            <i data-lucide="user-plus" class="w-4 h-4"></i>
        </button>
    </form>

    <div class="text-center pt-2 border-t border-slate-700/60">
        <p class="text-xs text-slate-400">
            มีบัญชีผู้ใช้งานอยู่แล้ว? 
            <a href="{{ route('login') }}" class="font-bold text-sky-400 hover:underline">เข้าสู่ระบบ</a>
        </p>
    </div>
</div>
@endsection

