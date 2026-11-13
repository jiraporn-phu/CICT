<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\BorrowTransaction;
use App\Models\Equipment;
use Carbon\Carbon;

class BorrowController extends Controller
{
    /**
     * Admin: List all borrow/requisition transactions
     */
    public function index(Request $request)
    {
        $status = $request->input('status', 'all');
        $search = $request->input('search');

        $query = BorrowTransaction::with(['equipment', 'borrower'])
            ->orderBy('created_at', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('borrower', function ($bq) use ($search) {
                    $bq->where('fullName', 'like', "%{$search}%")
                       ->orWhere('username', 'like', "%{$search}%");
                })->orWhereHas('equipment', function ($eq) use ($search) {
                    $eq->where('name', 'like', "%{$search}%");
                })->orWhere('pickup_location', 'like', "%{$search}%");
            });
        }

        $now = Carbon::now();

        // Calculate counts for filter tabs
        $counts = [
            'all' => BorrowTransaction::count(),
            'pending' => BorrowTransaction::where('status', 'pending')->count(),
            'borrowed' => BorrowTransaction::where('status', 'borrowed')->count(),
            'returned' => BorrowTransaction::where('status', 'returned')->count(),
            'overdue' => BorrowTransaction::whereIn('status', ['borrowed', 'overdue'])
                ->where('due_date', '<', $now)->count(),
            'requisition' => BorrowTransaction::where('transaction_type', 'REQUISITION')
                ->orWhere('status', 'requisitioned')->count(),
        ];

        if ($status === 'overdue') {
            $query->whereIn('status', ['borrowed', 'overdue'])
                  ->where('due_date', '<', $now);
        } elseif ($status === 'requisition') {
            $query->where(function ($q) {
                $q->where('transaction_type', 'REQUISITION')
                  ->orWhere('status', 'requisitioned');
            });
        } elseif ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $transactions = $query->paginate(15);

        return view('borrow.index', compact('transactions', 'status', 'search', 'counts'));
    }

    /**
     * User: Show dedicated Borrow / Requisition Form
     */
    public function create(Request $request)
    {
        $selectedId = $request->query('equipment_id');
        $selectedEquipment = null;

        if ($selectedId) {
            $selectedEquipment = Equipment::find($selectedId);
        }

        // Get all available equipment for selection
        $equipments = Equipment::orderBy('name')->get()->filter(function ($item) {
            return $item->available_quantity > 0;
        });

        // If no equipment pre-selected, select the first available one if any
        if (!$selectedEquipment && $equipments->isNotEmpty()) {
            $selectedEquipment = $equipments->first();
        }

        return view('borrow.create', compact('selectedEquipment', 'equipments'));
    }

    /**
     * User or Admin: Create a new borrow/requisition request
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'equipment_id' => 'required|exists:equipment,id',
            'borrow_quantity' => 'required|integer|min:1',
            'due_date' => 'required|date',
            'pickup_location' => 'nullable|string|max:200',
            'contact_name' => 'nullable|string|max:100',
            'contact_phone' => 'nullable|string|max:20',
            'transaction_type' => 'required|in:BORROW,REQUISITION',
            'note' => 'nullable|string|max:500',
        ], [
            'equipment_id.required' => 'กรุณาเลือกอุปกรณ์ที่ต้องการยืม/เบิก',
            'borrow_quantity.min' => 'จำนวนต้องมีอย่างน้อย 1 ชิ้น',
            'due_date.required' => 'กรุณาระบุกำหนดวันส่งคืนหรือวันที่เบิกใช้งาน',
            'transaction_type.required' => 'กรุณาระบุประเภทคำขอ',
        ]);

        // Date sanity check (normalized to day boundary)
        if (Carbon::parse($request->due_date)->startOfDay()->lt(Carbon::today()->startOfDay())) {
            return back()->withErrors(['due_date' => 'กำหนดวันคืนต้องไม่เป็นวันที่พ้นมาแล้ว'])->withInput();
        }

        $equipment = Equipment::findOrFail($validated['equipment_id']);
        $qty = $validated['borrow_quantity'];

        if ($qty > $equipment->available_quantity) {
            return back()->with('error', "อุปกรณ์คงเหลือไม่พอสำหรับคำขอยืม (คงเหลือ {$equipment->available_quantity} ชิ้น)")->withInput();
        }

        $user = Auth::user();
        $isAdmin = $user->isAdmin();

        // Admin can auto-approve, or standard users start with 'pending'
        $status = $isAdmin ? 'approved' : 'pending';

        $tx = BorrowTransaction::create([
            'equipment_id' => $equipment->id,
            'user_id' => $user->id,
            'borrow_quantity' => $qty,
            'status' => $status,
            'transaction_type' => $validated['transaction_type'],
            'borrow_date' => Carbon::now(),
            'due_date' => Carbon::parse($validated['due_date']),
            'pickup_location' => $validated['pickup_location'] ?: ($equipment->location ?: 'ห้อง ICTC ชั้น 2'),
            'contact_name' => $validated['contact_name'] ?: $user->displayName,
            'contact_phone' => $validated['contact_phone'] ?: $user->phone,
            'note' => $validated['note'],
        ]);

        $typeLabel = $validated['transaction_type'] === 'REQUISITION' ? 'เบิก' : 'ยืม';
        return redirect()->route('borrow.success', $tx->id)->with('success', "ส่งคำขอ{$typeLabel}อุปกรณ์เรียบร้อยแล้ว");
    }

    /**
     * User: Show Borrow Result / Confirmation Page
     */
    public function success($id)
    {
        $transaction = BorrowTransaction::with(['equipment', 'borrower'])->findOrFail($id);

        // Security check: only borrower or admin can view
        $user = Auth::user();
        if ($transaction->user_id !== $user->id && !$user->isAdmin()) {
            abort(403, 'ไม่มีสิทธิ์เข้าถึงข้อมูลรายการนี้');
        }

        return view('borrow.success', compact('transaction'));
    }

    /**
     * Admin: Approve transaction
     */
    public function approve($id)
    {
        $transaction = BorrowTransaction::with('equipment')->findOrFail($id);

        if ($transaction->transaction_type === 'REQUISITION') {
            DB::transaction(function () use ($transaction) {
                // Permanently decrement stock
                $transaction->equipment->decrement('quantity', $transaction->borrow_quantity);
                $transaction->update([
                    'status' => 'requisitioned',
                ]);
            });
            return back()->with('success', 'อนุมัติการเบิกอุปกรณ์เรียบร้อยแล้ว (ตัดสต็อกถาวร)');
        }

        $transaction->update([
            'status' => 'borrowed',
        ]);

        return back()->with('success', 'อนุมัติการยืมอุปกรณ์เรียบร้อยแล้ว');
    }

    /**
     * Admin: Reject transaction
     */
    public function reject(Request $request, $id)
    {
        $transaction = BorrowTransaction::findOrFail($id);
        $transaction->update([
            'status' => 'rejected',
            'note' => $request->input('note', $transaction->note),
        ]);

        return back()->with('info', 'ปฏิเสธคำขอเรียบร้อยแล้ว');
    }

    /**
     * Admin: Mark transaction as returned
     */
    public function markReturned(Request $request, $id)
    {
        $transaction = BorrowTransaction::findOrFail($id);

        $afterImageUrl = $transaction->after_image_url;
        if ($request->hasFile('after_image')) {
            $file = $request->file('after_image');
            $filename = time() . '-' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads'), $filename);
            $afterImageUrl = '/uploads/' . $filename;
        }

        $transaction->update([
            'status' => 'returned',
            'return_date' => Carbon::now(),
            'return_location' => $request->input('return_location', $transaction->return_location),
            'after_image_url' => $afterImageUrl,
            'note' => $request->input('note', $transaction->note),
        ]);

        return back()->with('success', 'บันทึกการคืนอุปกรณ์เรียบร้อยแล้ว');
    }

    /**
     * Admin: Delete transaction
     */
    public function destroy($id)
    {
        $transaction = BorrowTransaction::findOrFail($id);
        $transaction->delete();

        return back()->with('success', 'ลบรายการเรียบร้อยแล้ว');
    }

    /**
     * Print slip / receipt
     */
    public function slip($id)
    {
        $transaction = BorrowTransaction::with(['equipment', 'borrower'])->findOrFail($id);
        return view('borrow.slip', compact('transaction'));
    }

    /**
     * User: View their own borrowing & requisition history
     */
    public function myRequests(Request $request)
    {
        $user = Auth::user();
        $tab = $request->input('tab', 'active');

        $query = BorrowTransaction::with('equipment')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        if ($tab === 'active') {
            $query->whereIn('status', ['pending', 'approved', 'borrowed', 'overdue']);
        } else {
            $query->whereIn('status', ['returned', 'rejected', 'requisitioned', 'cancelled']);
        }

        $transactions = $query->get();

        $activeCount = BorrowTransaction::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved', 'borrowed', 'overdue'])
            ->count();

        $historyCount = BorrowTransaction::where('user_id', $user->id)
            ->whereIn('status', ['returned', 'rejected', 'requisitioned', 'cancelled'])
            ->count();

        return view('borrow.my-requests', compact('transactions', 'tab', 'activeCount', 'historyCount'));
    }

    /**
     * User: Return equipment
     */
    public function submitReturn(Request $request, $id)
    {
        $user = Auth::user();
        $transaction = BorrowTransaction::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $afterImageUrl = null;
        if ($request->hasFile('after_image')) {
            $file = $request->file('after_image');
            $filename = time() . '-' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads'), $filename);
            $afterImageUrl = '/uploads/' . $filename;
        }

        $transaction->update([
            'status' => 'returned',
            'return_date' => Carbon::now(),
            'return_location' => $request->input('return_location', 'ห้อง ICTC'),
            'after_image_url' => $afterImageUrl,
            'note' => $request->input('note'),
        ]);

        return back()->with('success', 'แจ้งคืนอุปกรณ์เรียบร้อยแล้ว ขอบคุณที่ดูแลรักษาพัสดุ');
    }

    /**
     * User: Cancel pending request
     */
    public function cancelRequest($id)
    {
        $user = Auth::user();
        $transaction = BorrowTransaction::where('id', $id)
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $transaction->update([
            'status' => 'cancelled',
        ]);

        return back()->with('info', 'ยกเลิกคำขอเรียบร้อยแล้ว');
    }
}

