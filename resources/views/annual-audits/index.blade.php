@extends('layouts.app')

@section('title', 'การตรวจสอบประจำปี — ICTC-Asset')

@section('content')
<div x-data="{
    verifyModalOpen: false,
    newYearModalOpen: false,
    lightboxOpen: false,
    lightboxImage: '',
    currentRecord: null,
    verifyLocation: '',
    verifyCondition: 'normal',
    verifyNotes: '',
    photoPreview: null,
    gpsLoading: false,

    openVerify(rec) {
        this.currentRecord = rec;
        this.verifyLocation = rec.verified_location || rec.asset.location || 'ฝ่ายสถิติข้อมูลฯ';
        this.verifyCondition = (rec.condition && rec.condition !== 'unverified') ? rec.condition : 'normal';
        this.verifyNotes = rec.notes || '';
        this.photoPreview = rec.photo_url || null;
        this.verifyModalOpen = true;
    },

    onPhotoSelected(event) {
        const file = event.target.files[0];
        if (file) {
            this.photoPreview = URL.createObjectURL(file);
        }
    },

    getGPSLocation() {
        if (!navigator.geolocation) {
            alert('เบราว์เซอร์หรืออุปกรณ์ของคุณไม่รองรับการดึงพิกัด GPS');
            return;
        }
        this.gpsLoading = true;
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude.toFixed(6);
                const lng = pos.coords.longitude.toFixed(6);
                const locStr = ` (พิกัด GPS: ${lat}, ${lng})`;
                if (!this.verifyLocation.includes('พิกัด GPS')) {
                    this.verifyLocation += locStr;
                }
                this.gpsLoading = false;
            },
            (err) => {
                alert('ไม่สามารถดึงพิกัด GPS ได้: ' + err.message);
                this.gpsLoading = false;
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    },

    openLightbox(imgUrl) {
        this.lightboxImage = imgUrl;
        this.lightboxOpen = true;
    }
}" class="space-y-6">

    <!-- Top Header & Year Selector -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-800 mb-1">
                <i data-lucide="clipboard-check" class="w-3.5 h-3.5"></i>
                <span>แบบรายงานการสำรวจพัสดุและทรัพย์สิน อบจ.นครสวรรค์</span>
            </div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">การตรวจสอบพัสดุประจำปี</h1>
            <p class="text-xs text-slate-400">สำรวจ สภาพครุภัณฑ์ บันทึกพิกัดสถานที่ และถ่ายภาพหลักฐานตามรอบปีงบประมาณ</p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
            <!-- Year Selector Tabs -->
            <div class="flex items-center bg-white dark:bg-slate-900 rounded-2xl p-1 border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
                @foreach($allYears as $y)
                    <a href="{{ route('annual-audits.index', ['year' => $y->fiscal_year]) }}" 
                       class="px-3.5 py-1.5 rounded-xl font-bold transition-all {{ $selectedYear == $y->fiscal_year ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-sky-500' }}">
                        ปี {{ $y->fiscal_year }}
                    </a>
                @endforeach
            </div>

            <!-- Create New Year Button -->
            <button @click="newYearModalOpen = true" 
                    class="px-3.5 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5">
                <i data-lucide="calendar-plus" class="w-3.5 h-3.5"></i>
                <span>เปิดรอบปีใหม่</span>
            </button>

            @if($audit)
                <!-- Print Report Button -->
                <a href="{{ route('annual-audits.report', $audit->id) }}" target="_blank"
                   class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5">
                    <i data-lucide="printer" class="w-3.5 h-3.5"></i>
                    <span>พิมพ์แบบรายงาน</span>
                </a>

                <!-- Export CSV Button -->
                <a href="{{ route('annual-audits.export-csv', $audit->id) }}"
                   class="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:border-sky-500 shadow-sm transition-all flex items-center gap-1.5"
                   title="ส่งออกไฟล์ Excel/CSV">
                    <i data-lucide="file-spreadsheet" class="w-3.5 h-3.5 text-emerald-500"></i>
                    <span>Excel</span>
                </a>
            @endif
        </div>
    </div>

    @if($audit)
        <!-- Year Status & Progress Banner -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="px-3 py-0.5 rounded-full text-xs font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400">
                            ปีงบประมาณ {{ $audit->fiscal_year }}
                        </span>
                        @if($audit->progress_percentage >= 100)
                            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                                <i data-lucide="check-check" class="w-3 h-3"></i> ตรวจสอบครบถ้วน 100% พร้อมภาพถ่าย
                            </span>
                        @else
                            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1">
                                <i data-lucide="clock" class="w-3 h-3"></i> กำลังดำเนินการสำรวจ
                            </span>
                        @endif
                    </div>
                    <h2 class="text-base font-bold text-slate-800 dark:text-white">{{ $audit->title }}</h2>
                    <p class="text-xs text-slate-400">
                        คณะกรรมการ: {{ $audit->committee_chairman ?: 'ผอ.กองยุทธศาสตร์ฯ' }} &bull; {{ $audit->committee_members ?: '-' }}
                    </p>
                </div>

                <!-- Progress Bar -->
                <div class="lg:w-80 space-y-2">
                    <div class="flex items-center justify-between text-xs font-bold">
                        <span class="text-slate-600 dark:text-slate-300">ความคืบหน้าการตรวจนับ</span>
                        <span class="text-sky-600 dark:text-sky-400">{{ $audit->verified_count }} / {{ $audit->total_assets }} รายการ ({{ $audit->progress_percentage }}%)</span>
                    </div>
                    <div class="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-500" 
                             style="width: {{ $audit->progress_percentage }}%"></div>
                    </div>
                </div>
            </div>

            <!-- Stats Metric Cards (5 Conditions) -->
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <!-- 1. ทั้งหมด -->
                <a href="{{ route('annual-audits.index', ['year' => $audit->fiscal_year, 'condition' => 'all']) }}" 
                   class="p-3.5 rounded-2xl border transition-all text-center {{ $condition === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-400' }}">
                    <span class="text-[11px] block text-slate-400 mb-0.5">พัสดุในบัญชีทั้งหมด</span>
                    <span class="text-lg font-bold">{{ $audit->total_assets }}</span>
                </a>

                <!-- 2. ปกติ -->
                <a href="{{ route('annual-audits.index', ['year' => $audit->fiscal_year, 'condition' => 'normal']) }}" 
                   class="p-3.5 rounded-2xl border transition-all text-center {{ $condition === 'normal' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:border-emerald-400' }}">
                    <span class="text-[11px] block text-emerald-600/80 dark:text-emerald-400 mb-0.5">1. สภาพปกติ</span>
                    <span class="text-lg font-bold">{{ $audit->normal_count }}</span>
                </a>

                <!-- 3. ชำรุด -->
                <a href="{{ route('annual-audits.index', ['year' => $audit->fiscal_year, 'condition' => 'damaged']) }}" 
                   class="p-3.5 rounded-2xl border transition-all text-center {{ $condition === 'damaged' ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40 text-amber-700 dark:text-amber-300 hover:border-amber-400' }}">
                    <span class="text-[11px] block text-amber-600/80 dark:text-amber-400 mb-0.5">2. ชำรุด</span>
                    <span class="text-lg font-bold">{{ $audit->damaged_count }}</span>
                </a>

                <!-- 4. เสื่อมสภาพ -->
                <a href="{{ route('annual-audits.index', ['year' => $audit->fiscal_year, 'condition' => 'deteriorated']) }}" 
                   class="p-3.5 rounded-2xl border transition-all text-center {{ $condition === 'deteriorated' ? 'bg-purple-600 text-white border-purple-600' : 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/40 text-purple-700 dark:text-purple-300 hover:border-purple-400' }}">
                    <span class="text-[11px] block text-purple-600/80 dark:text-purple-400 mb-0.5">3. เสื่อมสภาพ</span>
                    <span class="text-lg font-bold">{{ $audit->deteriorated_count }}</span>
                </a>

                <!-- 5. ยังไม่ได้ตรวจ -->
                <a href="{{ route('annual-audits.index', ['year' => $audit->fiscal_year, 'condition' => 'unverified']) }}" 
                   class="p-3.5 rounded-2xl border transition-all text-center {{ $condition === 'unverified' ? 'bg-rose-500 text-white border-rose-500' : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 hover:border-rose-400' }}">
                    <span class="text-[11px] block text-rose-600/80 dark:text-rose-400 mb-0.5">ยังไม่ได้ตรวจ</span>
                    <span class="text-lg font-bold">{{ $audit->unverified_count }}</span>
                </a>
            </div>
        </div>

        <!-- Filter & Search Bar -->
        <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <form action="{{ route('annual-audits.index') }}" method="GET" class="w-full flex-1 flex flex-col sm:flex-row items-center gap-2">
                <input type="hidden" name="year" value="{{ $selectedYear }}">
                
                <!-- Search input -->
                <div class="relative w-full sm:w-64">
                    <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="text" name="search" value="{{ $search }}" placeholder="ค้นหารหัสพัสดุ, ชื่อ, ผู้รับผิดชอบ..."
                           class="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500">
                </div>

                <!-- Condition Filter -->
                <select name="condition" onchange="this.form.submit()" 
                        class="w-full sm:w-36 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                    <option value="all" {{ $condition === 'all' ? 'selected' : '' }}>ทุกสถานะตรวจ</option>
                    <option value="unverified" {{ $condition === 'unverified' ? 'selected' : '' }}>ยังไม่ได้ตรวจ</option>
                    <option value="verified" {{ $condition === 'verified' ? 'selected' : '' }}>ตรวจแล้วทั้งหมด</option>
                    <option value="normal" {{ $condition === 'normal' ? 'selected' : '' }}>1. ปกติ</option>
                    <option value="damaged" {{ $condition === 'damaged' ? 'selected' : '' }}>2. ชำรุด</option>
                    <option value="deteriorated" {{ $condition === 'deteriorated' ? 'selected' : '' }}>3. เสื่อมสภาพ</option>
                    <option value="lost" {{ $condition === 'lost' ? 'selected' : '' }}>4. สูญหาย</option>
                </select>

                <!-- Location Filter -->
                <select name="location" onchange="this.form.submit()" 
                        class="w-full sm:w-44 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                    <option value="all" {{ $location === 'all' ? 'selected' : '' }}>ทุกสถานที่ / ห้อง</option>
                    @foreach($locations as $loc)
                        <option value="{{ $loc }}" {{ $location === $loc ? 'selected' : '' }}>{{ $loc }}</option>
                    @endforeach
                </select>

                <button type="submit" class="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 text-white dark:bg-slate-700 text-xs font-semibold">
                    ค้นหา
                </button>
                @if($search || $condition !== 'all' || $location !== 'all')
                    <a href="{{ route('annual-audits.index', ['year' => $selectedYear]) }}" class="text-xs text-rose-500 font-bold hover:underline px-2">ล้างตัวกรอง</a>
                @endif
            </form>

            <span class="text-xs text-slate-400 shrink-0">
                แสดง <span class="font-bold text-slate-700 dark:text-slate-200">{{ $records->total() }}</span> รายการ
            </span>
        </div>

        <!-- Inventory Audit Table -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                    <thead class="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-slate-400 text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                        <tr>
                            <th class="py-4 px-4 text-center">ลำดับ</th>
                            <th class="py-4 px-4">รหัสพัสดุ</th>
                            <th class="py-4 px-4">ชื่อพัสดุ / ชนิด / ยี่ห้อ</th>
                            <th class="py-4 px-3">สถานที่จัดเก็บ/ใช้</th>
                            <th class="py-4 px-3">ผู้ดูแล</th>
                            <th class="py-4 px-4">ผลการตรวจนับ</th>
                            <th class="py-4 px-3 text-center">ภาพถ่าย</th>
                            <th class="py-4 px-6 text-right">ดำเนินการ</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80">
                        @forelse($records as $rec)
                            <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors {{ !$rec->is_verified ? 'bg-amber-50/10' : '' }}">
                                <!-- Item No -->
                                <td class="py-3 px-4 text-center font-bold text-slate-400">
                                    {{ $rec->asset->item_no ?: $rec->id }}
                                </td>

                                <!-- Asset Code -->
                                <td class="py-3 px-4 font-mono font-bold text-slate-800 dark:text-white whitespace-nowrap">
                                    <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] border border-slate-200 dark:border-slate-700">
                                        {{ $rec->asset->asset_code ?: '-' }}
                                    </span>
                                </td>

                                <!-- Asset Name & Category -->
                                <td class="py-3 px-4">
                                    <p class="font-bold text-slate-800 dark:text-white text-sm line-clamp-1">{{ $rec->asset->name }}</p>
                                    <span class="text-[10px] text-slate-400 block">{{ $rec->asset->category_name }} &bull; ฿{{ number_format($rec->asset->price, 2) }}</span>
                                </td>

                                <!-- Location -->
                                <td class="py-3 px-3">
                                    <div class="flex items-center gap-1 text-[11px] text-slate-700 dark:text-slate-300">
                                        <i data-lucide="map-pin" class="w-3.5 h-3.5 text-sky-500 shrink-0"></i>
                                        <span class="truncate max-w-[150px]">{{ $rec->verified_location ?: ($rec->asset->location ?: '-') }}</span>
                                    </div>
                                </td>

                                <!-- Responsible Person -->
                                <td class="py-3 px-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                    {{ $rec->asset->responsible_person ?: '-' }}
                                </td>

                                <!-- Condition Result Badge -->
                                <td class="py-3 px-4 whitespace-nowrap">
                                    @if($rec->is_verified)
                                        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold border {{ $rec->condition_badge_class }}">
                                            {{ $rec->condition_label }}
                                        </span>
                                        @if($rec->verified_at)
                                            <span class="block text-[9px] text-slate-400 mt-0.5">{{ $rec->verified_at->format('d/m/y H:i') }}</span>
                                        @endif
                                    @else
                                        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700">
                                            ยังไม่ตรวจสอบ
                                        </span>
                                    @endif
                                </td>

                                <!-- Photo Proof Thumbnail -->
                                <td class="py-3 px-3 text-center">
                                    @if($rec->photo_url)
                                        <button @click="openLightbox('{{ asset($rec->photo_url) }}')" 
                                                class="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 mx-auto hover:opacity-80 transition-opacity">
                                            <img src="{{ asset($rec->photo_url) }}" class="w-full h-full object-cover">
                                        </button>
                                    @else
                                        <span class="text-[10px] text-slate-300">-</span>
                                    @endif
                                </td>

                                <!-- Action Button: Check & Take Photo -->
                                <td class="py-3 px-6 text-right whitespace-nowrap">
                                    <button @click="openVerify({{ json_encode($rec) }})"
                                            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ml-auto {{ $rec->is_verified ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/20' }}">
                                        <i data-lucide="camera" class="w-3.5 h-3.5"></i>
                                        <span>{{ $rec->is_verified ? 'แก้ไขตรวจนับ' : 'ตรวจนับ/ถ่ายรูป' }}</span>
                                    </button>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="8" class="py-12 text-center text-slate-400">
                                    ไม่พบรายการพัสดุในเงื่อนไขการค้นหา
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            @if($records->hasPages())
                <div class="p-4 border-t border-slate-100 dark:border-slate-800">
                    {{ $records->links() }}
                </div>
            @endif
        </div>
    @else
        <div class="py-16 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <i data-lucide="calendar-x" class="w-12 h-12 mx-auto text-slate-300"></i>
            <h3 class="text-base font-bold text-slate-800 dark:text-white">ยังไม่มีรอบการตรวจสอบในระบบ</h3>
            <p class="text-xs text-slate-400">กรุณาคลิกปุ่ม &quot;เปิดรอบปีใหม่&quot; เพื่อเริ่มต้นการสำรวจครุภัณฑ์</p>
        </div>
    @endif

    <!-- Single Item Verification Modal (Supports Mobile Camera & Location) -->
    <div x-cloak x-show="verifyModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div @click="verifyModalOpen = false" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
        <div class="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-4 max-h-[92vh] overflow-y-auto">
            
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                    <h3 class="text-base font-bold text-slate-800 dark:text-white">บันทึกผลการตรวจสอบพัสดุ</h3>
                    <p class="text-xs text-sky-500 font-mono" x-text="currentRecord ? 'รหัส: ' + (currentRecord.asset.asset_code || '-') : ''"></p>
                </div>
                <button @click="verifyModalOpen = false" class="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <template x-if="currentRecord">
                <form :action="'/annual-audits/records/' + currentRecord.id + '/verify'" method="POST" enctype="multipart/form-data" class="space-y-4">
                    @csrf

                    <!-- Asset Summary Info -->
                    <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1">
                        <p class="font-bold text-slate-900 dark:text-white text-sm" x-text="currentRecord.asset.name"></p>
                        <div class="grid grid-cols-2 gap-2 text-slate-500 dark:text-slate-400 pt-1">
                            <p>หมวด: <span class="font-medium text-slate-700 dark:text-slate-300" x-text="currentRecord.asset.category_name"></span></p>
                            <p>ราคา: <span class="font-medium text-slate-700 dark:text-slate-300" x-text="'฿' + Number(currentRecord.asset.price).toLocaleString()"></span></p>
                            <p>ผู้ดูแล: <span class="font-medium text-slate-700 dark:text-slate-300" x-text="currentRecord.asset.responsible_person || '-'"></span></p>
                            <p>ที่จัดเก็บเดิม: <span class="font-medium text-slate-700 dark:text-slate-300" x-text="currentRecord.asset.location || '-'"></span></p>
                        </div>
                    </div>

                    <!-- 1. Condition Selector (Radio buttons matching official forms) -->
                    <div>
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">1. ผลการตรวจนับสภาพพัสดุ *</label>
                        <div class="grid grid-cols-2 gap-2">
                            <!-- ปกติ -->
                            <label class="flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all"
                                   :class="verifyCondition === 'normal' ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold dark:bg-emerald-950/40 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'">
                                <input type="radio" name="condition" value="normal" x-model="verifyCondition" class="text-emerald-500 focus:ring-0">
                                <span>1. ปกติ (ใช้งานได้ดี)</span>
                            </label>

                            <!-- ชำรุด -->
                            <label class="flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all"
                                   :class="verifyCondition === 'damaged' ? 'bg-amber-50 border-amber-500 text-amber-800 font-bold dark:bg-amber-950/40 dark:text-amber-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'">
                                <input type="radio" name="condition" value="damaged" x-model="verifyCondition" class="text-amber-500 focus:ring-0">
                                <span>2. ชำรุด (ซ่อมได้)</span>
                            </label>

                            <!-- เสื่อมสภาพ -->
                            <label class="flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all"
                                   :class="verifyCondition === 'deteriorated' ? 'bg-purple-50 border-purple-500 text-purple-800 font-bold dark:bg-purple-950/40 dark:text-purple-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'">
                                <input type="radio" name="condition" value="deteriorated" x-model="verifyCondition" class="text-purple-500 focus:ring-0">
                                <span>3. เสื่อมสภาพ</span>
                            </label>

                            <!-- สูญหาย -->
                            <label class="flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all"
                                   :class="verifyCondition === 'lost' ? 'bg-rose-50 border-rose-500 text-rose-800 font-bold dark:bg-rose-950/40 dark:text-rose-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'">
                                <input type="radio" name="condition" value="lost" x-model="verifyCondition" class="text-rose-500 focus:ring-0">
                                <span>4. สูญหาย</span>
                            </label>
                        </div>
                    </div>

                    <!-- 2. Location (Specify Location with GPS auto-fill) -->
                    <div>
                        <div class="flex items-center justify-between mb-1">
                            <label class="block text-xs font-bold text-slate-700 dark:text-slate-200">2. สถานที่ / ตำแหน่งที่ตรวจพบจริง *</label>
                            <button type="button" @click="getGPSLocation()" 
                                    class="text-[11px] font-bold text-sky-500 hover:text-sky-600 flex items-center gap-1">
                                <i data-lucide="navigation" class="w-3 h-3"></i>
                                <span x-text="gpsLoading ? 'กำลังดึงพิกัด...' : 'ดึงพิกัด GPS ปัจจุบัน'"></span>
                            </button>
                        </div>
                        <div class="relative">
                            <i data-lucide="map-pin" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            <input type="text" name="verified_location" x-model="verifyLocation" required
                                   placeholder="เช่น ห้องเซิร์ฟเวอร์ ชั้น 2 ตู้ Rack B"
                                   class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white">
                        </div>
                    </div>

                    <!-- 3. Camera / Photo Upload (Supports Mobile Camera capture) -->
                    <div>
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                            3. ถ่ายรูปสภาพพัสดุ (ผ่านกล้องมือถือ/แท็บเล็ต) 📷
                        </label>
                        <div class="space-y-2">
                            <!-- Mobile Camera & File Input -->
                            <label class="flex flex-col items-center justify-center p-4 border-2 border-dashed border-sky-300 dark:border-sky-800 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 hover:bg-sky-50 cursor-pointer transition-all">
                                <template x-if="photoPreview">
                                    <div class="relative w-full h-40 rounded-xl overflow-hidden mb-2">
                                        <img :src="photoPreview" class="w-full h-full object-cover">
                                    </div>
                                </template>
                                <template x-if="!photoPreview">
                                    <div class="text-center py-2">
                                        <i data-lucide="camera" class="w-8 h-8 text-sky-500 mx-auto mb-1"></i>
                                        <span class="text-xs font-bold text-sky-600 dark:text-sky-400 block">กดเพื่อถ่ายรูปจากกล้อง หรือเลือกไฟล์รูปภาพ</span>
                                        <span class="text-[10px] text-slate-400">รองรับการเปิดกล้องมือถือทันที (Capture)</span>
                                    </div>
                                </template>
                                <input type="file" name="photo" accept="image/*" capture="environment" @change="onPhotoSelected" class="hidden">
                            </label>
                        </div>
                    </div>

                    <!-- 4. Notes & Inspector -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ผู้ทำการตรวจสอบ</label>
                            <input type="text" name="inspector_name" value="{{ Auth::user()?->displayName ?? 'นายชาตรี (ผู้ตรวจ)' }}"
                                   class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">หมายเหตุสภาพ / ข้อสังเกต</label>
                            <input type="text" name="notes" x-model="verifyNotes" placeholder="เช่น สภาพดี, จอเปิดไม่ติด"
                                   class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                        </div>
                    </div>

                    <div class="pt-2 flex items-center justify-end gap-2">
                        <button type="button" @click="verifyModalOpen = false" class="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold">ยกเลิก</button>
                        <button type="submit" class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5">
                            <i data-lucide="check" class="w-4 h-4"></i>
                            <span>บันทึกการตรวจสอบ</span>
                        </button>
                    </div>
                </form>
            </template>
        </div>
    </div>

    <!-- Create New Year Cycle Modal -->
    <div x-cloak x-show="newYearModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div @click="newYearModalOpen = false" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
        <div class="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-base font-bold text-slate-800 dark:text-white">เปิดรอบการตรวจสอบประจำปีใหม่</h3>
                <button @click="newYearModalOpen = false" class="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <form action="{{ route('annual-audits.create-year') }}" method="POST" class="space-y-3.5">
                @csrf
                <div>
                    <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ปีงบประมาณ (เช่น 2571) *</label>
                    <input type="text" name="fiscal_year" value="2571" required
                           class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ชื่อรอบการตรวจสอบ *</label>
                    <input type="text" name="title" value="รอบการตรวจสอบพัสดุและทรัพย์สิน ประจำปีงบประมาณ 2571" required
                           class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ประธานกรรมการตรวจนับ</label>
                    <input type="text" name="committee_chairman" value="ผอ.กองยุทธศาสตร์และงบประมาณ"
                           class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">กรรมการตรวจนับ</label>
                    <input type="text" name="committee_members" value="นายชาตรี (ประธาน), นายรวิภณ (กรรมการ), น.ส.ฐิติมา (กรรมการและเลขานุการ)"
                           class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                </div>

                <div class="pt-2 flex items-center justify-end gap-2">
                    <button type="button" @click="newYearModalOpen = false" class="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold">ยกเลิก</button>
                    <button type="submit" class="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-500/20">สร้างรอบปีตรวจนับ</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Image Lightbox Modal -->
    <div x-cloak x-show="lightboxOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <button @click="lightboxOpen = false" class="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/40">
            <i data-lucide="x" class="w-6 h-6"></i>
        </button>
        <img :src="lightboxImage" class="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl">
    </div>

</div>
@endsection

