@extends('layouts.app')

@section('title', 'รายการของฉัน — ICTC-Asset')

@section('content')
<div x-data="{
    returnModalOpen: false,
    selectedTx: null,
    openReturn(tx) {
        this.selectedTx = tx;
        this.returnModalOpen = true;
    }
}" class="max-w-5xl mx-auto space-y-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">รายการยืม-เบิกของฉัน</h1>
            <p class="text-xs text-slate-400">ติดตามสถานะคำขอ แจ้งคืนอุปกรณ์ และดูประวัติการใช้งาน</p>
        </div>
        <a href="{{ route('borrow.create') }}" class="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-500/20 inline-flex items-center gap-2">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>ยืมอุปกรณ์เพิ่ม</span>
        </a>
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        <a href="{{ route('my-requests', ['tab' => 'active']) }}" 
           class="px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 {{ $tab === 'active' ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700' }}">
            <i data-lucide="clock" class="w-4 h-4"></i>
            <span>กำลังยืม / รออนุมัติ</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] bg-white/20">{{ $activeCount }}</span>
        </a>
        <a href="{{ route('my-requests', ['tab' => 'history']) }}" 
           class="px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 {{ $tab === 'history' ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700' }}">
            <i data-lucide="check-circle" class="w-4 h-4"></i>
            <span>ประวัติการคืน / เบิก</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] bg-white/20">{{ $historyCount }}</span>
        </a>
    </div>

    <!-- Requests List -->
    <div class="space-y-4">
        @forelse($transactions as $tx)
            <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                    <img src="{{ $tx->equipment->display_image ?? asset('logo_ictc.png') }}" class="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200 dark:border-slate-700">
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {{ $tx->transaction_type === 'REQUISITION' ? 'เบิกใช้งาน' : 'ยืมอุปกรณ์' }}
                            </span>
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border {{ $tx->status_badge_class }}">
                                {{ $tx->status_label }}
                            </span>
                        </div>
                        <h3 class="font-bold text-slate-800 dark:text-white text-base">
                            {{ $tx->equipment->name ?? 'ไม่พบข้อมูลอุปกรณ์' }}
                        </h3>
                        <p class="text-xs text-slate-400">
                            จำนวน: <span class="font-bold text-slate-700 dark:text-slate-300">{{ $tx->borrow_quantity }} ชิ้น</span> &bull; 
                            วันที่ทำรายการ: {{ $tx->borrow_date ? $tx->borrow_date->format('d/m/Y') : '-' }} &bull;
                            กำหนดคืน: <span class="{{ $tx->isOverdue() ? 'text-rose-500 font-bold' : '' }}">{{ $tx->due_date ? $tx->due_date->format('d/m/Y') : '-' }}</span>
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-2 self-end sm:self-center">
                    <a href="{{ route('borrow.slip', $tx->id) }}" target="_blank"
                       class="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
                       title="พิมพ์ใบยืม">
                        <i data-lucide="printer" class="w-4 h-4"></i>
                        <span>พิมพ์ใบยืม</span>
                    </a>

                    @if($tx->status === 'pending')
                        <form action="{{ route('borrow.cancel', $tx->id) }}" method="POST" onsubmit="return confirm('ยืนยันยกเลิกคำขอนี้?')">
                            @csrf
                            <button type="submit" class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold transition-all">
                                ยกเลิกคำขอ
                            </button>
                        </form>
                    @endif

                    @if(in_array($tx->status, ['borrowed', 'overdue', 'approved']))
                        <button @click="openReturn({{ json_encode($tx) }})"
                                class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5">
                            <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
                            <span>แจ้งคืนอุปกรณ์</span>
                        </button>
                    @endif
                </div>
            </div>
        @empty
            <div class="py-16 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
                <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <i data-lucide="package-x" class="w-8 h-8"></i>
                </div>
                <h3 class="text-base font-bold text-slate-800 dark:text-white">ไม่มีรายการในหมวดนี้</h3>
                <p class="text-xs text-slate-400">เมื่อคุณส่งคำขอยืมหรือเบิกอุปกรณ์ รายการจะมาแสดงที่นี่</p>
            </div>
        @endforelse
    </div>

    <!-- Return Modal for User -->
    <div x-cloak x-show="returnModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div @click="returnModalOpen = false" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
        <div class="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-base font-bold text-slate-800 dark:text-white">แจ้งคืนอุปกรณ์</h3>
                <button @click="returnModalOpen = false" class="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <template x-if="selectedTx">
                <form :action="'/my-requests/' + selectedTx.id + '/return'" method="POST" enctype="multipart/form-data" class="space-y-4">
                    @csrf
                    <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs">
                        <p class="font-bold text-slate-800 dark:text-white" x-text="selectedTx.equipment.name"></p>
                        <p class="text-slate-400" x-text="'จำนวนคืน: ' + selectedTx.borrow_quantity + ' ชิ้น'"></p>
                    </div>

                    <div>
                        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">จุดส่งคืนอุปกรณ์ *</label>
                        <input type="text" name="return_location" value="ห้อง ICTC ชั้น 2" required
                               class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                    </div>

                    <div>
                        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">รูปถ่ายสภาพอุปกรณ์หลังคืน (ถ้ามี)</label>
                        <input type="file" name="after_image" accept="image/*"
                               class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-500 file:text-white">
                    </div>

                    <div>
                        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">หมายเหตุสภาพอุปกรณ์</label>
                        <textarea name="note" rows="2" placeholder="เช่น อุปกรณ์อยู่ในสภาพสมบูรณ์ พร้อมที่ชาร์จและกระเป๋า..."
                                  class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"></textarea>
                    </div>

                    <div class="pt-2 flex items-center justify-end gap-2">
                        <button type="button" @click="returnModalOpen = false" class="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold">ยกเลิก</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20">
                            ส่งเรื่องแจ้งคืน
                        </button>
                    </div>
                </form>
            </template>
        </div>
    </div>

</div>
@endsection

