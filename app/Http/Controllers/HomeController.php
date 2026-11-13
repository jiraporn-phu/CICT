<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Equipment;
use App\Models\CategoryGroup;
use App\Models\WishlistItem;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $department = $request->input('department', 'all');
        $category = $request->input('category', 'all');
        $status = $request->input('status', 'all');

        $query = Equipment::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if ($department && $department !== 'all') {
            $query->where('department', $department);
        }

        if ($category && $category !== 'all') {
            $query->where('category', $category);
        }

        $items = $query->with(['borrows' => function ($q) {
            $q->whereIn('status', ['borrowed', 'overdue']);
        }])->orderBy('created_at', 'desc')->get();

        // Apply status filter in collection if needed
        if ($status === 'available') {
            $items = $items->filter(fn ($item) => $item->available_quantity > 0);
        } elseif ($status === 'borrowed') {
            $items = $items->filter(fn ($item) => $item->available_quantity <= 0);
        }

        // Load all category groups categorized by department
        $allCategories = CategoryGroup::all()->groupBy('department');

        // User's wishlisted equipment IDs
        $wishlistEquipmentIds = [];
        if (Auth::check()) {
            $wishlistEquipmentIds = WishlistItem::where('user_id', Auth::id())
                ->pluck('equipment_id')
                ->toArray();
        }

        return view('home', compact(
            'items',
            'search',
            'department',
            'category',
            'status',
            'allCategories',
            'wishlistEquipmentIds'
        ));
    }

    public function toggleWishlist(Request $request, $equipmentId)
    {
        if (!Auth::check()) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'กรุณาเข้าสู่ระบบ'], 401);
            }
            return redirect()->route('login')->with('info', 'กรุณาเข้าสู่ระบบเพื่อใช้งานรายการที่สนใจ');
        }

        $userId = Auth::id();
        $existing = WishlistItem::where('user_id', $userId)
            ->where('equipment_id', $equipmentId)
            ->first();

        if ($existing) {
            $existing->delete();
            $inWishlist = false;
            $message = 'นำออกจากรายการที่สนใจแล้ว';
        } else {
            WishlistItem::create([
                'user_id' => $userId,
                'equipment_id' => $equipmentId,
            ]);
            $inWishlist = true;
            $message = 'เพิ่มในรายการที่สนใจแล้ว';
        }

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'inWishlist' => $inWishlist,
                'message' => $message,
            ]);
        }

        return back()->with('success', $message);
    }
}

