<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status', 'all');
        $role = $request->input('role', 'all');

        $query = User::withCount('borrows')->orderBy('created_at', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                  ->orWhere('fullName', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('department', 'like', "%{$search}%");
            });
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($role && $role !== 'all') {
            $query->where('role', $role);
        }

        $users = $query->paginate(15);

        $pendingCount = User::where('status', 'pending')->count();
        $activeCount = User::where('status', 'active')->count();

        return view('users.index', compact('users', 'search', 'status', 'role', 'pendingCount', 'activeCount'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|min:4|max:50|alpha_num|unique:users,username',
            'fullName' => 'required|string|max:100',
            'phone' => 'nullable|string|regex:/^0\d{9}$/',
            'department' => 'nullable|string|max:100',
            'role' => 'required|in:user,admin',
            'password' => 'required|string|min:8',
        ], [
            'username.unique' => 'Username นี้ถูกใช้งานแล้ว',
            'password.min' => 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
        ]);

        User::create([
            'username' => $validated['username'],
            'fullName' => $validated['fullName'],
            'name' => $validated['fullName'],
            'phone' => $validated['phone'],
            'department' => $validated['department'] ?: 'IT',
            'role' => $validated['role'],
            'status' => 'active',
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'สร้างบัญชีผู้ใช้งานใหม่เรียบร้อยแล้ว');
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'role' => 'nullable|in:user,admin',
            'status' => 'nullable|in:active,pending,suspended',
            'password' => 'nullable|string|min:8',
        ]);

        if (!empty($validated['role'])) {
            $user->role = $validated['role'];
        }

        if (!empty($validated['status'])) {
            $user->status = $validated['status'];
        }

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return back()->with('success', "อัปเดตข้อมูลผู้ใช้ {$user->username} เรียบร้อยแล้ว");
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($user->id === auth()->id()) {
            return back()->with('error', 'ไม่สามารถลบบัญชีของตนเองที่กำลังเข้าสู่ระบบอยู่ได้');
        }

        $user->delete();

        return back()->with('success', 'ลบผู้ใช้งานเรียบร้อยแล้ว');
    }
}

