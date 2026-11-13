<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="utf-8">
    <title>รายงานสรุปสถานะพัสดุและครุภัณฑ์ ICTC</title>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: 'Sarabun', sans-serif; }
        @media print {
            .no-print { display: none !important; }
            body { padding: 0; background: white; }
        }
    </style>
</head>
<body class="bg-slate-100 text-slate-800 p-6">
    <div class="max-w-4xl mx-auto mb-4 flex items-center justify-between no-print">
        <a href="javascript:history.back()" class="px-4 py-2 bg-white rounded-xl border border-slate-300 text-xs font-bold shadow-sm">
            &larr; กลับไปที่แดชบอร์ด
        </a>
        <button onclick="window.print()" class="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md">
            พิมพ์รายงาน / Export PDF
        </button>
    </div>

    <div class="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-0 space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between border-b-2 border-slate-800 pb-4">
            <div class="flex items-center gap-4">
                <img src="{{ asset('logo_ictc.png') }}" alt="" class="w-16 h-16 object-contain">
                <div>
                    <h1 class="text-xl font-bold tracking-tight text-slate-900 leading-tight">รายงานสรุปบัญชีครุภัณฑ์และสถานะการยืม-คืน</h1>
                    <p class="text-xs text-slate-600">ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร (ICTC)</p>
                </div>
            </div>
            <div class="text-right text-xs">
                <p class="font-bold text-slate-800">วันที่จัดทำรายงาน</p>
                <p class="text-slate-600">{{ date('d/m/Y H:i') }} น.</p>
            </div>
        </div>

        <!-- Section 1: Equipment Inventory -->
        <div class="space-y-3">
            <h2 class="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1">1. สรุปรายการพัสดุและครุภัณฑ์ทั้งหมด ({{ $equipments->count() }} รายการ)</h2>
            <table class="w-full text-left text-xs border border-slate-200">
                <thead class="bg-slate-100 font-bold text-slate-700">
                    <tr>
                        <th class="py-2 px-3 border-b">ลำดับ</th>
                        <th class="py-2 px-3 border-b">ชื่ออุปกรณ์</th>
                        <th class="py-2 px-3 border-b">แผนก / หมวดหมู่</th>
                        <th class="py-2 px-3 border-b text-center">จำนวนทั้งหมด</th>
                        <th class="py-2 px-3 border-b text-center">กำลังยืม</th>
                        <th class="py-2 px-3 border-b text-center">คงเหลือ</th>
                        <th class="py-2 px-3 border-b">สถานที่จัดเก็บ</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @foreach($equipments as $idx => $eq)
                        @php
                            $borrowed = $eq->active_borrows_count;
                            $available = $eq->available_quantity;
                        @endphp
                        <tr>
                            <td class="py-2 px-3 text-center">{{ $idx + 1 }}</td>
                            <td class="py-2 px-3 font-semibold">{{ $eq->name }}</td>
                            <td class="py-2 px-3">{{ $eq->department }} - {{ $eq->category }}</td>
                            <td class="py-2 px-3 text-center font-bold">{{ $eq->quantity }}</td>
                            <td class="py-2 px-3 text-center text-blue-600">{{ $borrowed }}</td>
                            <td class="py-2 px-3 text-center text-emerald-600 font-bold">{{ $available }}</td>
                            <td class="py-2 px-3">{{ $eq->location ?: '-' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <!-- Section 2: Active Borrows -->
        <div class="space-y-3 pt-4">
            <h2 class="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1">2. รายการอุปกรณ์ที่อยู่ระหว่างการยืม ({{ $activeBorrows->count() }} รายการ)</h2>
            <table class="w-full text-left text-xs border border-slate-200">
                <thead class="bg-slate-100 font-bold text-slate-700">
                    <tr>
                        <th class="py-2 px-3 border-b">ผู้ยืม</th>
                        <th class="py-2 px-3 border-b">รายการอุปกรณ์</th>
                        <th class="py-2 px-3 border-b text-center">จำนวน</th>
                        <th class="py-2 px-3 border-b">วันที่ยืม</th>
                        <th class="py-2 px-3 border-b">กำหนดคืน</th>
                        <th class="py-2 px-3 border-b">สถานะ</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @forelse($activeBorrows as $b)
                        <tr>
                            <td class="py-2 px-3 font-semibold">{{ $b->borrower->displayName ?? $b->contact_name }}</td>
                            <td class="py-2 px-3">{{ $b->equipment->name ?? '-' }}</td>
                            <td class="py-2 px-3 text-center font-bold">{{ $b->borrow_quantity }}</td>
                            <td class="py-2 px-3">{{ $b->borrow_date ? $b->borrow_date->format('d/m/Y') : '-' }}</td>
                            <td class="py-2 px-3 font-bold {{ $b->isOverdue() ? 'text-rose-600' : '' }}">{{ $b->due_date ? $b->due_date->format('d/m/Y') : '-' }}</td>
                            <td class="py-2 px-3">{{ $b->status_label }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="py-4 text-center text-slate-400">ไม่มีรายการค้างยืมในขณะนี้</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Signature -->
        <div class="pt-12 grid grid-cols-2 gap-8 text-center text-xs">
            <div></div>
            <div class="space-y-6">
                <p class="font-bold">ลงชื่อ......................................................................ผู้รายงาน</p>
                <p>( ...................................................................... )</p>
                <p class="text-slate-500">ตำแหน่ง ......................................................................</p>
            </div>
        </div>
    </div>
</body>
</html>

