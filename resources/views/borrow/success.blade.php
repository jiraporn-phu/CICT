@extends('layouts.app')

@section('title', "ผลการส่งคำขอยืม #{$transaction->id} — ICTC-Asset")

@section('content')
<div class="max-w-3xl mx-auto space-y-8 py-4">

    <!-- Top Success Header -->
    <div class="text-center space-y-3">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-4 border-emerald-200 dark:border-emerald-800 shadow-xl shadow-emerald-500/10 animate-bounce">
            <i data-lucide="check" class="w-10 h-10"></i>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            {{ $transaction->transaction_type === 'REQUISITION' ? 'ส่งคำขอเบิกอุปกรณ์สำเร็จ!' : 'ส่งคำขอยืมอุปกรณ์สำเร็จ!' }}
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            ระบบได้บันทึกคำขอของคุณเรียบร้อยแล้ว เลขที่อ้างอิงเอกสาร
            <strong class="font-mono text-sky-600 dark:text-sky-400 font-bold">#{{ str_pad($transaction->id, 5, '0', STR_PAD_LEFT) }}</strong>
        </p>
    </div>

    <!-- Main Detail Card -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
        
        <!-- Top Reference Bar -->
        <div class="bg-slate-50 dark:bg-slate-800/60 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-2">
                <span class="text-slate-400">ประเภทรายการ:</span>
                <span class="px-2.5 py-1 rounded-full font-bold {{ $transaction->transaction_type === 'REQUISITION' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' : 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300' }}">
                    {{ $transaction->transaction_type === 'REQUISITION' ? 'เบิกใช้งาน (สิ้นเปลือง)' : 'ยืมพัสดุ (ส่งคืน)' }}
                </span>
            </div>

            <div class="flex items-center gap-2">
                <span class="text-slate-400">สถานะปัจจุบัน:</span>
                <span class="px-3 py-1 rounded-full font-bold border {{ $transaction->status_badge_class }}">
                    {{ $transaction->status_label }}
                </span>
            </div>
        </div>

        <div class="p-6 sm:p-8 space-y-6">

            <!-- Equipment Box -->
            <div class="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <img src="{{ $transaction->equipment->display_image ?? asset('logo_ictc.png') }}" 
                     alt="{{ $transaction->equipment->name ?? 'อุปกรณ์' }}" 
                     class="w-24 h-24 rounded-2xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm">
                
                <div class="space-y-1.5 text-center sm:text-left flex-1">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-sky-500">
                        {{ $transaction->equipment->department ?? 'ICTC' }} &bull; {{ $transaction->equipment->category ?? 'ครุภัณฑ์' }}
                    </span>
                    <h3 class="text-base sm:text-lg font-bold text-slate-800 dark:text-white leading-snug">
                        {{ $transaction->equipment->name ?? '-' }}
                    </h3>
                    <p class="text-xs text-slate-400 line-clamp-2">
                        {{ $transaction->equipment->description ?: 'ไม่มีรายละเอียดเพิ่มเติม' }}
                    </p>
                    <div class="pt-1 flex items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>จำนวนที่ขอ: <strong class="text-sky-600 dark:text-sky-400 text-sm font-extrabold">{{ $transaction->borrow_quantity }}</strong> ชิ้น</span>
                        <span>&bull;</span>
                        <span>จุดรับ: <strong>{{ $transaction->pickup_location ?: 'ห้อง ICTC ชั้น 2' }}</strong></span>
                    </div>
                </div>
            </div>

            <!-- Transaction Details Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <!-- Period -->
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                    <h4 class="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <i data-lucide="calendar" class="w-4 h-4 text-sky-500"></i>
                        <span>กำหนดระยะเวลา</span>
                    </h4>
                    <div class="space-y-1 text-slate-600 dark:text-slate-300">
                        <p class="flex justify-between">
                            <span class="text-slate-400">วันที่ยืม/ทำรายการ:</span>
                            <span class="font-bold">{{ $transaction->borrow_date ? $transaction->borrow_date->format('d/m/Y H:i') : date('d/m/Y H:i') }}</span>
                        </p>
                        <p class="flex justify-between">
                            <span class="text-slate-400">กำหนดวันส่งคืน:</span>
                            <span class="font-bold text-sky-600 dark:text-sky-400">{{ $transaction->due_date ? $transaction->due_date->format('d/m/Y') : '-' }}</span>
                        </p>
                        @if($transaction->due_date && $transaction->borrow_date)
                            <p class="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-400">
                                <span>รวมระยะเวลายืม:</span>
                                <span>{{ $transaction->borrow_date->diffInDays($transaction->due_date) ?: 1 }} วัน</span>
                            </p>
                        @endif
                    </div>
                </div>

                <!-- Borrower Details -->
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                    <h4 class="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <i data-lucide="user" class="w-4 h-4 text-sky-500"></i>
                        <span>ข้อมูลผู้ขอยืม</span>
                    </h4>
                    <div class="space-y-1 text-slate-600 dark:text-slate-300">
                        <p class="flex justify-between">
                            <span class="text-slate-400">ชื่อผู้ยืม:</span>
                            <span class="font-bold">{{ $transaction->borrower->displayName ?? $transaction->contact_name }}</span>
                        </p>
                        <p class="flex justify-between">
                            <span class="text-slate-400">เบอร์โทรศัพท์:</span>
                            <span class="font-bold">{{ $transaction->borrower->phone ?? $transaction->contact_phone ?: '-' }}</span>
                        </p>
                        <p class="flex justify-between">
                            <span class="text-slate-400">แผนก/สังกัด:</span>
                            <span class="font-bold">{{ $transaction->borrower->department ?? 'ICTC' }}</span>
                        </p>
                    </div>
                </div>

                <!-- Note / Purpose (Full width) -->
                @if($transaction->note)
                    <div class="sm:col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <span class="text-slate-400 block mb-1">วัตถุประสงค์ในการยืม / หมายเหตุ:</span>
                        <p class="font-medium text-slate-700 dark:text-slate-200">{{ $transaction->note }}</p>
                    </div>
                @endif
            </div>

            <!-- Workflow Steps / Timeline -->
            <div class="p-4 sm:p-5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 space-y-3">
                <h4 class="text-xs font-bold text-sky-900 dark:text-sky-300 flex items-center gap-2">
                    <i data-lucide="list-checks" class="w-4 h-4"></i>
                    <span>ขั้นตอนถัดไปสำหรับการรับอุปกรณ์</span>
                </h4>
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
                    <div class="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1.5 shadow-sm">
                        <i data-lucide="check-circle" class="w-4 h-4 text-emerald-500 shrink-0"></i>
                        <span>1. ยื่นคำขอเรียบร้อย</span>
                    </div>
                    <div class="p-2.5 rounded-xl bg-white dark:bg-slate-800 border {{ $transaction->status === 'approved' ? 'border-emerald-300 text-emerald-800 font-bold' : 'border-sky-300 text-sky-700 font-bold animate-pulse' }} flex items-center gap-1.5 shadow-sm">
                        <i data-lucide="clock" class="w-4 h-4 {{ $transaction->status === 'approved' ? 'text-emerald-500' : 'text-sky-500' }} shrink-0"></i>
                        <span>2. {{ $transaction->status === 'approved' ? 'อนุมัติคำขอแล้ว' : 'รอเจ้าหน้าที่อนุมัติ' }}</span>
                    </div>
                    <div class="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <i data-lucide="package-check" class="w-4 h-4 text-slate-400 shrink-0"></i>
                        <span>3. ติดต่อรับอุปกรณ์</span>
                    </div>
                    <div class="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <i data-lucide="rotate-ccw" class="w-4 h-4 text-slate-400 shrink-0"></i>
                        <span>4. ส่งคืนตามกำหนด</span>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <!-- Print Slip -->
                <a href="{{ route('borrow.slip', $transaction->id) }}" target="_blank"
                   class="w-full sm:w-auto flex-1 py-3.5 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all">
                    <i data-lucide="printer" class="w-4 h-4"></i>
                    <span>พิมพ์ใบยืมพัสดุ (Official Slip / PDF)</span>
                </a>

                <!-- Go to My Requests -->
                <a href="{{ route('my-requests') }}"
                   class="w-full sm:w-auto flex-1 py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all">
                    <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                    <span>ไปยังหน้ารายการของฉัน</span>
                </a>

                <!-- Back to Home -->
                <a href="{{ route('home') }}"
                   class="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-center transition-all">
                    ยืมอุปกรณ์อื่นเพิ่ม
                </a>
            </div>

        </div>
    </div>

</div>
@endsection
