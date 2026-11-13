@extends('layouts.app')

@section('title', 'จัดการผู้ใช้งาน — ICTC-Asset')

@section('content')
<div x-data="{
    createModalOpen: false,
    editModalOpen: false,
    editUser: {},
    openEdit(u) {
        this.editUser = JSON.parse(JSON.stringify(u));
        this.editModalOpen = true;
    }
}" class="space-y-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">จัดการผู้ใช้งานระบบ</h1>
            <p class="text-xs text-slate-400">อนุมัติสมาชิก กำหนดสิทธิ์ และดูแลบัญชีผู้ใช้งาน ICTC</p>
        </div>
        <button @click="createModalOpen = true" 
                class="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2 self-start sm:self-auto">
            <i data-lucide="user-plus" class="w-4 h-4"></i>
            <span>เพิ่มผู้ใช้งานใหม่</span>
        </button>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-500">
                <i data-lucide="users" class="w-5 h-5"></i>
            </div>
            <div>
                <span class="text-xs text-slate-400">ผู้ใช้ทั้งหมด</span>
                <p class="text-lg font-bold text-slate-800 dark:text-white">{{ $users->total() }} คน</p>
            </div>
        </div>

        <div class="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-500">
                <i data-lucide="user-check" class="w-5 h-5"></i>
            </div>
            <div>
                <span class="text-xs text-slate-400">บัญชีที่เปิดใช้งาน</span>
                <p class="text-lg font-bold text-emerald-600 dark:text-emerald-400">{{ $activeCount }} คน</p>
            </div>
        </div>

        <div class="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-500">
                <i data-lucide="clock" class="w-5 h-5"></i>
            </div>
            <div>
                <span class="text-xs text-slate-400">รอการอนุมัติ</span>
                <p class="text-lg font-bold text-amber-600 dark:text-amber-400">{{ $pendingCount }} คน</p>
            </div>
        </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form action="{{ route('users.index') }}" method="GET" class="w-full flex-1 flex flex-col sm:flex-row items-center gap-2">
            <div class="relative w-full sm:w-72">
                <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input type="text" name="search" value="{{ $search }}" placeholder="ค้นหาชื่อ, username, เบอร์..."
                       class="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500">
            </div>

            <select name="status" onchange="this.form.submit()" 
                    class="w-full sm:w-40 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <option value="all" {{ $status === 'all' ? 'selected' : '' }}>ทุกสถานะ</option>
                <option value="active" {{ $status === 'active' ? 'selected' : '' }}>เปิดใช้งาน (Active)</option>
                <option value="pending" {{ $status === 'pending' ? 'selected' : '' }}>รออนุมัติ (Pending)</option>
                <option value="suspended" {{ $status === 'suspended' ? 'selected' : '' }}>ระงับใช้งาน (Suspended)</option>
            </select>

            <select name="role" onchange="this.form.submit()" 
                    class="w-full sm:w-36 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <option value="all" {{ $role === 'all' ? 'selected' : '' }}>ทุกสิทธิ์</option>
                <option value="user" {{ $role === 'user' ? 'selected' : '' }}>ผู้ใช้ทั่วไป</option>
                <option value="admin" {{ $role === 'admin' ? 'selected' : '' }}>ผู้ดูแลระบบ</option>
            </select>

            <button type="submit" class="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 text-white dark:bg-slate-700 text-xs font-semibold">
                ค้นหา
            </button>
            @if($search || $status !== 'all' || $role !== 'all')
                <a href="{{ route('users.index') }}" class="text-xs text-rose-500 font-bold hover:underline px-2">ล้าง</a>
            @endif
        </form>
    </div>

    <!-- Users Table -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead class="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-slate-400 text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                        <th class="py-4 px-6">ผู้ใช้งาน</th>
                        <th class="py-4 px-4">แผนก</th>
                        <th class="py-4 px-4">เบอร์โทรศัพท์</th>
                        <th class="py-4 px-4">สิทธิ์การใช้งาน</th>
                        <th class="py-4 px-4">สถานะ</th>
                        <th class="py-4 px-4">ประวัติยืม</th>
                        <th class="py-4 px-6 text-right">จัดการ</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80">
                    @forelse($users as $u)
                        <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                            <td class="py-3 px-6">
                                <div class="flex items-center gap-3">
                                    <img src="{{ $u->avatar_url }}" class="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700">
                                    <div>
                                        <p class="font-bold text-slate-800 dark:text-white text-sm">{{ $u->displayName }}</p>
                                        <p class="text-[11px] text-slate-400">&#64;{{ $u->username }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="py-3 px-4">
                                {{ $u->department ?: 'ทั่วไป' }}
                            </td>
                            <td class="py-3 px-4 font-mono">
                                {{ $u->phone ?: '-' }}
                            </td>
                            <td class="py-3 px-4">
                                @if($u->isAdmin())
                                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                                        Admin
                                    </span>
                                @else
                                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                        User
                                    </span>
                                @endif
                            </td>
                            <td class="py-3 px-4">
                                @if($u->status === 'active')
                                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                        เปิดใช้งาน
                                    </span>
                                @elseif($u->status === 'pending')
                                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse">
                                        รออนุมัติ
                                    </span>
                                @else
                                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                                        ถูกระงับ
                                    </span>
                                @endif
                            </td>
                            <td class="py-3 px-4 font-bold">
                                {{ $u->borrows_count }} ครั้ง
                            </td>
                            <td class="py-3 px-6 text-right">
                                <div class="flex items-center justify-end gap-1.5">
                                    @if($u->status === 'pending')
                                        <!-- Quick Approve Form -->
                                        <form action="{{ route('users.update', $u->id) }}" method="POST">
                                            @csrf
                                            @method('PUT')
                                            <input type="hidden" name="status" value="active">
                                            <button type="submit" class="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-bold shadow-sm">
                                                อนุมัติทันที
                                            </button>
                                        </form>
                                    @endif

                                    <button @click="openEdit({{ json_encode($u) }})" 
                                            class="p-2 rounded-xl text-slate-500 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-slate-800 transition-all"
                                            title="แก้ไขข้อมูล">
                                        <i data-lucide="pencil" class="w-4 h-4"></i>
                                    </button>

                                    @if($u->id !== Auth::id())
                                        <form action="{{ route('users.destroy', $u->id) }}" method="POST" onsubmit="return confirm('ยืนยันลบผู้ใช้งานนี้?')">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-all" title="ลบผู้ใช้">
                                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                                            </button>
                                        </form>
                                    @endif
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="py-12 text-center text-slate-400">
                                ไม่พบรายชื่อผู้ใช้งาน
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($users->hasPages())
            <div class="p-4 border-t border-slate-100 dark:border-slate-800">
                {{ $users->links() }}
            </div>
        @endif
    </div>

    <!-- Create User Modal -->
    <div x-cloak x-show="createModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div @click="createModalOpen = false" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
        <div class="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-base font-bold text-slate-800 dark:text-white">เพิ่มผู้ใช้งานใหม่โดย Admin</h3>
                <button @click="createModalOpen = false" class="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <form action="{{ route('users.store') }}" method="POST" class="space-y-3.5">
                @csrf
                <div>
                    <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Username *</label>
                    <input type="text" name="username" required placeholder="ตัวอักษรภาษาอังกฤษหรือตัวเลข"
                           class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ชื่อ - นามสกุล *</label>
                    <input type="text" name="fullName" required placeholder="เช่น สมเกียรติ นครสวรรค์"
                           class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">เบอร์โทรศัพท์</label>
                        <input type="text" name="phone" placeholder="08xxxxxxxx"
                               class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">แผนก</label>
                        <select name="department" class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                            <option value="IT">IT</option>
                            <option value="PR">PR</option>
                            <option value="General">General</option>
                        </select>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">สิทธิ์การใช้งาน *</label>
                        <select name="role" required class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                            <option value="user">User (ผู้ใช้ทั่วไป)</option>
                            <option value="admin">Admin (ผู้ดูแลระบบ)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">กำหนดรหัสผ่าน *</label>
                        <input type="password" name="password" required placeholder="อย่างน้อย 8 ตัวอักษร"
                               class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                    </div>
                </div>

                <div class="pt-2 flex items-center justify-end gap-2">
                    <button type="button" @click="createModalOpen = false" class="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold">ยกเลิก</button>
                    <button type="submit" class="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-500/20">สร้างผู้ใช้งาน</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Edit User Modal -->
    <div x-cloak x-show="editModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div @click="editModalOpen = false" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
        <div class="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-base font-bold text-slate-800 dark:text-white" x-text="'แก้ไขบัญชี: ' + editUser.username"></h3>
                <button @click="editModalOpen = false" class="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <form :action="'/users/' + editUser.id" method="POST" class="space-y-4">
                @csrf
                @method('PUT')
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">สิทธิ์การใช้งาน (Role)</label>
                        <select name="role" x-model="editUser.role" class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                            <option value="user">User (ผู้ใช้ทั่วไป)</option>
                            <option value="admin">Admin (ผู้ดูแลระบบ)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">สถานะบัญชี (Status)</label>
                        <select name="status" x-model="editUser.status" class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                            <option value="active">เปิดใช้งาน (Active)</option>
                            <option value="pending">รอการอนุมัติ (Pending)</option>
                            <option value="suspended">ระงับการใช้งาน (Suspended)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">รีเซ็ตรหัสผ่านใหม่ (เว้นว่างหากไม่เปลี่ยน)</label>
                    <input type="password" name="password" placeholder="กรอกรหัสผ่านใหม่หากต้องการรีเซ็ต"
                           class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                </div>

                <div class="pt-2 flex items-center justify-end gap-2">
                    <button type="button" @click="editModalOpen = false" class="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold">ยกเลิก</button>
                    <button type="submit" class="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-500/20">บันทึกการแก้ไข</button>
                </div>
            </form>
        </div>
    </div>

</div>
@endsection

