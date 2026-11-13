@extends('layouts.app')

@section('title', 'หน้าหลัก — ค้นหาและยืมอุปกรณ์')

@section('content')
<div x-data="{
    borrowModalOpen: false,
    selectedItem: null,
    selectedItemId: null,
    pickupLocation: '',
    borrowMode: 'borrow', // 'borrow' or 'requisition'
    borrowQty: 1,
    maxQty: 1,
    openBorrow(item, mode = 'borrow') {
        @guest
            window.location.href = '{{ route('login') }}';
            return;
        @endguest
        this.selectedItem = item;
        this.selectedItemId = item.id;
        this.pickupLocation = item.location || 'ห้อง ICTC ชั้น 2';
        this.borrowMode = mode;
        this.borrowQty = 1;
        this.maxQty = item.available_quantity || 1;
        this.borrowModalOpen = true;    },
    async toggleWishlist(id) {
        @guest
            window.location.href = '{{ route('login') }}';
            return;
        @endguest
        try {
            const res = await fetch(`/wishlist/${id}`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content,
                    'Accept': 'application/json'
                }
            });
            const data = await res.json();
            if (data.success) {
                const btn = document.getElementById(`wishlist-btn-${id}`);
                if (btn) {
                    if (data.inWishlist) {
                        btn.classList.add('text-rose-500', 'fill-rose-500');
                        btn.classList.remove('text-slate-400');
                    } else {
                        btn.classList.remove('text-rose-500', 'fill-rose-500');
                        btn.classList.add('text-slate-400');
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
}" class="space-y-8">

    <!-- Hero Banner -->
    <div class="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-sky-950 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-sky-500/20">
        <div class="absolute -right-10 -bottom-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="relative z-10 max-w-2xl space-y-4">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                <span>ระบบจัดการพัสดุและครุภัณฑ์ดิจิทัล ICTC</span>
            </div>
            <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                ค้นหาและยืมอุปกรณ์ IT <br class="hidden sm:block">สะดวกรวดเร็วในที่เดียว
            </h1>
            <p class="text-sm sm:text-base text-slate-300 leading-relaxed">
                บริการยืม-คืนอุปกรณ์คอมพิวเตอร์ อุปกรณ์สื่อสาร โสตทัศนูปกรณ์ สำหรับการปฏิบัติงานภายในองค์กรอย่างเป็นระบบ
            </p>

            <!-- Search bar in Hero -->
            <form action="{{ route('home') }}" method="GET" class="pt-2 flex flex-col sm:flex-row gap-2 max-w-xl">
                <div class="relative flex-1">
                    <i data-lucide="search" class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="text" name="search" value="{{ $search }}" 
                           placeholder="พิมพ์ชื่ออุปกรณ์, รุ่น, หรือหมวดหมู่..."
                           class="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-sm focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-sky-400">
                </div>
                <button type="submit" class="px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 font-bold text-white text-sm shadow-lg shadow-sky-500/30 transition-all flex items-center justify-center gap-2">
                    <span>ค้นหา</span>
                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </button>
                <a href="{{ route('borrow.create') }}" 
                   class="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 flex items-center justify-center gap-1.5 whitespace-nowrap backdrop-blur-md transition-all">
                    <i data-lucide="file-plus-2" class="w-4 h-4 text-sky-300"></i>
                    <span>แบบฟอร์มยืมอุปกรณ์</span>
                </a>
            </form>
        </div>
    </div>

    <!-- Filter & Categories Navigation Bar -->
    <div class="space-y-4">
        <!-- Department Tabs -->
        <div class="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div class="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <a href="{{ route('home', array_merge(request()->query(), ['department' => 'all', 'category' => 'all'])) }}" 
                   class="px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap {{ $department === 'all' ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-sky-400' }}">
                    ทั้งหมด
                </a>
                <a href="{{ route('home', array_merge(request()->query(), ['department' => 'IT', 'category' => 'all'])) }}" 
                   class="px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap {{ $department === 'IT' ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-sky-400' }}">
                    แผนก IT (เทคโนโลยีสารสนเทศ)
                </a>
                <a href="{{ route('home', array_merge(request()->query(), ['department' => 'PR', 'category' => 'all'])) }}" 
                   class="px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap {{ $department === 'PR' ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-sky-400' }}">
                    แผนก PR (ประชาสัมพันธ์)
                </a>
            </div>

            <!-- Status Filter Badges -->
            <div class="flex items-center gap-1.5 text-xs">
                <span class="text-slate-400 mr-1 hidden sm:inline">สถานะ:</span>
                <a href="{{ route('home', array_merge(request()->query(), ['status' => 'all'])) }}"
                   class="px-3 py-1 rounded-full text-xs font-medium {{ $status === 'all' ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200' }}">
                    ทั้งหมด
                </a>
                <a href="{{ route('home', array_merge(request()->query(), ['status' => 'available'])) }}"
                   class="px-3 py-1 rounded-full text-xs font-medium {{ $status === 'available' ? 'bg-emerald-500 text-white font-bold' : 'text-slate-500 hover:text-emerald-500' }}">
                    พร้อมใช้งาน
                </a>
                <a href="{{ route('home', array_merge(request()->query(), ['status' => 'borrowed'])) }}"
                   class="px-3 py-1 rounded-full text-xs font-medium {{ $status === 'borrowed' ? 'bg-amber-500 text-white font-bold' : 'text-slate-500 hover:text-amber-500' }}">
                    ถูกยืมหมด
                </a>
            </div>
        </div>

        <!-- Category Pills (Dynamic based on selected department) -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
            <span class="text-slate-400 font-medium shrink-0">หมวดหมู่:</span>
            <a href="{{ route('home', array_merge(request()->query(), ['category' => 'all'])) }}"
               class="px-3 py-1.5 rounded-lg whitespace-nowrap transition-all {{ $category === 'all' ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200' }}">
                ทุกหมวดหมู่
            </a>
            @php
                $catList = collect();
                if ($department === 'all') {
                    $catList = $allCategories->flatten();
                } else {
                    $catList = $allCategories->get($department, collect());
                }
            @endphp
            @foreach($catList as $catObj)
                <a href="{{ route('home', array_merge(request()->query(), ['category' => $catObj->name])) }}"
                   class="px-3 py-1.5 rounded-lg whitespace-nowrap transition-all {{ $category === $catObj->name ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200' }}">
                    {{ $catObj->name }}
                </a>
            @endforeach
        </div>
    </div>

    <!-- Active Search Indicator -->
    @if($search || $category !== 'all' || $department !== 'all' || $status !== 'all')
        <div class="flex items-center justify-between p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 text-xs text-sky-800 dark:text-sky-300">
            <div class="flex items-center gap-2 flex-wrap">
                <i data-lucide="filter" class="w-4 h-4 text-sky-500"></i>
                <span>กำลังกรอง:</span>
                @if($search)<span class="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 font-bold">ค้นหา: "{{ $search }}"</span>@endif
                @if($department !== 'all')<span class="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 font-bold">แผนก: {{ $department }}</span>@endif
                @if($category !== 'all')<span class="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 font-bold">หมวดหมู่: {{ $category }}</span>@endif
                @if($status !== 'all')<span class="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 font-bold">สถานะ: {{ $status }}</span>@endif
            </div>
            <a href="{{ route('home') }}" class="font-bold underline hover:text-sky-950 dark:hover:text-white">ล้างตัวกรองทั้งหมด</a>
        </div>
    @endif

    <!-- Equipment Grid -->
    @if($items->count() > 0)
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            @foreach($items as $item)
                @php
                    $isAvailable = $item->available_quantity > 0;
                    $isWishlisted = in_array($item->id, $wishlistEquipmentIds);
                @endphp
                <div class="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
                    <div>
                        <!-- Thumbnail Box -->
                        <div class="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <img src="{{ $item->display_image }}" alt="{{ $item->name }}" 
                                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                            
                            <!-- Badges Top -->
                            <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
                                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-700 dark:text-slate-200 shadow-sm">
                                    {{ $item->department }} &bull; {{ $item->category }}
                                </span>
                            </div>

                            <!-- Wishlist Button -->
                            <button @click="toggleWishlist({{ $item->id }})" 
                                    class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-sm transition-all"
                                    title="บันทึกในรายการที่สนใจ">
                                <i id="wishlist-btn-{{ $item->id }}" data-lucide="heart" class="w-4 h-4 {{ $isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-slate-400' }}"></i>
                            </button>

                            <!-- Availability Tag Overlay Bottom -->
                            <div class="absolute bottom-3 left-3">
                                @if($isAvailable)
                                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/90 backdrop-blur-md text-white shadow-sm">
                                        <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                        มีในสต็อก {{ $item->available_quantity }} ชิ้น
                                    </span>
                                @else
                                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/90 backdrop-blur-md text-white shadow-sm">
                                        <i data-lucide="clock" class="w-3 h-3"></i>
                                        ถูกยืมหมดแล้ว
                                    </span>
                                @endif
                            </div>
                        </div>

                        <!-- Card Body -->
                        <div class="p-5 space-y-2.5">
                            <a href="{{ route('equipment.show', $item->id) }}" class="block font-bold text-slate-800 dark:text-white hover:text-sky-500 transition-colors line-clamp-1 text-base">
                                {{ $item->name }}
                            </a>
                            <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {{ $item->description ?: 'ไม่มีคำอธิบายอุปกรณ์เพิ่มเติม' }}
                            </p>

                            @if($item->location)
                                <div class="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                                    <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400 shrink-0"></i>
                                    <span class="truncate">{{ $item->location }}</span>
                                </div>
                            @endif
                        </div>
                    </div>

                    <!-- Card Actions Footer -->
                    <div class="p-5 pt-0 flex items-center gap-2">
                        <a href="{{ route('equipment.show', $item->id) }}" 
                           class="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                            ดูรายละเอียด
                        </a>

                        @if($isAvailable)
                            <button @click="openBorrow({{ json_encode($item) }}, 'borrow')"
                                    class="flex-1 py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-1.5">
                                <i data-lucide="arrow-right-left" class="w-3.5 h-3.5"></i>
                                <span>ขอยืม</span>
                            </button>
                        @else
                            <button disabled class="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-medium cursor-not-allowed text-center">
                                หมดชั่วคราว
                            </button>
                        @endif
                    </div>
                </div>
            @endforeach
        </div>
    @else
        <!-- Empty State -->
        <div class="py-16 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <i data-lucide="package-search" class="w-8 h-8"></i>
            </div>
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">ไม่พบอุปกรณ์ที่ค้นหา</h3>
            <p class="text-xs text-slate-400 max-w-sm mx-auto">
                ลองตรวจสอบคำสะกด หรือเปลี่ยนหมวดหมู่/แผนกตัวกรองด้านบนใหม่อีกครั้ง
            </p>
            <div class="pt-2">
                <a href="{{ route('home') }}" class="px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-bold inline-block">
                    ล้างการค้นหา
                </a>
            </div>
        </div>
    @endif

    <!-- Borrow / Requisition Modal -->
    <div x-cloak x-show="borrowModalOpen" 
         class="fixed inset-0 z-50 flex items-center justify-center p-4">
        
        <div x-show="borrowModalOpen" 
             x-transition:enter="ease-out duration-300"
             x-transition:enter-start="opacity-0"
             x-transition:enter-end="opacity-100"
             x-transition:leave="ease-in duration-200"
             x-transition:leave-start="opacity-100"
             x-transition:leave-end="opacity-0"
             @click="borrowModalOpen = false" 
             class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

        <div x-show="borrowModalOpen"
             x-transition:enter="ease-out duration-300"
             x-transition:enter-start="opacity-0 scale-95"
             x-transition:enter-end="opacity-100 scale-100"
             x-transition:leave="ease-in duration-200"
             x-transition:leave-start="opacity-100 scale-100"
             x-transition:leave-end="opacity-0 scale-95"
             class="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
            
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                    <h3 class="text-lg font-bold text-slate-800 dark:text-white" x-text="borrowMode === 'requisition' ? 'แบบฟอร์มเบิกอุปกรณ์' : 'แบบฟอร์มขอยืมอุปกรณ์'"></h3>
                    <p class="text-xs text-slate-400" x-text="selectedItem ? selectedItem.name : ''"></p>
                </div>
                <div class="flex items-center gap-2">
                    <a :href="'/borrow/create?equipment_id=' + (selectedItem ? selectedItem.id : '')" 
                       class="text-[11px] text-sky-500 hover:text-sky-600 font-bold hidden sm:inline-flex items-center gap-1">
                        <span>เปิดแบบฟอร์มเต็มหน้า</span>
                        <i data-lucide="external-link" class="w-3 h-3"></i>
                    </a>
                    <button @click="borrowModalOpen = false" class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>

            <!-- Modal Form -->
            <form action="{{ route('borrow.store') }}" method="POST" class="space-y-4">
                @csrf
                <input type="hidden" name="equipment_id" :value="selectedItemId" required>
                <input type="hidden" name="transaction_type" :value="borrowMode === 'requisition' ? 'REQUISITION' : 'BORROW'">

                <!-- Toggle Type (Borrow vs Requisition) -->
                <div class="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                    <button type="button" @click="borrowMode = 'borrow'"
                            :class="borrowMode === 'borrow' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm font-bold' : 'text-slate-500 font-medium'"
                            class="py-2 rounded-xl text-xs transition-all text-center">
                        ยืมอุปกรณ์ (คืนตามกำหนด)
                    </button>
                    <button type="button" @click="borrowMode = 'requisition'"
                            :class="borrowMode === 'requisition' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm font-bold' : 'text-slate-500 font-medium'"
                            class="py-2 rounded-xl text-xs transition-all text-center">
                        เบิกอุปกรณ์ (ใช้แล้วหมดไป)
                    </button>
                </div>

                <!-- Quantity input -->
                <div>
                    <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">จำนวนที่ต้องการ (คงเหลือ: <span x-text="maxQty"></span>)</label>
                    <div class="flex items-center gap-3">
                        <button type="button" @click="if(borrowQty > 1) borrowQty--" class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 flex items-center justify-center font-bold text-lg">-</button>
                        <input type="number" name="borrow_quantity" x-model="borrowQty" min="1" :max="maxQty" required
                               class="flex-1 py-2 text-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-white">
                        <button type="button" @click="if(borrowQty < maxQty) borrowQty++" class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 flex items-center justify-center font-bold text-lg">+</button>
                    </div>
                </div>

                <!-- Due date picker -->
                <div>
                    <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        <span x-text="borrowMode === 'requisition' ? 'วันที่เบิกใช้งาน *' : 'กำหนดวันส่งคืนอุปกรณ์ *'"></span>
                    </label>
                    <input type="date" name="due_date" value="{{ date('Y-m-d', strtotime('+3 days')) }}" min="{{ date('Y-m-d') }}" required
                           class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500">
                </div>

                <!-- Pickup location -->
                <div>
                    <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">จุดรับอุปกรณ์</label>
                    <input type="text" name="pickup_location" x-model="pickupLocation" required
                           class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500">
                </div>

                <!-- Note -->
                <div>
                    <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">วัตถุประสงค์ในการยืม / หมายเหตุ</label>
                    <textarea name="note" rows="2" placeholder="ระบุเหตุผลในการใช้งาน..."
                              class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"></textarea>
                </div>

                <div class="pt-2 flex items-center gap-3">
                    <button type="button" @click="borrowModalOpen = false" class="w-1/3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800">
                        ยกเลิก
                    </button>
                    <button type="submit" 
                            class="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2">
                        <i data-lucide="check" class="w-4 h-4"></i>
                        <span>ยืนยันการส่งคำขอ</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

</div>
@endsection