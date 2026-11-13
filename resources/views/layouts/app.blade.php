<!DOCTYPE html>
<html lang="th" x-data="{ 
    darkMode: localStorage.getItem('theme') === 'dark',
    sidebarOpen: true,
    sidebarMobile: false,
    sidebarSide: localStorage.getItem('sidebarSide') || 'left',
    toggleTheme() {
        this.darkMode = !this.darkMode;
        localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
        if (this.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    },
    toggleSidebarSide() {
        this.sidebarSide = this.sidebarSide === 'left' ? 'right' : 'left';
        localStorage.setItem('sidebarSide', this.sidebarSide);
    }
}" :class="{ 'dark': darkMode }" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>@yield('title', 'ICTC-Asset') — ระบบครุภัณฑ์ IT</title>
    <link rel="icon" type="image/png" href="{{ asset('logo_ictc.png') }}">

    <!-- Google Fonts: Inter & Sarabun -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Sarabun', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                    },
                    colors: {
                        brand: {
                            50: '#f0f9ff',
                            100: '#e0f2fe',
                            500: '#0284c7',
                            600: '#0369a1',
                            700: '#075985',
                        }
                    }
                }
            }
        }
    </script>

    <!-- Alpine.js -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js"></script>

    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>

    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <style>
        [x-cloak] { display: none !important; }
        body {
            font-family: 'Sarabun', 'Inter', sans-serif;
        }
        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.05);
        }
        ::-webkit-scrollbar-thumb {
            background: rgba(100, 116, 139, 0.3);
            border-radius: 9999px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: rgba(100, 116, 139, 0.5);
        }
    </style>
    @stack('styles')
</head>
<body class="h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased transition-colors duration-200">
    <script>
        if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    </script>

    <div class="min-h-screen flex flex-col">
        <!-- Mobile Drawer Backdrop -->
        <div x-cloak x-show="sidebarMobile" 
             x-transition:enter="transition-opacity ease-linear duration-300"
             x-transition:enter-start="opacity-0"
             x-transition:enter-end="opacity-100"
             x-transition:leave="transition-opacity ease-linear duration-300"
             x-transition:leave-start="opacity-100"
             x-transition:leave-end="opacity-0"
             @click="sidebarMobile = false"
             class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden">
        </div>

        <!-- Sidebar -->
        <aside x-cloak 
               :class="{
                   'translate-x-0': sidebarMobile,
                   '-translate-x-full': !sidebarMobile && sidebarSide === 'left',
                   'translate-x-full': !sidebarMobile && sidebarSide === 'right',
                   'lg:translate-x-0': true,
                   'left-0 border-r': sidebarSide === 'left',
                   'right-0 border-l': sidebarSide === 'right',
                   'w-64': sidebarOpen,
                   'w-20': !sidebarOpen
               }"
               class="fixed top-0 bottom-0 z-50 bg-slate-900 text-white border-slate-800/80 transition-all duration-300 flex flex-col justify-between shadow-xl">
            
            <!-- Top Branding -->
            <div>
                <div class="h-16 flex items-center px-4 border-b border-slate-800/80 gap-3" :class="sidebarOpen ? 'justify-between' : 'justify-center'">
                    <a href="{{ route('home') }}" class="flex items-center gap-3 overflow-hidden">
                        <div class="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center p-1.5 shrink-0">
                            <img src="{{ asset('logo_ictc.png') }}" alt="ICTC Logo" class="w-full h-full object-contain">
                        </div>
                        <div x-show="sidebarOpen" class="flex flex-col whitespace-nowrap overflow-hidden">
                            <span class="font-bold text-base tracking-tight text-white leading-tight">ICTC-Asset</span>
                            <span class="text-[11px] text-sky-400 font-medium">ระบบครุภัณฑ์ IT</span>
                        </div>
                    </a>
                    <button @click="sidebarMobile = false" class="lg:hidden p-1 text-slate-400 hover:text-white">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>

                <!-- Navigation Links -->
                <nav class="p-3 space-y-1.5 text-sm">
                    <div x-show="sidebarOpen" class="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                        เมนูหลัก
                    </div>

                    <!-- หน้าหลัก -->
                    <a href="{{ route('home') }}" 
                       class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all {{ request()->routeIs('home') ? 'bg-sky-500/20 text-sky-400 font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200' }}"
                       :class="!sidebarOpen && 'justify-center'"
                       title="หน้าหลัก">
                        <i data-lucide="home" class="w-5 h-5 shrink-0 {{ request()->routeIs('home') ? 'text-sky-400' : 'text-slate-400' }}"></i>
                        <span x-show="sidebarOpen">หน้าหลัก</span>
                    </a>

                    <!-- แบบฟอร์มยืมอุปกรณ์ -->
                    <a href="{{ route('borrow.create') }}" 
                       class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all {{ request()->routeIs('borrow.create') ? 'bg-sky-500/20 text-sky-400 font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200' }}"
                       :class="!sidebarOpen && 'justify-center'"
                       title="แบบฟอร์มยืมอุปกรณ์">
                        <i data-lucide="file-plus-2" class="w-5 h-5 shrink-0 {{ request()->routeIs('borrow.create') ? 'text-sky-400' : 'text-slate-400' }}"></i>
                        <span x-show="sidebarOpen">แบบฟอร์มยืมอุปกรณ์</span>
                    </a>

                    @auth
                        <!-- รายการของฉัน (All logged in users) -->
                        <a href="{{ route('my-requests') }}" 
                           class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all {{ request()->routeIs('my-requests') ? 'bg-sky-500/20 text-sky-400 font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200' }}"
                           :class="!sidebarOpen && 'justify-center'"
                           title="รายการของฉัน">
                            <i data-lucide="shopping-bag" class="w-5 h-5 shrink-0 {{ request()->routeIs('my-requests') ? 'text-sky-400' : 'text-slate-400' }}"></i>
                            <span x-show="sidebarOpen">รายการของฉัน</span>
                        </a>

                        @if(Auth::user()->isAdmin())
                            <div x-show="sidebarOpen" class="px-3 pt-4 pb-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                                ผู้ดูแลระบบ (Admin)
                            </div>

                            <!-- แดชบอร์ด -->
                            <a href="{{ route('dashboard') }}" 
                               class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all {{ request()->routeIs('dashboard*') ? 'bg-sky-500/20 text-sky-400 font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200' }}"
                               :class="!sidebarOpen && 'justify-center'"
                               title="แดชบอร์ด">
                                <i data-lucide="layout-dashboard" class="w-5 h-5 shrink-0 {{ request()->routeIs('dashboard*') ? 'text-sky-400' : 'text-slate-400' }}"></i>
                                <span x-show="sidebarOpen">แดชบอร์ด</span>
                            </a>

                            <!-- สถานะการยืม-เบิก -->
                            <a href="{{ route('borrow.index') }}" 
                               class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all {{ request()->routeIs('borrow.index') ? 'bg-sky-500/20 text-sky-400 font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200' }}"
                               :class="!sidebarOpen && 'justify-center'"
                               title="สถานะยืม-เบิกอุปกรณ์">
                                <i data-lucide="arrow-right-left" class="w-5 h-5 shrink-0 {{ request()->routeIs('borrow.index') ? 'text-sky-400' : 'text-slate-400' }}"></i>
                                <span x-show="sidebarOpen">สถานะการยืม-เบิก</span>
                            </a>

                            <!-- จัดการอุปกรณ์ -->
                            <a href="{{ route('equipment.index') }}" 
                               class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all {{ request()->routeIs('equipment.index') ? 'bg-sky-500/20 text-sky-400 font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200' }}"
                               :class="!sidebarOpen && 'justify-center'"
                               title="จัดการอุปกรณ์">
                                <i data-lucide="monitor" class="w-5 h-5 shrink-0 {{ request()->routeIs('equipment.index') ? 'text-sky-400' : 'text-slate-400' }}"></i>
                                <span x-show="sidebarOpen">จัดการอุปกรณ์</span>
                            </a>

                            <!-- การตรวจสอบประจำปี -->
                            <a href="{{ route('annual-audits.index') }}" 
                               class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all {{ request()->routeIs('annual-audits.*') ? 'bg-sky-500/20 text-sky-400 font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200' }}"
                               :class="!sidebarOpen && 'justify-center'"
                               title="การตรวจสอบประจำปี">
                                <i data-lucide="clipboard-check" class="w-5 h-5 shrink-0 {{ request()->routeIs('annual-audits.*') ? 'text-sky-400' : 'text-slate-400' }}"></i>
                                <span x-show="sidebarOpen">การตรวจสอบประจำปี</span>
                            </a>

                            <!-- จัดการผู้ใช้ -->
                            <a href="{{ route('users.index') }}" 
                               class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all {{ request()->routeIs('users.*') ? 'bg-sky-500/20 text-sky-400 font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200' }}"
                               :class="!sidebarOpen && 'justify-center'"
                               title="ผู้ใช้งาน">
                                <i data-lucide="users" class="w-5 h-5 shrink-0 {{ request()->routeIs('users.*') ? 'text-sky-400' : 'text-slate-400' }}"></i>
                                <span x-show="sidebarOpen">ผู้ใช้งาน</span>
                            </a>
                        @endif
                    @endauth
                </nav>
            </div>

            <!-- Bottom Controls -->
            <div class="p-3 border-t border-slate-800/80 space-y-1">
                <!-- Move Sidebar Side -->
                <button @click="toggleSidebarSide()" 
                        class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-all"
                        :class="!sidebarOpen && 'justify-center'"
                        title="สลับฝั่งเมนู (ซ้าย/ขวา)">
                    <i data-lucide="panel-left-close" class="w-4 h-4 shrink-0"></i>
                    <span x-show="sidebarOpen">สลับฝั่งเมนู</span>
                </button>

                <!-- Collapse Sidebar (Desktop) -->
                <button @click="sidebarOpen = !sidebarOpen" 
                        class="hidden lg:flex w-full items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-all"
                        :class="!sidebarOpen && 'justify-center'"
                        title="ย่อ/ขยายแถบเมนู">
                    <i :data-lucide="sidebarOpen ? 'chevron-left' : 'chevron-right'" class="w-4 h-4 shrink-0"></i>
                    <span x-show="sidebarOpen">ย่อแถบเมนู</span>
                </button>
            </div>
        </aside>

        <!-- Main Wrapper -->
        <div class="flex-1 flex flex-col transition-all duration-300"
             :class="{
                 'lg:ml-64': sidebarOpen && sidebarSide === 'left',
                 'lg:ml-20': !sidebarOpen && sidebarSide === 'left',
                 'lg:mr-64': sidebarOpen && sidebarSide === 'right',
                 'lg:mr-20': !sidebarOpen && sidebarSide === 'right'
             }">
            
            <!-- Topbar -->
            <header class="h-16 sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 lg:px-8 flex items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                    <button @click="sidebarMobile = true" class="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <i data-lucide="menu" class="w-5 h-5"></i>
                    </button>

                    <!-- Search Form -->
                    <form action="{{ route('home') }}" method="GET" class="relative hidden sm:block w-72 md:w-96">
                        <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input type="text" name="search" value="{{ request('search') }}" 
                               placeholder="ค้นหาอุปกรณ์, รหัส, หมวดหมู่..." 
                               class="w-full pl-10 pr-4 py-1.5 rounded-full text-sm bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all">
                    </form>
                </div>

                <div class="flex items-center gap-2 sm:gap-3">
                    <!-- Date badge (Thai Buddhist Date) -->
                    <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                        <i data-lucide="calendar" class="w-3.5 h-3.5 text-sky-500"></i>
                        <span>
                            @php
                                $thaiMonths = [1=>'ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
                                $now = \Carbon\Carbon::now();
                                $thaiYear = $now->year + 543;
                                echo $now->day . ' ' . $thaiMonths[$now->month] . ' ' . $thaiYear;
                            @endphp
                        </span>
                    </div>

                    <!-- Theme Toggle -->
                    <button @click="toggleTheme()" 
                            class="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            title="สลับโหมดมืด/สว่าง">
                        <template x-if="darkMode">
                            <i data-lucide="sun" class="w-5 h-5 text-amber-400"></i>
                        </template>
                        <template x-if="!darkMode">
                            <i data-lucide="moon" class="w-5 h-5 text-slate-600"></i>
                        </template>
                    </button>

                    @auth
                        <!-- User Menu Dropdown -->
                        <div x-data="{ open: false }" class="relative">
                            <button @click="open = !open" 
                                    @click.away="open = false"
                                    class="flex items-center gap-2.5 p-1 rounded-full hover:ring-2 hover:ring-sky-500/20 transition-all">
                                <img src="{{ Auth::user()->avatar_url }}" alt="avatar" class="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700">
                                <div class="hidden sm:flex flex-col text-left">
                                    <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">{{ Auth::user()->displayName }}</span>
                                    <span class="text-[10px] text-sky-500 font-medium uppercase">{{ Auth::user()->role }}</span>
                                </div>
                                <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-slate-400 hidden sm:block"></i>
                            </button>

                            <div x-cloak x-show="open" 
                                 x-transition:enter="transition ease-out duration-100"
                                 x-transition:enter-start="transform opacity-0 scale-95"
                                 x-transition:enter-end="transform opacity-100 scale-100"
                                 x-transition:leave="transition ease-in duration-75"
                                 x-transition:leave-start="transform opacity-100 scale-100"
                                 x-transition:leave-end="transform opacity-0 scale-95"
                                 class="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 text-sm">
                                <div class="px-4 py-2 border-b border-slate-100 dark:border-slate-700/60">
                                    <p class="font-bold text-slate-800 dark:text-white truncate">{{ Auth::user()->displayName }}</p>
                                    <p class="text-xs text-slate-400 truncate">&#64;{{ Auth::user()->username }} &bull; {{ Auth::user()->department ?? 'ICTC' }}</p>
                                </div>
                                <a href="{{ route('profile') }}" class="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <i data-lucide="user" class="w-4 h-4 text-slate-400"></i> ข้อมูลส่วนตัว
                                </a>
                                <a href="{{ route('my-requests') }}" class="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <i data-lucide="package" class="w-4 h-4 text-slate-400"></i> รายการของฉัน
                                </a>
                                <div class="border-t border-slate-100 dark:border-slate-700/60 my-1"></div>
                                <form action="{{ route('logout') }}" method="POST">
                                    @csrf
                                    <button type="submit" class="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left font-medium">
                                        <i data-lucide="log-out" class="w-4 h-4"></i> ออกจากระบบ
                                    </button>
                                </form>
                            </div>
                        </div>
                    @else
                        <!-- Guest Login Button -->
                        <div class="flex items-center gap-2">
                            <a href="{{ route('login') }}" class="px-3.5 py-1.5 rounded-full text-xs font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-all">
                                เข้าสู่ระบบ
                            </a>
                            <a href="{{ route('register') }}" class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/20 transition-all">
                                สมัครสมาชิก
                            </a>
                        </div>
                    @endauth
                </div>
            </header>

            <!-- Flash Notifications -->
            <div class="px-4 lg:px-8 pt-4">
                @if(session('success'))
                    <div x-data="{ show: true }" x-show="show" class="mb-4 flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl shadow-sm text-sm">
                        <div class="flex items-center gap-3">
                            <i data-lucide="check-circle" class="w-5 h-5 text-emerald-500 shrink-0"></i>
                            <span>{{ session('success') }}</span>
                        </div>
                        <button @click="show = false" class="p-1 hover:text-emerald-950 dark:hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
                    </div>
                @endif

                @if(session('error'))
                    <div x-data="{ show: true }" x-show="show" class="mb-4 flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-2xl shadow-sm text-sm">
                        <div class="flex items-center gap-3">
                            <i data-lucide="alert-circle" class="w-5 h-5 text-red-500 shrink-0"></i>
                            <span>{{ session('error') }}</span>
                        </div>
                        <button @click="show = false" class="p-1 hover:text-red-950 dark:hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
                    </div>
                @endif

                @if(session('info'))
                    <div x-data="{ show: true }" x-show="show" class="mb-4 flex items-center justify-between p-4 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 rounded-2xl shadow-sm text-sm">
                        <div class="flex items-center gap-3">
                            <i data-lucide="info" class="w-5 h-5 text-sky-500 shrink-0"></i>
                            <span>{{ session('info') }}</span>
                        </div>
                        <button @click="show = false" class="p-1 hover:text-sky-950 dark:hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
                    </div>
                @endif

                @if($errors->any())
                    <div x-data="{ show: true }" x-show="show" class="mb-4 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-2xl shadow-sm text-sm">
                        <div class="flex items-center gap-2 font-bold mb-1">
                            <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-500"></i>
                            <span>กรุณาตรวจสอบข้อผิดพลาด:</span>
                        </div>
                        <ul class="list-disc list-inside space-y-0.5 pl-6 text-xs">
                            @foreach($errors->all() as $err)
                                <li>{{ $err }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif
            </div>

            <!-- Page Content -->
            <main class="flex-1 px-4 lg:px-8 py-6">
                @yield('content')
            </main>

            <!-- Footer -->
            <footer class="py-6 px-4 lg:px-8 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800/80">
                &copy; {{ date('Y') }} ICTC-Asset — ระบบบริหารจัดการยืม-คืนอุปกรณ์และพัสดุเทคโนโลยีสารสนเทศ
            </footer>
        </div>
    </div>

    <!-- Initialize Lucide icons on page load and Alpine changes -->
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            lucide.createIcons();
        });
        document.addEventListener('alpine:initialized', () => {
            lucide.createIcons();
        });
    </script>
    @stack('scripts')
</body>
</html>

