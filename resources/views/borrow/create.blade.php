@extends('layouts.app')

@section('title', 'แบบฟอร์มยืม-เบิกอุปกรณ์ — ICTC-Asset')

@section('content')
<div x-data="{
    equipments: {{ json_encode($equipments->values()) }},
    selectedId: '{{ $selectedEquipment->id ?? '' }}',
    selectedItem: null,
    borrowMode: 'BORROW', // 'BORROW' or 'REQUISITION'
    borrowQty: 1,
    maxQty: {{ $selectedEquipment->available_quantity ?? 1 }},
    pickupLocation: '{{ $selectedEquipment->location ?? 'ห้อง ICTC ชั้น 2' }}',
    borrowDate: '{{ date('Y-m-d') }}',
    dueDate: '{{ date('Y-m-d', strtotime('+3 days')) }}',

    init() {
        if (this.selectedId) {
            this.selectedItem = this.equipments.find(e => e.id == this.selectedId) || null;
            if (this.selectedItem) {
                this.maxQty = this.selectedItem.available_quantity || 1;
                this.pickupLocation = this.selectedItem.location || 'ห้อง ICTC ชั้น 2';
            }
        } else if (this.equipments.length > 0) {
            this.selectedItem = this.equipments[0];
            this.selectedId = this.selectedItem.id;
            this.maxQty = this.selectedItem.available_quantity || 1;
            this.pickupLocation = this.selectedItem.location || 'ห้อง ICTC ชั้น 2';
        }
    },

    onEquipmentChange() {
        this.selectedItem = this.equipments.find(e => e.id == this.selectedId) || null;
        if (this.selectedItem) {
            this.maxQty = this.selectedItem.available_quantity || 1;
            this.pickupLocation = this.selectedItem.location || 'ห้อง ICTC ชั้น 2';
            if (this.borrowQty > this.maxQty) {
                this.borrowQty = this.maxQty;
            }
        }
    },

    setDays(days) {
        const d = new Date();
        d.setDate(d.getDate() + days);
        this.dueDate = d.toISOString().split('T')[0];
    }
}" class="max-w-5xl mx-auto space-y-6">

    <!-- Header Breadcrumb & Title -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <div class="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <a href="{{ route('home') }}" class="hover:text-sky-500">หน้าหลัก</a>
                <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
                <span class="text-slate-700 dark:text-slate-200 font-semibold">แบบฟอร์มยืม-เบิกอุปกรณ์</span>
            </div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2.5">
                <span class="w-10 h-10 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <i data-lucide="file-plus-2" class="w-5 h-5"></i>
                </span>
                <span>แบบฟอร์มขอยืม - เบิกอุปกรณ์และพัสดุ</span>
            </h1>
            <p class="text-xs text-slate-400 pl-12">ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร (ICTC) &bull; กดยืนยันแล้วระบบจะออกเลขที่คำขอและแสดงผลทันที</p>
        </div>

        <a href="{{ route('my-requests') }}" class="self-start sm:self-auto px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-all">
            <i data-lucide="history" class="w-4 h-4"></i>
            <span>ดูประวัติการยืมของฉัน</span>
        </a>
    </div>

    <!-- Main Grid: Equipment Preview (Left) + Form (Right) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        <!-- Left Column: Equipment Preview Card (4 cols) -->
        <div class="lg:col-span-5 space-y-4">
            <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4 sticky top-24">
                <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 class="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                        <i data-lucide="package" class="w-4 h-4 text-sky-500"></i>
                        <span>อุปกรณ์ที่เลือก</span>
                    </h3>
                    <template x-if="selectedItem">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            คงเหลือ <span x-text="selectedItem.available_quantity"></span> ชิ้น
                        </span>
                    </template>
                </div>

                <template x-if="selectedItem">
                    <div class="space-y-4">
                        <!-- Image -->
                        <div class="w-full h-56 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 relative">
                            <img :src="selectedItem.display_image || '/logo_ictc.png'" 
                                 :alt="selectedItem.name" 
                                 class="w-full h-full object-cover">
                            <div class="absolute top-2 left-2">
                                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-white" x-text="selectedItem.category"></span>
                            </div>
                        </div>

                        <!-- Name and Specs -->
                        <div class="space-y-1.5">
                            <h4 class="font-bold text-slate-800 dark:text-white text-base leading-snug" x-text="selectedItem.name"></h4>
                            <p class="text-xs text-slate-400 line-clamp-3 leading-relaxed" x-text="selectedItem.description || 'ไม่มีรายละเอียดเพิ่มเติม'"></p>
                        </div>

                        <!-- Info Grid -->
                        <div class="grid grid-cols-2 gap-2 text-xs pt-1">
                            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                <span class="text-slate-400 block text-[10px] mb-0.5">แผนก/สังกัด</span>
                                <span class="font-bold text-slate-700 dark:text-slate-200" x-text="selectedItem.department || 'ICTC'"></span>
                            </div>
                            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                <span class="text-slate-400 block text-[10px] mb-0.5">จุดจัดเก็บเดิม</span>
                                <span class="font-bold text-slate-700 dark:text-slate-200" x-text="selectedItem.location || 'ห้อง ICTC'"></span>
                            </div>
                        </div>
                    </div>
                </template>

                <template x-if="!selectedItem">
                    <div class="py-12 text-center text-slate-400 text-xs">
                        <i data-lucide="package-search" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
                        <span>กรุณาเลือกอุปกรณ์จากรายการทางขวามือ</span>
                    </div>
                </template>
            </div>
        </div>

        <!-- Right Column: The Borrow Form (7 cols) -->
        <div class="lg:col-span-7">
            <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">

                <!-- Mode Selector (Borrow vs Requisition) -->
                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">ประเภทคำขอ *</label>
                    <div class="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                        <button type="button" @click="borrowMode = 'BORROW'"
                                :class="borrowMode === 'BORROW' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 font-bold shadow-sm' : 'text-slate-500 font-medium'"
                                class="py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2">
                            <i data-lucide="arrow-right-left" class="w-4 h-4"></i>
                            <span>ขอยืมอุปกรณ์ (ส่งคืนตามกำหนด)</span>
                        </button>
                        <button type="button" @click="borrowMode = 'REQUISITION'"
                                :class="borrowMode === 'REQUISITION' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 font-bold shadow-sm' : 'text-slate-500 font-medium'"
                                class="py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2">
                            <i data-lucide="box" class="w-4 h-4"></i>
                            <span>ขอเบิกอุปกรณ์ (ใช้แล้วหมดไป)</span>
                        </button>
                    </div>
                </div>

                <!-- Form -->
                <form action="{{ route('borrow.store') }}" method="POST" class="space-y-5">
                    @csrf
                    <input type="hidden" name="transaction_type" :value="borrowMode">

                    <!-- Equipment Dropdown Picker -->
                    <div>
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                            เลือกอุปกรณ์ที่ต้องการขอยืม *
                        </label>
                        <select name="equipment_id" x-model="selectedId" @change="onEquipmentChange" required
                                class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500">
                            <option value="">-- กรุณาเลือกอุปกรณ์ --</option>
                            @foreach($equipments as $item)
                                <option value="{{ $item->id }}" {{ ($selectedEquipment->id ?? 0) == $item->id ? 'selected' : '' }}>
                                    {{ $item->name }} ({{ $item->category }} &bull; คงเหลือ {{ $item->available_quantity }} ชิ้น)
                                </option>
                            @endforeach
                        </select>
                    </div>

                    <!-- Quantity Stepper -->
                    <div>
                        <div class="flex items-center justify-between mb-1.5">
                            <label class="block text-xs font-bold text-slate-700 dark:text-slate-200">
                                จำนวนที่ต้องการยืม *
                            </label>
                            <span class="text-[11px] text-slate-400">
                                คงเหลือในสต็อกสูงสุด: <strong class="text-sky-600 dark:text-sky-400" x-text="maxQty"></strong> ชิ้น
                            </span>
                        </div>
                        <div class="flex items-center gap-3">
                            <button type="button" @click="if(borrowQty > 1) borrowQty--"
                                    class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xl flex items-center justify-center transition-all">
                                -
                            </button>
                            <input type="number" name="borrow_quantity" x-model="borrowQty" min="1" :max="maxQty" required
                                   class="flex-1 py-3 text-center rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-extrabold text-slate-800 dark:text-white">
                            <button type="button" @click="if(borrowQty < maxQty) borrowQty++"
                                    class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xl flex items-center justify-center transition-all">
                                +
                            </button>
                        </div>
                    </div>

                    <!-- Date Selection Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <!-- Borrow Date -->
                        <div>
                            <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                วันที่ยืม *
                            </label>
                            <input type="date" name="borrow_date" x-model="borrowDate" required
                                   class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-white">
                        </div>

                        <!-- Due Date -->
                        <div>
                            <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                <span x-text="borrowMode === 'REQUISITION' ? 'วันที่เบิกใช้งาน *' : 'กำหนดวันส่งคืน *'"></span>
                            </label>
                            <input type="date" name="due_date" x-model="dueDate" min="{{ date('Y-m-d') }}" required
                                   class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-white">
                            
                            <!-- Quick date buttons -->
                            <div class="flex items-center gap-1.5 mt-2">
                                <span class="text-[10px] text-slate-400">ปุ่มลัด:</span>
                                <button type="button" @click="setDays(3)" class="px-2 py-0.5 rounded-lg text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 hover:text-sky-600 text-slate-600 font-medium">+3 วัน</button>
                                <button type="button" @click="setDays(7)" class="px-2 py-0.5 rounded-lg text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 hover:text-sky-600 text-slate-600 font-medium">+7 วัน</button>
                                <button type="button" @click="setDays(14)" class="px-2 py-0.5 rounded-lg text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 hover:text-sky-600 text-slate-600 font-medium">+14 วัน</button>
                                <button type="button" @click="setDays(30)" class="px-2 py-0.5 rounded-lg text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 hover:text-sky-600 text-slate-600 font-medium">+30 วัน</button>
                            </div>
                        </div>
                    </div>

                    <!-- Pickup Location -->
                    <div>
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">จุดรับอุปกรณ์ / สถานที่ใช้งาน *</label>
                        <div class="relative">
                            <i data-lucide="map-pin" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            <input type="text" name="pickup_location" x-model="pickupLocation" required
                                   placeholder="เช่น ห้อง ICTC ชั้น 2, ห้องประชุมสภาฯ"
                                   class="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500">
                        </div>
                    </div>

                    <!-- Borrower Info (Pre-filled) -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">ชื่อ-นามสกุล ผู้ขอยืม</label>
                            <input type="text" name="contact_name" value="{{ Auth::user()->displayName }}" required
                                   class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-white">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">เบอร์โทรศัพท์ติดต่อ</label>
                            <input type="text" name="contact_phone" value="{{ Auth::user()->phone ?: '0812345678' }}" required
                                   class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-white">
                        </div>0
                    </div>

                    <!-- Note / Purpose -->
                    <div>
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">วัตถุประสงค์ในการขอยืม / หมายเหตุ</label>
                        <textarea name="note" rows="3" placeholder="ระบุเหตุผลหรือภารกิจที่นำอุปกรณ์ไปใช้งาน เช่น ใช้สำหรับจัดสัมมนาบุคลากร..."
                                  class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"></textarea>
                    </div>

                    <!-- Terms agreement checkbox -->
                    <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                        <label class="flex items-start gap-2.5 cursor-pointer">
                            <input type="checkbox" required checked class="mt-0.5 rounded text-sky-500 focus:ring-0">
                            <span class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                                ข้าพเจ้าได้ตรวจสอบรายละเอียด และยินยอมปฏิบัติตามระเบียบการยืม-คืนพัสดุ โดยจะดูแลรักษาพัสดุให้อยู่ในสภาพสมบูรณ์และส่งคืนตามกำหนดเวลา
                            </span>
                        </label>
                    </div>

                    <!-- Submit Actions -->
                    <div class="pt-2 flex items-center gap-3">
                        <a href="{{ route('home') }}" class="w-1/3 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                            ยกเลิก
                        </a>
                        <button type="submit" 
                                class="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-bold shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all">
                            <i data-lucide="check-circle" class="w-4 h-4"></i>
                            <span>ยืนยันการส่งคำขอยืมอุปกรณ์</span>
                        </button>
                    </div>
                </form>

            </div>
        </div>

    </div>

</div>
@endsection
