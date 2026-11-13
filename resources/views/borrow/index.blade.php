@extends('layouts.app')

@section('title', 'สถานะการยืม-เบิกอุปกรณ์ — ICTC-Asset')

@section('content')
<div x-data="{
    returnModalOpen: false,
    detailModalOpen: false,
    activeTx: null,
    lightboxImage: null,
    openReturn(tx) {
        this.activeTx = tx;
        this.returnModalOpen = true;
    },
    openDetail(tx) {
        this.activeTx = tx;
        this.detailModalOpen = true;
    }
}" class="space-y-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">สถานะการยืม - เบิกอุปกรณ์</h1>
            <p class="text-xs text-slate-400">ตรวจสอบ อนุมัติ และบันทึกการส่งคืนพัสดุครุภัณฑ์</p>
        </div>
    </div>

    <!-- Status Tabs Bar -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 text-xs">
        <a href="{{ route('borrow.index', ['status' => 'all']) }}" 
           class="px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 {{ $status === 'all' ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700' }}">
            <span>ทั้งหมด</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] bg-white/20">{{ $counts['all'] }}</span>
        </a>
        <a href="{{ route('borrow.index', ['status' => 'pending']) }}" 
           class="px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 {{ $status === 'pending' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700' }}">
            <span>รออนุมัติ</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] {{ $status === 'pending' ? 'bg-white/20' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' }}">{{ $counts['pending'] }}</span>
        </a>
        <a href="{{ route('borrow.index', ['status' => 'borrowed']) }}" 
           class="px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 {{ $status === 'borrowed' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700' }}">
            <span>กำลังยืม</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] bg-white/20">{{ $counts['borrowed'] }}</span>
        </a>
        <a href="{{ route('borrow.index', ['status' => 'overdue']) }}" 
           class="px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 {{ $status === 'overdue' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700' }}">
            <span>เกินกำหนดคืน</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] {{ $status === 'overdue' ? 'bg-white/20' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400' }}">{{ $counts['overdue'] }}</span>
        </a>
        <a href="{{ route('borrow.index', ['status' => 'returned']) }}" 
           class="px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 {{ $status === 'returned' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700' }}">
            <span>คืนแล้ว</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] bg-white/20">{{ $counts['returned'] }}</span>
        </a>
        <a href="{{ route('borrow.index', ['status' => 'requisition']) }}" 
           class="px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 {{ $status === 'requisition' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700' }}">
            <span>เบิกอุปกรณ์</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] bg-white/20">{{ $counts['requisition'] }}</span>
        </a>
    </div>

    <!-- Search Box -->
    <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
        <form action="{{ route('borrow.index') }}" method="GET" class="flex-1 flex items-center gap-2">
            <input type="hidden" name="status" value="{{ $status }}">
            <div class="relative flex-1 sm:w-80">
                <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input type="text" name="search" value="{{ $search }}" placeholder="ค้นหาชื่อผู้ยืม, อุปกรณ์, หรือสถานที่..."
                       class="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500">
            </div>
            <button type="submit" class="px-4 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-xs font-semibold">
                ค้นหา
            </button>
            @if($search)
                <a href="{{ route('borrow.index', ['status' => $status]) }}" class="text-xs text-rose-500 font-bold hover:underline px-2">ล้าง</a>
            @endif
        </form>
    </div>

    <!-- Transactions Table -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead class="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-slate-400 text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                        <th class="py-4 px-6">ผู้ยืม / เบิก</th>
                        <th class="py-4 px-4">อุปกรณ์</th>
                        <th class="py-4 px-3 text-center">จำนวน</th>
                        <th class="py-4 px-4">วันที่ยืม</th>
                        <th class="py-4 px-4">กำหนดคืน</th>
                        <th class="py-4 px-4">สถานะ</th>
                        <th class="py-4 px-6 text-right">ดำเนินการ</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80">
                    @forelse($transactions as $tx)
                        <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                            <!-- Borrower -->
                            <td class="py-3.5 px-6">
                                <div class="flex items-center gap-3">
                                    <img src="{{ $tx->borrower->avatar_url ?? 'https://ui-avatars.com/api/?name=User' }}" alt="" 
                                         class="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700">
                                    <div>
                                        <p class="font-bold text-slate-800 dark:text-white">{{ $tx->borrower->displayName ?? $tx->contact_name }}</p>
                                        <p class="text-[11px] text-slate-400">
                                            {{ $tx->borrower->phone ?? $tx->contact_phone ?: '-' }} &bull; {{ $tx->borrower->department ?? 'ICTC' }}
                                        </p>
                                    </div>
                                </div>
                            </td>

                            <!-- Equipment -->
                            <td class="py-3.5 px-4">
                                <div class="flex items-center gap-2.5">
                                    <img src="{{ $tx->equipment->display_image ?? asset('logo_ictc.png') }}" class="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700">
                                    <div>
                                        <span class="font-bold text-slate-800 dark:text-white line-clamp-1">{{ $tx->equipment->name ?? 'ไม่พบข้อมูล' }}</span>
                                        <span class="text-[10px] text-slate-400">{{ $tx->equipment->category ?? '' }}</span>
                                    </div>
                                </div>
                            </td>

                            <!-- Quantity -->
                            <td class="py-3.5 px-3 text-center font-bold text-slate-800 dark:text-white">
                                {{ $tx->borrow_quantity }}
                            </td>

                            <!-- Borrow Date -->
                            <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                                {{ $tx->borrow_date ? $tx->borrow_date->format('d/m/Y') : '-' }}
                            </td>

                            <!-- Due Date -->
                            <td class="py-3.5 px-4">
                                <span class="{{ $tx->isOverdue() ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-600 dark:text-slate-300' }}">
                                    {{ $tx->due_date ? $tx->due_date->format('d/m/Y') : '-' }}
                                </span>
                            </td>

                            <!-- Status Badge -->
                            <td class="py-3.5 px-4">
                                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold border {{ $tx->status_badge_class }}">
                                    {{ $tx->status_label }}
                                </span>
                            </td>

                            <!-- Actions -->
                            <td class="py-3.5 px-6 text-right">
                                <div class="flex items-center justify-end gap-1.5">
                                    <!-- Detail Modal Button -->
                                    <button @click="openDetail({{ json_encode($tx) }})" 
                                            class="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                            title="ดูรายละเอียด">
                                        <i data-lucide="eye" class="w-4 h-4"></i>
                                    </button>

                                    <!-- Slip Print Button -->
                                    <a href="{{ route('borrow.slip', $tx->id) }}" target="_blank"
                                       class="p-2 rounded-xl text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-slate-800"
                                       title="พิมพ์ใบยืม-คืน">
                                        <i data-lucide="printer" class="w-4 h-4"></i>
                                    </a>

                                    @if($tx->status === 'pending')
                                        <!-- Approve -->
                                        <form action="{{ route('borrow.approve', $tx->id) }}" method="POST">
                                            @csrf
                                            <button type="submit" 
                                                    class="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                                    title="อนุมัติคำขอ">
                                                <i data-lucide="check" class="w-4 h-4"></i>
                                            </button>
                                        </form>

                                        <!-- Reject -->
                                        <form action="{{ route('borrow.reject', $tx->id) }}" method="POST">
                                            @csrf
                                            <button type="submit" 
                                                    class="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                                    title="ปฏิเสธคำขอ">
                                                <i data-lucide="x" class="w-4 h-4"></i>
                                            </button>
                                        </form>
                                    @endif

                                    @if(in_array($tx->status, ['borrowed', 'overdue', 'approved']))
                                        <!-- Mark Returned Modal Button -->
                                        <button @click="openReturn({{ json_encode($tx) }})" 
                                                class="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] shadow-sm flex items-center gap-1">
                                            <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                                            <span>บันทึกคืน</span>
                                        </button>
                                    @endif

                                    <!-- Delete Button -->
                                    <form action="{{ route('borrow.destroy', $tx->id) }}" method="POST" onsubmit="return confirm('ยืนยันลบรายการนี้?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="p-2 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800" title="ลบรายการ">
                                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="py-12 text-center text-slate-400">
                                ไม่พบรายการยืม-เบิกอุปกรณ์
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($transactions->hasPages())
            <div class="p-4 border-t border-slate-100 dark:border-slate-800">
                {{ $transactions->links() }}
            </div>
        @endif
    </div>

    <!-- Admin Return Modal -->
    <div x-cloak x-show="returnModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div @click="returnModalOpen = false" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
        <div class="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-base font-bold text-slate-800 dark:text-white">บันทึกการส่งคืนอุปกรณ์</h3>
                <button @click="returnModalOpen = false" class="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <template x-if="activeTx">
                <form :action="'/borrow/' + activeTx.id + '/mark-returned'" method="POST" enctype="multipart/form-data" class="space-y-4">
                    @csrf
                    <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs">
                        <p class="font-bold text-slate-800 dark:text-white" x-text="activeTx.equipment.name"></p>
                        <p class="text-slate-400" x-text="'ผู้ยืม: ' + (activeTx.borrower ? activeTx.borrower.fullName : activeTx.contact_name) + ' (' + activeTx.borrow_quantity + ' ชิ้น)'"></p>
                    </div>

                    <div>
                        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">จุดรับคืนอุปกรณ์</label>
                        <input type="text" name="return_location" value="ห้อง ICTC ชั้น 2" required
                               class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                    </div>

                    <div>
                        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">รูปถ่ายสภาพอุปกรณ์หลังคืน (ถ้ามี)</label>
                        <input type="file" name="after_image" accept="image/*"
                               class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-500 file:text-white">
                    </div>

                    <div>
                        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">สภาพอุปกรณ์ / หมายเหตุ</label>
                        <textarea name="note" rows="2" placeholder="เช่น สภาพสมบูรณ์ พร้อมใช้งานต่อ..."
                                  class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"></textarea>
                    </div>

                    <div class="pt-2 flex items-center justify-end gap-2">
                        <button type="button" @click="returnModalOpen = false" class="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold">ยกเลิก</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20">
                            ยืนยันการรับคืน
                        </button>
                    </div>
                </form>
            </template>
        </div>
    </div>

    <!-- Transaction Detail Modal -->
    <div x-cloak x-show="detailModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div @click="detailModalOpen = false" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
        <div class="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-base font-bold text-slate-800 dark:text-white">รายละเอียดธุรกรรมยืม-เบิก</h3>
                <button @click="detailModalOpen = false" class="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <template x-if="activeTx">
                <div class="space-y-4 text-xs">
                    <div class="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                        <div>
                            <span class="text-slate-400 block mb-0.5">ประเภทรายการ</span>
                            <span class="font-bold text-slate-800 dark:text-white" x-text="activeTx.transaction_type === 'REQUISITION' ? 'เบิกอุปกรณ์' : 'ยืมอุปกรณ์'"></span>
                        </div>
                        <div>
                            <span class="text-slate-400 block mb-0.5">สถานะ</span>
                            <span class="font-bold text-sky-500" x-text="activeTx.status"></span>
                        </div>
                        <div>
                            <span class="text-slate-400 block mb-0.5">ผู้ขอใช้งาน</span>
                            <span class="font-bold text-slate-800 dark:text-white" x-text="activeTx.borrower ? activeTx.borrower.fullName : activeTx.contact_name"></span>
                        </div>
                        <div>
                            <span class="text-slate-400 block mb-0.5">เบอร์โทรศัพท์</span>
                            <span class="font-bold text-slate-800 dark:text-white" x-text="activeTx.borrower ? activeTx.borrower.phone : activeTx.contact_phone"></span>
                        </div>
                    </div>

                    <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2">
                        <span class="text-slate-400 block font-bold">ข้อมูลอุปกรณ์</span>
                        <p class="text-sm font-bold text-slate-800 dark:text-white" x-text="activeTx.equipment.name"></p>
                        <p class="text-slate-400" x-text="'จำนวน: ' + activeTx.borrow_quantity + ' ชิ้น'"></p>
                        <p class="text-slate-400" x-text="'จุดรับ: ' + (activeTx.pickup_location || '-')"></p>
                        <p class="text-slate-400" x-text="'จุดคืน: ' + (activeTx.return_location || '-')"></p>
                        <p class="text-slate-400" x-text="'หมายเหตุ: ' + (activeTx.note || '-')"></p>
                    </div>

                    <!-- Images Condition Proof -->
                    <template x-if="activeTx.after_image_url">
                        <div>
                            <span class="font-bold text-slate-600 dark:text-slate-300 block mb-1">รูปถ่ายสภาพอุปกรณ์หลังส่งคืน:</span>
                            <img :src="activeTx.after_image_url" class="w-full h-48 object-cover rounded-2xl border border-slate-200 dark:border-slate-700">
                        </div>
                    </template>
                </div>
            </template>
        </div>
    </div>

</div>
@endsection

