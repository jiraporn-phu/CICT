@extends('layouts.app')

@section('title', 'ข้อมูลส่วนตัว — ICTC-Asset')

@section('content')
<div class="max-w-2xl mx-auto space-y-6">
    <!-- Header -->
    <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">ข้อมูลส่วนตัวและบัญชีผู้ใช้</h1>
        <p class="text-xs text-slate-400">อัปเดตข้อมูลผู้ใช้งานและรหัสผ่านสำหรับเข้าสู่ระบบ</p>
    </div>

    <!-- Profile Form -->
    <form action="{{ route('profile.update') }}" method="POST" enctype="multipart/form-data" 
          class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        @csrf
        @method('PUT')

        <!-- Avatar Upload -->
        <div class="flex items-center gap-5">
            <div class="relative w-20 h-20 rounded-full overflow-hidden border-2 border-sky-500/30 bg-slate-100 dark:bg-slate-800 shrink-0">
                <img src="{{ $user->avatar_url }}" alt="" class="w-full h-full object-cover">
            </div>
            <div class="space-y-1.5 flex-1">
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-200">เปลี่ยนรูปโปรไฟล์</label>
                <input type="file" name="avatar" accept="image/*"
                       class="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 dark:file:bg-sky-950/60 file:text-sky-600 dark:file:text-sky-400 hover:file:bg-sky-100">
                <span class="text-[10px] text-slate-400 block">รองรับไฟล์รูปภาพ JPG, PNG ขนาดไม่เกิน 3MB</span>
            </div>
        </div>

        <div class="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ชื่อผู้ใช้งาน (Username)</label>
                    <input type="text" value="{{ $user->username }}" disabled
                           class="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">สิทธิ์การใช้งาน (Role)</label>
                    <input type="text" value="{{ strtoupper($user->role) }}" disabled
                           class="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700">
                </div>
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ชื่อ - นามสกุล *</label>
                <input type="text" name="fullName" value="{{ old('fullName', $user->fullName) }}" required
                       class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-sky-500">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">เบอร์โทรศัพท์</label>
                    <input type="text" name="phone" value="{{ old('phone', $user->phone) }}" placeholder="08xxxxxxxx"
                           class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-sky-500">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">แผนก / สังกัด</label>
                    <input type="text" name="department" value="{{ old('department', $user->department) }}" placeholder="เช่น IT, PR"
                           class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-sky-500">
                </div>
            </div>
        </div>

        <!-- Password Change Section -->
        <div class="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-4">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <i data-lucide="key" class="w-4 h-4 text-sky-500"></i>
                <span>เปลี่ยนรหัสผ่าน (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)</span>
            </h3>

            <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">รหัสผ่านปัจจุบัน</label>
                <input type="password" name="current_password" placeholder="กรอกรหัสผ่านปัจจุบันเพื่อยืนยัน"
                       class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-sky-500">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">รหัสผ่านใหม่</label>
                    <input type="password" name="new_password" placeholder="อย่างน้อย 8 ตัวอักษร"
                           class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-sky-500">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ยืนยันรหัสผ่านใหม่</label>
                    <input type="password" name="new_password_confirmation" placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง"
                           class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-sky-500">
                </div>
            </div>
        </div>

        <div class="pt-4 flex items-center justify-end">
            <button type="submit" 
                    class="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2">
                <i data-lucide="save" class="w-4 h-4"></i>
                <span>บันทึกการเปลี่ยนแปลง</span>
            </button>
        </div>
    </form>
</div>
@endsection

