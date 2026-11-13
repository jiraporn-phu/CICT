<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="utf-8">
    <title>ใบยืม-คืนอุปกรณ์ #{{ str_pad($transaction->id, 5, '0', STR_PAD_LEFT) }} — ICTC-Asset</title>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: 'Sarabun', sans-serif; }
        @media print {
            .no-print { display: none !important; }
            body { padding: 0; background: white; }
            .print-border { border-color: #cbd5e1 !important; }
        }
    </style>
</head>
<body class="bg-slate-100 text-slate-800 p-4 sm:p-8">
    <!-- Action buttons -->
    <div class="max-w-3xl mx-auto mb-4 flex items-center justify-between no-print">
        <a href="javascript:history.back()" class="px-4 py-2 bg-white rounded-xl border border-slate-300 text-xs font-bold shadow-sm hover:bg-slate-50">
            &larr; กลับ
        </a>
        <button onclick="window.print()" class="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md">
            พิมพ์เอกสาร / บันทึกเป็น PDF
        </button>
    </div>

    <!-- Official Document Box (A4 style) -->
    <div class="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-0">
        <!-- Header -->
        <div class="flex items-center justify-between border-b-2 border-slate-800 pb-4 mb-6">
            <div class="flex items-center gap-4">
                <img src="{{ asset('logo_ictc.png') }}" alt="Logo" class="w-16 h-16 object-contain">
                <div>
                    <h1 class="text-xl font-bold tracking-tight text-slate-900 leading-tight">แบบฟอร์มการยืม - คืนอุปกรณ์และพัสดุคอมพิวเตอร์</h1>
                    <p class="text-xs text-slate-600 font-medium">ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร (ICTC) องค์การบริหารส่วนจังหวัด</p>
                </div>
            </div>
            <div class="text-right text-xs">
                <span class="block font-bold text-slate-900 text-sm">เลขที่เอกสาร</span>
                <span class="font-mono text-slate-700">#{{ str_pad($transaction->id, 5, '0', STR_PAD_LEFT) }}</span>
                <span class="block text-slate-500 mt-1">วันที่: {{ date('d/m/Y') }}</span>
            </div>
        </div>

        <!-- Borrower and Equipment Grid -->
        <div class="space-y-6 text-xs">
            <!-- Borrower Info -->
            <div>
                <h3 class="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 mb-2">1. ข้อมูลผู้ขอยืมอุปกรณ์</h3>
                <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl print-border">
                    <div>
                        <span class="text-slate-500 block">ชื่อ-นามสกุล:</span>
                        <span class="font-bold text-slate-900">{{ $transaction->borrower->displayName ?? $transaction->contact_name }}</span>
                    </div>
                    <div>
                        <span class="text-slate-500 block">เบอร์โทรศัพท์:</span>
                        <span class="font-bold text-slate-900">{{ $transaction->borrower->phone ?? $transaction->contact_phone ?: '-' }}</span>
                    </div>
                    <div>
                        <span class="text-slate-500 block">แผนก / สังกัด:</span>
                        <span class="font-bold text-slate-900">{{ $transaction->borrower->department ?? 'ICTC' }}</span>
                    </div>
                    <div>
                        <span class="text-slate-500 block">ประเภทรายการ:</span>
                        <span class="font-bold text-slate-900">{{ $transaction->transaction_type === 'REQUISITION' ? 'เบิกใช้งาน' : 'ยืมพัสดุ' }}</span>
                    </div>
                </div>
            </div>

            <!-- Equipment Info Table -->
            <div>
                <h3 class="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 mb-2">2. รายการพัสดุ / ครุภัณฑ์ที่ขอยืม</h3>
                <table class="w-full text-left border border-slate-200 rounded-xl overflow-hidden">
                    <thead class="bg-slate-100 text-slate-700 font-bold">
                        <tr>
                            <th class="py-2.5 px-3 border-b">ลำดับ</th>
                            <th class="py-2.5 px-3 border-b">รายการอุปกรณ์</th>
                            <th class="py-2.5 px-3 border-b">หมวดหมู่</th>
                            <th class="py-2.5 px-3 border-b text-center">จำนวน</th>
                            <th class="py-2.5 px-3 border-b">จุดรับอุปกรณ์</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="py-3 px-3 border-b text-center">1</td>
                            <td class="py-3 px-3 border-b font-bold">{{ $transaction->equipment->name ?? '-' }}</td>
                            <td class="py-3 px-3 border-b">{{ $transaction->equipment->category ?? '-' }}</td>
                            <td class="py-3 px-3 border-b text-center font-bold">{{ $transaction->borrow_quantity }} ชิ้น</td>
                            <td class="py-3 px-3 border-b">{{ $transaction->pickup_location ?: '-' }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Loan Period -->
            <div>
                <h3 class="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 mb-2">3. กำหนดเวลาและวัตถุประสงค์</h3>
                <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl print-border">
                    <div>
                        <span class="text-slate-500 block">วันที่ยืม:</span>
                        <span class="font-bold text-slate-900">{{ $transaction->borrow_date ? $transaction->borrow_date->format('d/m/Y H:i') : '-' }}</span>
                    </div>
                    <div>
                        <span class="text-slate-500 block">กำหนดวันส่งคืน:</span>
                        <span class="font-bold text-slate-900">{{ $transaction->due_date ? $transaction->due_date->format('d/m/Y') : '-' }}</span>
                    </div>
                    <div class="col-span-2">
                        <span class="text-slate-500 block">วัตถุประสงค์ในการยืม / หมายเหตุ:</span>
                        <span class="font-bold text-slate-900">{{ $transaction->note ?: 'เพื่อประโยชน์ในการปฏิบัติงานราชการ' }}</span>
                    </div>
                </div>
            </div>

            <!-- Terms -->
            <div class="bg-slate-50 p-3 rounded-xl text-[11px] text-slate-600 print-border leading-relaxed">
                <span class="font-bold block mb-1">ข้อตกลงและเงื่อนไขการยืม:</span>
                1. ผู้ยืมตกลงที่จะดูแลรักษาอุปกรณ์ที่ยืมให้อยู่ในสภาพเรียบร้อยสมบูรณ์อยู่เสมอ <br>
                2. หากเกิดความเสียหาย สูญหาย หรือชำรุดบกพร่องจากการใช้งานผิดวิธี ผู้ยืมยินยอมรับผิดชอบชดใช้ค่าเสียหายตามระเบียบของทางราชการ <br>
                3. ผู้ยืมจะนำส่งคืนอุปกรณ์ตามวันเวลาและสถานที่ที่กำหนดไว้ในเอกสารนี้
            </div>

            <!-- Signatures Block -->
            <div class="grid grid-cols-2 gap-8 pt-8 text-center">
                <div class="space-y-8">
                    <p class="font-bold">ลงชื่อ......................................................ผู้ขอยืม</p>
                    <p>( {{ $transaction->borrower->displayName ?? $transaction->contact_name }} )</p>
                    <p class="text-slate-500">วันที่ .......... / .......... / ................</p>
                </div>
                <div class="space-y-8">
                    <p class="font-bold">ลงชื่อ......................................................ผู้อนุมัติ / เจ้าหน้าที่</p>
                    <p>( ................................................................ )</p>
                    <p class="text-slate-500">วันที่ .......... / .......... / ................</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>

