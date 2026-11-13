<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function showLogin()
    {
        if (Auth::check()) {
            return redirect()->route('home');
        }
        return view('auth.login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ], [
            'username.required' => 'กรุณากรอกชื่อผู้ใช้งาน',
            'password.required' => 'กรุณากรอกรหัสผ่าน',
        ]);

        $user = User::where('username', $credentials['username'])->first();

        if (!$user) {
            return back()->withInput()->withErrors([
                'username' => 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง',
            ]);
        }

        if ($user->status === 'pending') {
            return back()->withInput()->withErrors([
                'username' => 'บัญชีของคุณอยู่ระหว่างรอการอนุมัติจากผู้ดูแลระบบ',
            ]);
        }

        if ($user->status === 'suspended' || $user->status === 'inactive') {
            return back()->withInput()->withErrors([
                'username' => 'บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ',
            ]);
        }

        $remember = $request->boolean('remember');

        if (Auth::attempt(['username' => $credentials['username'], 'password' => $credentials['password']], $remember)) {
            $request->session()->regenerate();
            return redirect()->intended(route('home'))->with('success', 'เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ' . $user->displayName);
        }

        return back()->withInput()->withErrors([
            'username' => 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง',
        ]);
    }

    public function showRegister()
    {
        if (Auth::check()) {
            return redirect()->route('home');
        }
        return view('auth.register');
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|min:4|max:50|alpha_num|unique:users,username',
            'password' => 'required|string|min:8|confirmed',
            'fullName' => 'required|string|max:100',
            'phone' => 'required|string|regex:/^0\d{9}$/',
            'department' => 'nullable|string|max:100',
        ], [
            'username.required' => 'กรุณากรอกชื่อผู้ใช้งาน',
            'username.min' => 'Username ต้องมีอย่างน้อย 4 ตัวอักษร',
            'username.alpha_num' => 'Username ต้องเป็นตัวอักษรภาษาอังกฤษหรือตัวเลขเท่านั้น',
            'username.unique' => 'Username นี้มีผู้ใช้งานแล้ว',
            'password.required' => 'กรุณากรอกรหัสผ่าน',
            'password.min' => 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
            'password.confirmed' => 'การยืนยันรหัสผ่านไม่ตรงกัน',
            'fullName.required' => 'กรุณากรอกชื่อ-นามสกุล',
            'phone.required' => 'กรุณากรอกเบอร์โทรศัพท์',
            'phone.regex' => 'เบอร์โทรต้องเป็นตัวเลข 10 หลักขึ้นต้นด้วย 0',
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'fullName' => $validated['fullName'],
            'name' => $validated['fullName'],
            'phone' => $validated['phone'],
            'department' => $validated['department'] ?: 'IT',
            'role' => 'user',
            'status' => 'pending',
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->route('login')->with('success', 'สมัครสมาชิกสำเร็จ! บัญชีของคุณอยู่ระหว่างรอการอนุมัติจากผู้ดูแลระบบ');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('login')->with('info', 'ออกจากระบบเรียบร้อยแล้ว');
    }

    public function profile()
    {
        $user = Auth::user();
        return view('profile.index', compact('user'));
    }

    public function updateProfile(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'fullName' => 'required|string|max:100',
            'phone' => 'nullable|string|regex:/^0\d{9}$/',
            'department' => 'nullable|string|max:100',
            'avatar' => 'nullable|image|max:3072',
            'current_password' => 'nullable|string|required_with:new_password',
            'new_password' => 'nullable|string|min:8|confirmed',
        ], [
            'fullName.required' => 'กรุณากรอกชื่อ-นามสกุล',
            'phone.regex' => 'เบอร์โทรต้องเป็นตัวเลข 10 หลักขึ้นต้นด้วย 0',
            'new_password.min' => 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร',
            'new_password.confirmed' => 'การยืนยันรหัสผ่านใหม่ไม่ตรงกัน',
            'current_password.required_with' => 'กรุณากรอกรหัสผ่านปัจจุบันหากต้องการเปลี่ยนรหัสผ่าน',
        ]);

        if (!empty($validated['current_password'])) {
            if (!Hash::check($validated['current_password'], $user->password)) {
                return back()->withErrors(['current_password' => 'รหัสผ่านปัจจุบันไม่ถูกต้อง']);
            }
            $user->password = Hash::make($validated['new_password']);
        }

        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $filename = time() . '-' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads'), $filename);
            $user->image = '/uploads/' . $filename;
        }

        $user->fullName = $validated['fullName'];
        $user->name = $validated['fullName'];
        $user->phone = $validated['phone'] ?? $user->phone;
        $user->department = $validated['department'] ?? $user->department;
        $user->save();

        return back()->with('success', 'บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว');
    }
}

