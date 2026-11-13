@extends('layouts.app')

@section('title', 'แดชบอร์ด — ภาพรวมระบบ ICTC-Asset')

@section('content')
<div class="space-y-8">
    <!-- Header with Export Button -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">แดชบอร์ดภาพรวมระบบ</h1>
            <p class="text-xs text-slate-400">สถิติครุภัณฑ์ รายการยืม-คืน และกิจกรรมการใช้งานอุปกรณ์</p>
        </div>
        <div class="flex items-center gap-2">
            <a href="{{ route('dashboard.report') }}" target="_blank"
               class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 text-xs font-bold shadow-md transition-all flex items-center gap-2">
                <i data-lucide="printer" class="w-4 h-4 text-sky-400"></i>
                <span>พิมพ์รายงานสรุป</span>
            </a>
        </div>
    </div>

    <!-- Stat Cards Grid (5 key metrics) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <!-- 1. Total Equipment -->
        <div class="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900/60 flex items-center justify-center text-sky-500 shrink-0">
                <i data-lucide="package" class="w-6 h-6"></i>
            </div>
            <div>
                <span class="text-xs text-slate-400 font-medium">อุปกรณ์ทั้งหมด</span>
                <p class="text-xl font-bold text-slate-800 dark:text-white">{{ $totalEquipment }} <span class="text-xs font-normal text-slate-400">รายการ</span></p>
                <span class="text-[10px] text-sky-500 font-semibold">{{ $totalPhysicalUnits }} ชิ้นในระบบ</span>
            </div>
        </div>

        <!-- 2. Available Units -->
        <div class="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-center text-emerald-500 shrink-0">
                <i data-lucide="check-circle" class="w-6 h-6"></i>
            </div>
            <div>
                <span class="text-xs text-slate-400 font-medium">พร้อมใช้งาน</span>
                <p class="text-xl font-bold text-emerald-600 dark:text-emerald-400">{{ $availableUnits }} <span class="text-xs font-normal text-slate-400">ชิ้น</span></p>
                <span class="text-[10px] text-emerald-500 font-semibold">พร้อมให้บริการยืม</span>
            </div>
        </div>

        <!-- 3. Borrowed Units -->
        <div class="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center text-blue-500 shrink-0">
                <i data-lucide="arrow-right-left" class="w-6 h-6"></i>
            </div>
            <div>
                <span class="text-xs text-slate-400 font-medium">กำลังถูกยืม</span>
                <p class="text-xl font-bold text-blue-600 dark:text-blue-400">{{ $borrowedUnits }} <span class="text-xs font-normal text-slate-400">ชิ้น</span></p>
                <span class="text-[10px] text-blue-500 font-semibold">อยู่ระหว่างปฏิบัติงาน</span>
            </div>
        </div>

        <!-- 4. Pending Requests -->
        <div class="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/60 flex items-center justify-center text-amber-500 shrink-0">
                <i data-lucide="clock" class="w-6 h-6"></i>
            </div>
            <div>
                <span class="text-xs text-slate-400 font-medium">รอการอนุมัติ</span>
                <p class="text-xl font-bold text-amber-600 dark:text-amber-400">{{ $pendingCount }} <span class="text-xs font-normal text-slate-400">รายการ</span></p>
                <a href="{{ route('borrow.index', ['status' => 'pending']) }}" class="text-[10px] text-amber-500 font-semibold hover:underline">คลิกเพื่อตรวจสอบ &rarr;</a>
            </div>
        </div>

        <!-- 5. Overdue Returns -->
        <div class="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/60 flex items-center justify-center text-rose-500 shrink-0">
                <i data-lucide="alert-triangle" class="w-6 h-6"></i>
            </div>
            <div>
                <span class="text-xs text-slate-400 font-medium">เกินกำหนดคืน</span>
                <p class="text-xl font-bold text-rose-600 dark:text-rose-400">{{ $overdueCount }} <span class="text-xs font-normal text-slate-400">รายการ</span></p>
                <a href="{{ route('borrow.index', ['status' => 'overdue']) }}" class="text-[10px] text-rose-500 font-semibold hover:underline">ติดตามทวงถาม &rarr;</a>
            </div>
        </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Category Distribution (Bar Chart) -->
        <div class="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <i data-lucide="bar-chart-3" class="w-4 h-4 text-sky-500"></i>
                    <span>จำนวนอุปกรณ์แยกตามหมวดหมู่</span>
                </h3>
            </div>
            <div class="h-64">
                <canvas id="categoryChart"></canvas>
            </div>
        </div>

        <!-- Status Distribution (Donut Chart) -->
        <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <i data-lucide="pie-chart" class="w-4 h-4 text-sky-500"></i>
                    <span>สัดส่วนสถานะพัสดุ</span>
                </h3>
            </div>
            <div class="h-64 flex items-center justify-center">
                <canvas id="statusChart"></canvas>
            </div>
        </div>
    </div>

    <!-- Recent Activities & Top Equipment Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Recent Activities (2 cols) -->
        <div class="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <i data-lucide="clock" class="w-4 h-4 text-sky-500"></i>
                    <span>รายการธุรกรรมล่าสุด</span>
                </h3>
                <a href="{{ route('borrow.index') }}" class="text-xs text-sky-500 font-bold hover:underline">ดูทั้งหมด &rarr;</a>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                    <thead class="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-slate-400 text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                        <tr>
                            <th class="py-2.5 px-3">ผู้ยืม</th>
                            <th class="py-2.5 px-3">อุปกรณ์</th>
                            <th class="py-2.5 px-2 text-center">จำนวน</th>
                            <th class="py-2.5 px-3">สถานะ</th>
                            <th class="py-2.5 px-3 text-right">เวลา</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80">
                        @forelse($recentTransactions as $tx)
                            <tr>
                                <td class="py-2.5 px-3 font-semibold text-slate-800 dark:text-white">
                                    {{ $tx->borrower->displayName ?? $tx->contact_name }}
                                </td>
                                <td class="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                                    {{ $tx->equipment->name ?? '-' }}
                                </td>
                                <td class="py-2.5 px-2 text-center font-bold">
                                    {{ $tx->borrow_quantity }}
                                </td>
                                <td class="py-2.5 px-3">
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border {{ $tx->status_badge_class }}">
                                        {{ $tx->status_label }}
                                    </span>
                                </td>
                                <td class="py-2.5 px-3 text-right text-slate-400 text-[11px]">
                                    {{ $tx->created_at->diffForHumans() }}
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" class="py-6 text-center text-slate-400">ยังไม่มีรายการธุรกรรม</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Top Borrowed Equipment (1 col) -->
        <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <i data-lucide="flame" class="w-4 h-4 text-amber-500"></i>
                <span>อุปกรณ์ที่ถูกยืมบ่อยที่สุด</span>
            </h3>

            <div class="space-y-3">
                @forelse($topEquipment as $index => $item)
                    <div class="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span class="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {{ $index + 1 }}
                        </span>
                        <img src="{{ $item->display_image }}" class="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0">
                        <div class="flex-1 min-w-0">
                            <p class="font-bold text-slate-800 dark:text-white text-xs truncate">{{ $item->name }}</p>
                            <span class="text-[10px] text-slate-400">{{ $item->category }}</span>
                        </div>
                        <span class="px-2 py-1 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 font-bold text-xs shrink-0">
                            {{ $item->borrows_count }} ครั้ง
                        </span>
                    </div>
                @empty
                    <p class="text-xs text-slate-400 text-center py-6">ยังไม่มีข้อมูลการยืม</p>
                @endforelse
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Category Breakdown Bar Chart
    const catLabels = {!! json_encode($categoryBreakdown->pluck('category')) !!};
    const catData = {!! json_encode($categoryBreakdown->pluck('total_qty')) !!};

    const ctxCat = document.getElementById('categoryChart').getContext('2d');
    new Chart(ctxCat, {
        type: 'bar',
        data: {
            labels: catLabels,
            datasets: [{
                label: 'จำนวนชิ้น',
                data: catData,
                backgroundColor: 'rgba(2, 132, 199, 0.8)',
                borderColor: 'rgba(2, 132, 199, 1)',
                borderWidth: 1,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                }
            }
        }
    });

    // Status Distribution Doughnut Chart
    const ctxStatus = document.getElementById('statusChart').getContext('2d');
    new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
            labels: ['พร้อมใช้งาน', 'กำลังยืม', 'รออนุมัติ', 'เกินกำหนด'],
            datasets: [{
                data: [
                    {{ $statusBreakdown['available'] }},
                    {{ $statusBreakdown['borrowed'] }},
                    {{ $statusBreakdown['pending'] }},
                    {{ $statusBreakdown['overdue'] }}
                ],
                backgroundColor: [
                    '#10b981', // emerald
                    '#0284c7', // sky
                    '#f59e0b', // amber
                    '#f43f5e'  // rose
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        font: { size: 11, family: 'Sarabun' }
                    }
                }
            }
        }
    });
});
</script>
@endpush
@endsection

