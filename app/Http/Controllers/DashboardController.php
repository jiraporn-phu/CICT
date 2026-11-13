<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Equipment;
use App\Models\BorrowTransaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $filterType = $request->input('filter_type', 'all');
        $selectedDate = $request->input('date');
        $selectedMonth = $request->input('month');
        $selectedYear = $request->input('year');

        $now = Carbon::now();

        // Base summaries
        $totalEquipment = Equipment::count();
        $totalPhysicalUnits = Equipment::sum('quantity');

        $borrowedUnits = BorrowTransaction::whereIn('status', ['borrowed', 'overdue'])->sum('borrow_quantity');
        $availableUnits = max(0, $totalPhysicalUnits - $borrowedUnits);

        $pendingCount = BorrowTransaction::where('status', 'pending')->count();
        $overdueCount = BorrowTransaction::whereIn('status', ['borrowed', 'overdue'])
            ->where('due_date', '<', $now)
            ->count();

        // Recent transactions
        $recentTransactions = BorrowTransaction::with(['equipment', 'borrower'])
            ->orderBy('created_at', 'desc')
            ->take(8)
            ->get();

        // Top borrowed equipment
        $topEquipment = Equipment::withCount('borrows')
            ->orderBy('borrows_count', 'desc')
            ->take(5)
            ->get();

        // Category breakdown for charts
        $categoryBreakdown = Equipment::select('category', DB::raw('count(*) as count'), DB::raw('sum(quantity) as total_qty'))
            ->groupBy('category')
            ->get();

        // Status breakdown
        $statusBreakdown = [
            'available' => $availableUnits,
            'borrowed' => $borrowedUnits,
            'pending' => $pendingCount,
            'overdue' => $overdueCount,
        ];

        return view('dashboard.index', compact(
            'totalEquipment',
            'totalPhysicalUnits',
            'borrowedUnits',
            'availableUnits',
            'pendingCount',
            'overdueCount',
            'recentTransactions',
            'topEquipment',
            'categoryBreakdown',
            'statusBreakdown',
            'filterType',
            'selectedDate',
            'selectedMonth',
            'selectedYear'
        ));
    }

    public function report(Request $request)
    {
        $equipments = Equipment::with(['borrows' => function ($q) {
            $q->whereIn('status', ['borrowed', 'overdue']);
        }])->orderBy('category')->get();

        $activeBorrows = BorrowTransaction::with(['equipment', 'borrower'])
            ->whereIn('status', ['borrowed', 'overdue'])
            ->orderBy('due_date')
            ->get();

        $allTransactions = BorrowTransaction::with(['equipment', 'borrower'])
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get();

        return view('dashboard.report', compact('equipments', 'activeBorrows', 'allTransactions'));
    }
}

