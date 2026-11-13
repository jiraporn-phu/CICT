@extends('layouts.app')

@section('title', 'จัดการอุปกรณ์ — ICTC-Asset')

@section('content')
<div x-data="{
    createModalOpen: false,
    editModalOpen: false,
    categoryModalOpen: false,
    editItem: {},
    openEdit(item) {
        this.editItem = JSON.parse(JSON.stringify(item));
        this.editModalOpen = true;
    }
}" class="space-y-6">

    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">จัดการอุปกรณ์และพัสดุ</h1>
            <p class="text-xs text-slate-400">ควบคุมและตรวจสอบสถานะครุภัณฑ์ในระบบ ICTC</p>
        </div>
        <div class="flex items-center gap-2">
            <button @click="categoryModalOpen = true" 
                    class="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:border-sky-500 shadow-sm transition-all flex items-center gap-2">
                <i data-lucide="folder-cog" class="w-4 h-4 text-sky-500"></i>
                <span>จัดการหมวดหมู่</span>
            </button>
            <button @click="createModalOpen = true" 
                    class="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2">
                <i data-lucide="plus" class="w-4 h-4"></i>
                <span>เพิ่มอุปกรณ์ใหม่</span>
            </button>
        </div>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form action="{{ route('equipment.index') }}" method="GET" class="w-full md:w-auto flex-1 flex flex-col sm:flex-row items-center gap-2">
            <div class="relative w-full sm:w-72">
                <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input type="text" name="search" value="{{ $search }}" placeholder="ค้นหาชื่อ, รหัส, สถานที่..."
                       class="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500">
            </div>

            <select name="department" onchange="this.form.submit()" 
                    class="w-full sm:w-44 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <option value="all" {{ $department === 'all' ? 'selected' : '' }}>ทุกแผนก</option>
                <option value="IT" {{ $department === 'IT' ? 'selected' : '' }}>แผนก IT</option>
                <option value="PR" {{ $department === 'PR' ? 'selected' : '' }}>แผนก PR</option>
            </select>

            <select name="category" onchange="this.form.submit()" 
                    class="w-full sm:w-44 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <option value="all" {{ $category === 'all' ? 'selected' : '' }}>ทุกหมวดหมู่</option>
                @foreach($categories->flatten() as $cat)
                    <option value="{{ $cat->name }}" {{ $category === $cat->name ? 'selected' : '' }}>{{ $cat->name }}</option>
                @endforeach
            </select>

            <button type="submit" class="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 text-white dark:bg-slate-700 text-xs font-semibold">
                ค้นหา
            </button>
            @if($search || $department !== 'all' || $category !== 'all')
                <a href="{{ route('equipment.index') }}" class="text-xs text-rose-500 font-bold hover:underline px-2">ล้าง</a>
            @endif
        </form>

        <div class="text-xs text-slate-400 shrink-0">
            ทั้งหมด <span class="font-bold text-slate-700 dark:text-slate-200">{{ $equipments->total() }}</span> รายการ
        </div>
    </div>

    <!-- Equipment Table -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead class="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-slate-400 text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                        <th class="py-4 px-6">อุปกรณ์</th>
                        <th class="py-4 px-4">แผนก / หมวดหมู่</th>
                        <th class="py-4 px-4">คงเหลือ / ทั้งหมด</th>
                        <th class="py-4 px-4">จุดจัดเก็บ</th>
                        <th class="py-4 px-4">สถานะ</th>
                        <th class="py-4 px-6 text-right">จัดการ</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80">
                    @forelse($equipments as $item)
                        @php
                            $available = $item->available_quantity;
                        @endphp
                        <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                            <td class="py-3 px-6">
                                <div class="flex items-center gap-3">
                                    <img src="{{ $item->display_image }}" alt="" class="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700">
                                    <div>
                                        <a href="{{ route('equipment.show', $item->id) }}" class="font-bold text-slate-800 dark:text-white hover:text-sky-500 text-sm">
                                            {{ $item->name }}
                                        </a>
                                        <p class="text-[11px] text-slate-400 line-clamp-1">{{ $item->description ?: 'ไม่มีรายละเอียด' }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="py-3 px-4">
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    {{ $item->department }}
                                </span>
                                <span class="text-slate-400 text-[11px] block mt-0.5">{{ $item->category }}</span>
                            </td>
                            <td class="py-3 px-4 font-semibold">
                                <span class="{{ $available > 0 ? 'text-emerald-500' : 'text-rose-500' }} font-bold text-sm">{{ $available }}</span>
                                <span class="text-slate-400">/ {{ $item->quantity }}</span>
                            </td>
                            <td class="py-3 px-4 text-slate-500 dark:text-slate-400">
                                {{ $item->location ?: '-' }}
                            </td>
                            <td class="py-3 px-4">
                                @if($available > 0)
                                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> พร้อมใช้งาน
                                    </span>
                                @else
                                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
                                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> ยืมหมดแล้ว
                                    </span>
                                @endif
                            </td>
                            <td class="py-3 px-6 text-right">
                                <div class="flex items-center justify-end gap-1.5">
                                    <button @click="openEdit({{ json_encode($item) }})" 
                                            class="p-2 rounded-xl text-slate-500 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-slate-800 transition-all"
                                            title="แก้ไข">
                                        <i data-lucide="pencil" class="w-4 h-4"></i>
                                    </button>
                                    <form action="{{ route('equipment.destroy', $item->id) }}" method="POST" onsubmit="return confirm('ยืนยันที่จะลบอุปกรณ์นี้หรือไม่? (ข้อมูลการยืมจะถูกลบด้วย)')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-all" title="ลบ">
                                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="py-12 text-center text-slate-400">
                                ไม่พบรายการอุปกรณ์
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($equipments->hasPages())
            <div class="p-4 border-t border-slate-100 dark:border-slate-800">
                {{ $equipments->links() }}
            </div>
        @endif
    </div>

    <!-- Create Equipment Modal -->
    <div x-cloak x-show="createModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div @click="createModalOpen = false" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
        <div class="relative z-10 w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-base font-bold text-slate-800 dark:text-white">เพิ่มอุปกรณ์ใหม่ในระบบ</h3>
                <button @click="createModalOpen = false" class="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <form action="{{ route('equipment.store') }}" method="POST" enctype="multipart/form-data" class="space-y-4">
                @csrf
                <div>
                    <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ชื่ออุปกรณ์ *</label>
                    <input type="text" name="name" required placeholder="เช่น โน้ตบุ๊ก Dell Latitude 5420"
                           class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white">
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">แผนก *</label>
                        <select name="department" required class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white">
                            <option value="IT">IT (เทคโนโลยีสารสนเทศ)</option>
                            <option value="PR">PR (ประชาสัมพันธ์)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">หมวดหมู่ *</label>
                        <input type="text" name="category" required placeholder="เช่น คอมพิวเตอร์, กล้อง"
                               class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">จำนวนทั้งหมด (ชิ้น) *</label>
                        <input type="number" name="quantity" min="1" value="1" required
                               class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">สถานที่จัดเก็บ</label>
                        <input type="text" name="location" placeholder="เช่น ตู้เก็บ ICTC ชั้น 2"
                               class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white">
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">รูปภาพอุปกรณ์</label>
                    <input type="file" name="image" accept="image/*"
                           class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-500 file:text-white hover:file:bg-sky-600">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">รายละเอียด / คุณลักษณะ</label>
                    <textarea name="description" rows="3" placeholder="ระบุสเปก หรือรายละเอียดเพิ่มเติม..."
                              class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"></textarea>
                </div>

                <div class="pt-2 flex items-center justify-end gap-2">
                    <button type="button" @click="createModalOpen = false" class="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold">ยกเลิก</button>
                    <button type="submit" class="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-500/20">บันทึกอุปกรณ์</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Edit Equipment Modal -->
    <div x-cloak x-show="editModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div @click="editModalOpen = false" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
        <div class="relative z-10 w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-base font-bold text-slate-800 dark:text-white">แก้ไขข้อมูลอุปกรณ์</h3>
                <button @click="editModalOpen = false" class="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <form :action="'/equipment/' + editItem.id" method="POST" enctype="multipart/form-data" class="space-y-4">
                @csrf
                @method('PUT')
                <div>
                    <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ชื่ออุปกรณ์ *</label>
                    <input type="text" name="name" x-model="editItem.name" required
                           class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white">
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">แผนก *</label>
                        <select name="department" x-model="editItem.department" required class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white">
                            <option value="IT">IT</option>
                            <option value="PR">PR</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">หมวดหมู่ *</label>
                        <input type="text" name="category" x-model="editItem.category" required
                               class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">จำนวนทั้งหมด (ชิ้น) *</label>
                        <input type="number" name="quantity" min="1" x-model="editItem.quantity" required
                               class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">สถานที่จัดเก็บ</label>
                        <input type="text" name="location" x-model="editItem.location"
                               class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white">
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">เปลี่ยนรูปภาพใหม่ (ถ้ามี)</label>
                    <input type="file" name="image" accept="image/*"
                           class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-500 file:text-white hover:file:bg-sky-600">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">รายละเอียด / คุณลักษณะ</label>
                    <textarea name="description" rows="3" x-model="editItem.description"
                              class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"></textarea>
                </div>

                <div class="pt-2 flex items-center justify-end gap-2">
                    <button type="button" @click="editModalOpen = false" class="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold">ยกเลิก</button>
                    <button type="submit" class="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-500/20">บันทึกการแก้ไข</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Category Management Modal -->
    <div x-cloak x-show="categoryModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div @click="categoryModalOpen = false" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
        <div class="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-base font-bold text-slate-800 dark:text-white">จัดการหมวดหมู่ตามแผนก</h3>
                <button @click="categoryModalOpen = false" class="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <!-- Add new category form -->
            <form action="{{ route('categories.store') }}" method="POST" class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                @csrf
                <p class="text-xs font-bold text-slate-700 dark:text-slate-200">เพิ่มหมวดหมู่ใหม่</p>
                <div class="grid grid-cols-2 gap-2">
                    <select name="department" required class="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs">
                        <option value="IT">แผนก IT</option>
                        <option value="PR">แผนก PR</option>
                    </select>
                    <input type="text" name="name" required placeholder="ชื่อหมวดหมู่ใหม่..."
                           class="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs">
                </div>
                <button type="submit" class="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-sm">
                    + เพิ่มหมวดหมู่
                </button>
            </form>

            <!-- List Categories -->
            <div class="space-y-3 max-h-60 overflow-y-auto pr-1">
                @foreach(['IT', 'PR'] as $dept)
                    <div>
                        <span class="text-xs font-bold text-slate-400 block mb-1.5">แผนก {{ $dept }}</span>
                        <div class="flex flex-wrap gap-1.5">
                            @foreach($categories->get($dept, collect()) as $cat)
                                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">
                                    <span>{{ $cat->name }}</span>
                                    <form action="{{ route('categories.delete') }}" method="POST" onsubmit="return confirm('ยืนยันลบหมวดหมู่นี้?')">
                                        @csrf
                                        <input type="hidden" name="department" value="{{ $dept }}">
                                        <input type="hidden" name="name" value="{{ $cat->name }}">
                                        <button type="submit" class="text-slate-400 hover:text-rose-500"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
                                    </form>
                                </div>
                            @endforeach
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    </div>

</div>
@endsection

