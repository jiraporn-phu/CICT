@extends('layouts.app')

@section('title', $equipment->name . ' — ICTC-Asset')

@section('content')
<div class="max-w-5xl mx-auto space-y-8">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-xs text-slate-400">
        <a href="{{ route('home') }}" class="hover:text-sky-500">หน้าหลัก</a>
        <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
        <span>{{ $equipment->department }}</span>
        <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
        <span class="text-slate-700 dark:text-slate-200 font-semibold truncate">{{ $equipment->name }}</span>
    </div>

    <!-- Main Detail Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <!-- Left: Image Preview -->
        <div class="space-y-4">
            <div class="w-full h-80 sm:h-96 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src="{{ $equipment->display_image }}" alt="{{ $equipment->name }}" class="w-full h-full object-cover">
            </div>
            <div class="flex items-center justify-between text-xs text-slate-400">
                <span>บันทึกเมื่อ: {{ $equipment->created_at->format('d/m/Y') }}</span>
                <span>รหัสครุภัณฑ์: #{{ str_pad($equipment->id, 5, '0', STR_PAD_LEFT) }}</span>
            </div>
        </div>

        <!-- Right: Specs & Borrow Form -->
        <div class="space-y-6 flex flex-col justify-between">
            <div class="space-y-4">
                <div class="flex items-center gap-2">
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
                        {{ $equipment->department }} &bull; {{ $equipment->category }}
                    </span>
                    @if($equipment->available_quantity > 0)
                        <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            มีในสต็อก {{ $equipment->available_quantity }} ชิ้น
                        </span>
                    @else
                        <span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                            ถูกยืมหมดแล้ว
                        </span>
                    @endif
                </div>

                <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white leading-tight">
                    {{ $equipment->name }}
                </h1>

                <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {{ $equipment->description ?: 'ไม่มีรายละเอียดเพิ่มเติมสำหรับอุปกรณ์นี้' }}
                </p>

                <div class="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span class="text-slate-400 block mb-1">จุดจัดเก็บ / ตำแหน่ง</span>
                        <span class="font-bold text-slate-700 dark:text-slate-200">{{ $equipment->location ?: '-' }}</span>
                    </div>
                    <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span class="text-slate-400 block mb-1">จำนวนทั้งหมด</span>
                        <span class="font-bold text-slate-700 dark:text-slate-200">{{ $equipment->quantity }} ชิ้น</span>
                    </div>
                </div>
            </div>

            <!-- Borrow Action Box -->
            @auth
                @if($equipment->available_quantity > 0)
                    <div x-data="{ mode: 'BORROW' }" class="p-5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 space-y-4">
                        <div class="flex items-center justify-between">
                            <h3 class="text-sm font-bold text-sky-900 dark:text-sky-200" x-text="mode === 'REQUISITION' ? 'แบบฟอร์มเบิกอุปกรณ์' : 'แบบฟอร์มขอยืมอุปกรณ์'"></h3>
                            <div class="flex items-center gap-2">
                                <a href="{{ route('borrow.create', ['equipment_id' => $equipment->id]) }}" class="text-[11px] text-sky-600 dark:text-sky-400 font-bold hover:underline hidden sm:inline-flex items-center gap-1">
                                    <span>เปิดฟอร์มเต็มหน้า</span>
                                    <i data-lucide="external-link" class="w-3 h-3"></i>
                                </a>
                                <div class="flex items-center gap-1 bg-white/80 dark:bg-slate-800 p-0.5 rounded-xl border border-sky-200 dark:border-slate-700 text-[11px]">
                                    <button type="button" @click="mode = 'BORROW'" :class="mode === 'BORROW' ? 'bg-sky-500 text-white font-bold' : 'text-slate-600 dark:text-slate-300'" class="px-2.5 py-1 rounded-lg transition-all">ยืม</button>
                                    <button type="button" @click="mode = 'REQUISITION'" :class="mode === 'REQUISITION' ? 'bg-purple-600 text-white font-bold' : 'text-slate-600 dark:text-slate-300'" class="px-2.5 py-1 rounded-lg transition-all">เบิก</button>
                                </div>
                            </div>
                        </div>

                        <form action="{{ route('borrow.store') }}" method="POST" class="space-y-3">
                            @csrf
                            <input type="hidden" name="equipment_id" value="{{ $equipment->id }}">
                            <input type="hidden" name="transaction_type" :value="mode">
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-[11px] font-semibold text-slate-500 mb-1">จำนวนที่ต้องการ</label>
                                    <input type="number" name="borrow_quantity" min="1" max="{{ $equipment->available_quantity }}" value="1" required
                                           class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white">
                                </div>
                                <div>
                                    <label class="block text-[11px] font-semibold text-slate-500 mb-1">
                                        <span x-text="mode === 'REQUISITION' ? 'วันที่เบิกใช้งาน' : 'กำหนดวันส่งคืน'"></span>
                                    </label>
                                    <input type="date" name="due_date" value="{{ date('Y-m-d', strtotime('+3 days')) }}" min="{{ date('Y-m-d') }}" required
                                           class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white">
                                </div>
                            </div>
                            <div>
                                <label class="block text-[11px] font-semibold text-slate-500 mb-1">จุดรับอุปกรณ์</label>
                                <input type="text" name="pickup_location" value="{{ $equipment->location ?: 'ห้อง ICTC ชั้น 2' }}" required
                                       class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] font-semibold text-slate-500 mb-1">วัตถุประสงค์ / หมายเหตุ</label>
                                <textarea name="note" rows="2" placeholder="ระบุเหตุผลในการใช้งาน..."
                                          class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"></textarea>
                            </div>
                            <button type="submit" 
                                    :class="mode === 'REQUISITION' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-sky-500 hover:bg-sky-600'"
                                    class="w-full py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2">
                                <i data-lucide="check" class="w-4 h-4"></i>
                                <span x-text="mode === 'REQUISITION' ? 'ยืนยันการส่งคำขอเบิกอุปกรณ์' : 'ยืนยันการส่งคำขอยืมอุปกรณ์'"></span>
                            </button>
                        </form>
                    </div>
                @else
                    <div class="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs text-center font-medium">
                        อุปกรณ์นี้ถูกยืมครบจำนวนแล้วในขณะนี้ กรุณาตรวจสอบอีกครั้งภายหลัง
                    </div>
                @endif
            @else
                <div class="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-center space-y-2">
                    <p class="text-xs text-slate-500 dark:text-slate-400">กรุณาเข้าสู่ระบบก่อนทำการยืมหรือเบิกอุปกรณ์</p>
                    <a href="{{ route('login') }}" class="inline-block px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm">
                        เข้าสู่ระบบเพื่อยืมอุปกรณ์
                    </a>
                </div>
            @endauth
        </div>
    </div>

    <!-- Loan History for this Equipment -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i data-lucide="history" class="w-5 h-5 text-sky-500"></i>
            <span>ประวัติการยืมอุปกรณ์ชิ้นนี้</span>
        </h2>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead class="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-slate-400 text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                        <th class="py-3 px-4">ผู้ยืม</th>
                        <th class="py-3 px-4">จำนวน</th>
                        <th class="py-3 px-4">วันที่ยืม</th>
                        <th class="py-3 px-4">กำหนดคืน</th>
                        <th class="py-3 px-4">สถานะ</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    @forelse($recentBorrows as $b)
                        <tr>
                            <td class="py-3 px-4 font-semibold text-slate-800 dark:text-white">
                                {{ $b->borrower->displayName ?? 'ผู้ใช้งาน' }}
                            </td>
                            <td class="py-3 px-4">{{ $b->borrow_quantity }} ชิ้น</td>
                            <td class="py-3 px-4">{{ $b->borrow_date ? $b->borrow_date->format('d/m/Y') : '-' }}</td>
                            <td class="py-3 px-4">{{ $b->due_date ? $b->due_date->format('d/m/Y') : '-' }}</td>
                            <td class="py-3 px-4">
                                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border {{ $b->status_badge_class }}">
                                    {{ $b->status_label }}
                                </span>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="py-8 text-center text-slate-400">ยังไม่มีประวัติการยืมอุปกรณ์นี้</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection

