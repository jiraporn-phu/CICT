<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Equipment;
use App\Models\CategoryGroup;
use App\Models\BorrowTransaction;

class EquipmentController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $department = $request->input('department', 'all');
        $category = $request->input('category', 'all');

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

        $equipments = $query->with(['borrows' => function ($q) {
            $q->whereIn('status', ['borrowed', 'overdue']);
        }])->orderBy('created_at', 'desc')->paginate(15);

        $categories = CategoryGroup::all()->groupBy('department');

        return view('equipment.index', compact('equipments', 'search', 'department', 'category', 'categories'));
    }

    public function show($id)
    {
        $equipment = Equipment::with(['borrows.borrower' => function ($q) {
            $q->orderBy('created_at', 'desc');
        }])->findOrFail($id);

        $recentBorrows = $equipment->borrows()->with('borrower')->orderBy('created_at', 'desc')->take(10)->get();

        return view('equipment.show', compact('equipment', 'recentBorrows'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'department' => 'required|string|max:50',
            'category' => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
            'quantity' => 'required|integer|min:1',
            'location' => 'nullable|string|max:200',
            'image' => 'nullable|image|max:5120',
        ], [
            'name.required' => 'กรุณากรอกชื่ออุปกรณ์',
            'department.required' => 'กรุณาเลือกแผนก',
            'category.required' => 'กรุณาเลือกหมวดหมู่',
            'quantity.required' => 'กรุณาระบุจำนวน',
            'quantity.min' => 'จำนวนอุปกรณ์ต้องมีอย่างน้อย 1 ชิ้น',
        ]);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '-' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads'), $filename);
            $imageUrl = '/uploads/' . $filename;
        }

        Equipment::create([
            'name' => $validated['name'],
            'department' => $validated['department'],
            'category' => $validated['category'],
            'description' => $validated['description'],
            'quantity' => $validated['quantity'],
            'initialQuantity' => $validated['quantity'],
            'location' => $validated['location'],
            'imageUrl' => $imageUrl,
            'status' => 'available',
        ]);

        return redirect()->route('equipment.index')->with('success', 'เพิ่มอุปกรณ์สำเร็จเรียบร้อยแล้ว');
    }

    public function update(Request $request, $id)
    {
        $equipment = Equipment::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'department' => 'required|string|max:50',
            'category' => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
            'quantity' => 'required|integer|min:1',
            'location' => 'nullable|string|max:200',
            'status' => 'nullable|string|in:available,maintenance,retired',
            'image' => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '-' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads'), $filename);
            $equipment->imageUrl = '/uploads/' . $filename;
        }

        $equipment->name = $validated['name'];
        $equipment->department = $validated['department'];
        $equipment->category = $validated['category'];
        $equipment->description = $validated['description'];
        $equipment->quantity = $validated['quantity'];
        $equipment->location = $validated['location'];
        if (!empty($validated['status'])) {
            $equipment->status = $validated['status'];
        }
        $equipment->save();

        return back()->with('success', 'อัปเดตข้อมูลอุปกรณ์เรียบร้อยแล้ว');
    }

    public function destroy($id)
    {
        $equipment = Equipment::findOrFail($id);
        $equipment->delete();

        return redirect()->route('equipment.index')->with('success', 'ลบอุปกรณ์เรียบร้อยแล้ว');
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'department' => 'required|string|max:50',
        ]);

        CategoryGroup::firstOrCreate([
            'name' => trim($validated['name']),
            'department' => $validated['department'],
        ]);

        return back()->with('success', 'เพิ่มหมวดหมู่ใหม่สำเร็จ');
    }

    public function destroyCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'department' => 'required|string',
        ]);

        CategoryGroup::where('name', $validated['name'])
            ->where('department', $validated['department'])
            ->delete();

        // Update equipment with this category to 'อื่นๆ'
        Equipment::where('category', $validated['name'])
            ->where('department', $validated['department'])
            ->update(['category' => 'อื่นๆ']);

        return back()->with('success', 'ลบหมวดหมู่เรียบร้อยแล้ว');
    }
}

