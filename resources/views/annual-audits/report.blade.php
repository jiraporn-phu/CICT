@extends('layouts.app')

@section('title', "แบบรายงานการสำรวจพัสดุและทรัพย์สิน ปีงบประมาณ {$audit->fiscal_year}")

@section('content')
<div class="space-y-6">

    <!-- Top Action Bar (Hidden when printing) -->
    <div class="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div class="flex items-center gap-3">
            <a href="{{ route('annual-audits.index', ['year' => $audit->fiscal_year]) }}" 
               class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all">
                <i data-lucide="arrow-left" class="w-5 h-5"></i>
            </a>
            <div>
                <h1 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <i data-lucide="file-spreadsheet" class="w-5 h-5 text-sky-500"></i>
                    <span>แบบรายงานการสำรวจพัสดุและทรัพย์สิน ปีงบประมาณ {{ $audit->fiscal_year }}</span>
                </h1>
                <p class="text-xs text-slate-400">แบบฟอร์มเอกสารราชการองค์การบริหารส่วนจังหวัดนครสวรรค์ (ฝ่ายสถิติข้อมูลและสารสนเทศ)</p>
            </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
            <a href="{{ route('annual-audits.export-csv', $audit->id) }}"
               class="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm shadow-emerald-500/20 transition-all flex items-center gap-1.5">
                <i data-lucide="download" class="w-4 h-4"></i>
                <span>ส่งออก CSV (Excel)</span>
            </a>
            <button onclick="window.print()" 
                    class="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm shadow-sky-500/20 transition-all flex items-center gap-1.5">
                <i data-lucide="printer" class="w-4 h-4"></i>
                <span>พิมพ์รายงาน / PDF</span>
            </button>
        </div>
    </div>

    <!-- Official Report Paper Container -->
    <div class="bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-10 print:p-0 print:border-none print:shadow-none print:rounded-none">
        
        <!-- Document Official Header -->
        <div class="text-center space-y-1.5 pb-6 border-b border-slate-300">
            <div class="flex items-center justify-center gap-3 mb-2">
                <div class="w-12 h-12 rounded-full bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-800 font-extrabold text-lg">
                    อบจ
                </div>
            </div>
            <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                แบบรายงานการสำรวจพัสดุและทรัพย์สินองค์การบริหารส่วนจังหวัดนครสวรรค์
            </h2>
            <p class="text-sm font-semibold text-slate-700">
                ฝ่ายสถิติข้อมูลและสารสนเทศ &bull; กองยุทธศาสตร์และงบประมาณ
            </p>
            <p class="text-xs text-slate-600">
                รอบการตรวจสอบประจำปีงบประมาณ <strong>{{ $audit->fiscal_year }}</strong> 
                (ตั้งแต่วันที่ 1 ตุลาคม พ.ศ. {{ (int)$audit->fiscal_year - 1 }} ถึงวันที่ 30 กันยายน พ.ศ. {{ $audit->fiscal_year }})
            </p>
            <div class="pt-2 flex justify-center items-center gap-6 text-xs text-slate-500">
                <span><strong>ประธานกรรมการ:</strong> {{ $audit->committee_chairman ?: 'ผอ.กองยุทธศาสตร์และงบประมาณ' }}</span>
                <span>&bull;</span>
                <span><strong>กรรมการ:</strong> {{ $audit->committee_members ?: 'คณะกรรมการตรวจนับพัสดุประจำปี' }}</span>
                <span>&bull;</span>
                <span><strong>วันที่พิมพ์รายงาน:</strong> {{ \Carbon\Carbon::now()->format('d/m/Y H:i') }}</span>
            </div>
        </div>

        <!-- Summary Statistics Row -->
        <div class="grid grid-cols-2 sm:grid-cols-6 gap-3 py-4 my-4 bg-slate-50 rounded-2xl border border-slate-200 print:bg-transparent print:border-slate-300">
            <div class="text-center p-2">
                <span class="block text-[11px] text-slate-500 font-medium">รายการทั้งหมด</span>
                <span class="text-lg font-bold text-slate-800">{{ number_format($audit->total_assets) }}</span>
            </div>
            <div class="text-center p-2 border-l border-slate-200">
                <span class="block text-[11px] text-emerald-600 font-medium">สภาพปกติ</span>
                <span class="text-lg font-bold text-emerald-700">{{ number_format($audit->normal_count) }}</span>
            </div>
            <div class="text-center p-2 border-l border-slate-200">
                <span class="block text-[11px] text-amber-600 font-medium">ชำรุด</span>
                <span class="text-lg font-bold text-amber-700">{{ number_format($audit->damaged_count) }}</span>
            </div>
            <div class="text-center p-2 border-l border-slate-200">
                <span class="block text-[11px] text-rose-600 font-medium">เสื่อมสภาพ</span>
                <span class="text-lg font-bold text-rose-700">{{ number_format($audit->deteriorated_count) }}</span>
            </div>
            <div class="text-center p-2 border-l border-slate-200">
                <span class="block text-[11px] text-purple-600 font-medium">สูญหาย</span>
                <span class="text-lg font-bold text-purple-700">{{ number_format($audit->lost_count) }}</span>
            </div>
            <div class="text-center p-2 border-l border-slate-200">
                <span class="block text-[11px] text-sky-600 font-medium">ความก้าวหน้าตรวจนับ</span>
                <span class="text-lg font-bold text-sky-700">{{ $audit->progress_percent }}%</span>
            </div>
        </div>

        <!-- Official Inventory Table -->
        <div class="overflow-x-auto my-4">
            <table class="w-full text-left text-xs border-collapse border border-slate-300">
                <thead>
                    <tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-center">
                        <th class="border border-slate-300 py-2.5 px-2 w-10">ลำดับ</th>
                        <th class="border border-slate-300 py-2.5 px-3 min-w-[180px] text-left">ชื่อพัสดุ ชนิด/รุ่น/ยี่ห้อ</th>
                        <th class="border border-slate-300 py-2.5 px-2 min-w-[110px]">รหัสพัสดุ</th>
                        <th class="border border-slate-300 py-2.5 px-2 min-w-[90px]">หมวดหมู่</th>
                        <th class="border border-slate-300 py-2.5 px-2 min-w-[70px] text-right">ราคา (บาท)</th>
                        <th class="border border-slate-300 py-2.5 px-2 min-w-[100px] text-left">สถานที่ตามบัญชี</th>
                        <th class="border border-slate-300 py-2.5 px-2 min-w-[90px] text-left">ผู้รับผิดชอบ</th>
                        <th class="border border-slate-300 py-2.5 px-2 min-w-[80px]">ผลการตรวจสอบ</th>
                        <th class="border border-slate-300 py-2.5 px-2 min-w-[100px] text-left">สถานที่ตรวจพบจริง</th>
                        <th class="border border-slate-300 py-2.5 px-2 min-w-[65px] text-center">รูปภาพตรวจ</th>
                        <th class="border border-slate-300 py-2.5 px-2 min-w-[90px] text-left">ผู้ตรวจ/วันที่</th>
                        <th class="border border-slate-300 py-2.5 px-2 min-w-[90px] text-left">หมายเหตุ</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                    @forelse($records as $idx => $rec)
                        @php
                            $asset = $rec->asset;
                        @endphp
                        <tr class="hover:bg-slate-50/80 transition-colors {{ $rec->condition === 'lost' ? 'bg-rose-50/50' : ($rec->condition === 'damaged' ? 'bg-amber-50/40' : '') }}">
                            <!-- No. -->
                            <td class="border border-slate-300 py-2 px-2 text-center font-medium text-slate-500">
                                {{ $asset->item_no ?? ($idx + 1) }}
                            </td>

                            <!-- Name -->
                            <td class="border border-slate-300 py-2 px-3">
                                <span class="font-bold text-slate-800">{{ $asset->name }}</span>
                                @if($asset->acquired_date)
                                    <span class="block text-[10px] text-slate-400">วันที่ได้มา: {{ $asset->acquired_date }}</span>
                                @endif
                            </td>

                            <!-- Asset Code -->
                            <td class="border border-slate-300 py-2 px-2 text-center font-mono font-bold text-sky-700">
                                {{ $asset->asset_code }}
                            </td>

                            <!-- Category -->
                            <td class="border border-slate-300 py-2 px-2 text-center text-slate-600">
                                {{ $asset->category_name }}
                            </td>

                            <!-- Price -->
                            <td class="border border-slate-300 py-2 px-2 text-right font-medium text-slate-700">
                                {{ number_format($asset->price, 2) }}
                            </td>

                            <!-- Registered Location -->
                            <td class="border border-slate-300 py-2 px-2 text-slate-600">
                                {{ $asset->location ?: '-' }}
                            </td>

                            <!-- Responsible Person -->
                            <td class="border border-slate-300 py-2 px-2 text-slate-700">
                                <span class="font-medium">{{ $asset->responsible_person ?: '-' }}</span>
                                @if($asset->supervisor)
                                    <span class="block text-[10px] text-slate-400">{{ $asset->supervisor }}</span>
                                @endif
                            </td>

                            <!-- Condition -->
                            <td class="border border-slate-300 py-2 px-2 text-center">
                                @if($rec->condition === 'normal')
                                    <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                        ปกติ
                                    </span>
                                @elseif($rec->condition === 'damaged')
                                    <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                        ชำรุด
                                    </span>
                                @elseif($rec->condition === 'deteriorated')
                                    <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                        เสื่อมสภาพ
                                    </span>
                                @elseif($rec->condition === 'lost')
                                    <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                                        สูญหาย
                                    </span>
                                @else
                                    <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-300">
                                        ยังไม่ตรวจ
                                    </span>
                                @endif
                            </td>

                            <!-- Verified Location -->
                            <td class="border border-slate-300 py-2 px-2 text-slate-700">
                                @if($rec->verified_location && $rec->verified_location !== $asset->location)
                                    <span class="font-bold text-amber-700 flex items-center gap-1">
                                        <i data-lucide="map-pin" class="w-3 h-3 text-amber-600 shrink-0"></i>
                                        {{ $rec->verified_location }}
                                    </span>
                                    <span class="block text-[9px] text-slate-400 line-through">เดิม: {{ $asset->location }}</span>
                                @else
                                    <span>{{ $rec->verified_location ?: $asset->location }}</span>
                                @endif
                            </td>

                            <!-- Photo Thumbnail -->
                            <td class="border border-slate-300 py-2 px-2 text-center">
                                @if($rec->photo_url)
                                    <a href="{{ $rec->photo_url }}" target="_blank" class="inline-block group relative">
                                        <img src="{{ $rec->photo_url }}" alt="photo" class="w-10 h-10 object-cover rounded border border-slate-300 shadow-sm mx-auto group-hover:scale-110 transition-transform">
                                    </a>
                                @else
                                    <span class="text-slate-300 text-[10px]">-</span>
                                @endif
                            </td>

                            <!-- Inspector & Date -->
                            <td class="border border-slate-300 py-2 px-2 text-slate-600 text-[11px]">
                                @if($rec->is_verified)
                                    <span class="font-semibold text-slate-800 block">{{ $rec->verified_by }}</span>
                                    <span class="text-[10px] text-slate-400">{{ $rec->verified_at ? $rec->verified_at->format('d/m/Y') : '-' }}</span>
                                @else
                                    <span class="text-slate-400">-</span>
                                @endif
                            </td>

                            <!-- Notes -->
                            <td class="border border-slate-300 py-2 px-2 text-slate-500 text-[11px]">
                                {{ $rec->notes ?: ($asset->notes ?: '-') }}
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="12" class="py-10 text-center text-slate-400 border border-slate-300">
                                ไม่พบรายการพัสดุในรอบการตรวจสอบนี้
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Official Signatures Block -->
        <div class="pt-10 mt-8 border-t border-slate-300 page-break-inside-avoid">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center text-xs">
                
                <!-- Signature 1: Committee Member -->
                <div class="space-y-12">
                    <p class="font-semibold text-slate-700">ผู้สำรวจและตรวจนับ</p>
                    <div class="space-y-1">
                        <div class="w-48 mx-auto border-b border-dotted border-slate-400"></div>
                        <p class="pt-1 font-bold text-slate-800">(.........................................................)</p>
                        <p class="text-[11px] text-slate-500">กรรมการตรวจนับพัสดุ</p>
                        <p class="text-[10px] text-slate-400">วันที่ .......... / .......... / {{ $audit->fiscal_year }}</p>
                    </div>
                </div>

                <!-- Signature 2: Committee Chairman -->
                <div class="space-y-12">
                    <p class="font-semibold text-slate-700">ประธานกรรมการตรวจนับ</p>
                    <div class="space-y-1">
                        <div class="w-48 mx-auto border-b border-dotted border-slate-400"></div>
                        <p class="pt-1 font-bold text-slate-800">( {{ $audit->committee_chairman ?: '.........................................................' }} )</p>
                        <p class="text-[11px] text-slate-500">ประธานกรรมการตรวจนับพัสดุประจำปี</p>
                        <p class="text-[10px] text-slate-400">วันที่ .......... / .......... / {{ $audit->fiscal_year }}</p>
                    </div>
                </div>

                <!-- Signature 3: Department Director -->
                <div class="space-y-12">
                    <p class="font-semibold text-slate-700">ทราบ / รับรองผลการสำรวจ</p>
                    <div class="space-y-1">
                        <div class="w-48 mx-auto border-b border-dotted border-slate-400"></div>
                        <p class="pt-1 font-bold text-slate-800">(.........................................................)</p>
                        <p class="text-[11px] text-slate-500">ผู้อำนวยการกองยุทธศาสตร์และงบประมาณ</p>
                        <p class="text-[10px] text-slate-400">วันที่ .......... / .......... / {{ $audit->fiscal_year }}</p>
                    </div>
                </div>

            </div>
        </div>

    </div>

</div>

@push('styles')
<style>
@media print {
    body {
        background-color: #ffffff !important;
        color: #000000 !important;
        font-family: 'Sarabun', sans-serif !important;
        font-size: 11pt !important;
    }
    aside, header, footer, .print\:hidden {
        display: none !important;
    }
    main {
        padding: 0 !important;
        margin: 0 !important;
    }
    table {
        width: 100% !important;
        border-collapse: collapse !important;
        page-break-inside: auto;
    }
    tr {
        page-break-inside: avoid;
        page-break-after: auto;
    }
    th, td {
        border: 1px solid #333333 !important;
        padding: 4px 6px !important;
    }
    .page-break-inside-avoid {
        page-break-inside: avoid;
    }
    @page {
        size: A4 landscape;
        margin: 1cm;
    }
}
</style>
@endpush
@endsection

