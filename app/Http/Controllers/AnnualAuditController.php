<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\AnnualAudit;
use App\Models\AuditRecord;
use App\Models\InventoryAsset;
use Carbon\Carbon;

class AnnualAuditController extends Controller
{
    /**
     * View Annual Audits & Inspection Dashboard
     */
    public function index(Request $request)
    {
        $allYears = AnnualAudit::orderBy('fiscal_year', 'desc')->get();

        $selectedYear = $request->input('year', $allYears->first()->fiscal_year ?? '2570');
        $audit = AnnualAudit::where('fiscal_year', $selectedYear)->first();

        if (!$audit && $allYears->isNotEmpty()) {
            $audit = $allYears->first();
            $selectedYear = $audit->fiscal_year;
        }

        $query = AuditRecord::with('asset')
            ->where('annual_audit_id', $audit->id ?? 0);

        // Search
        $search = $request->input('search');
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('asset', function ($aq) use ($search) {
                    $aq->where('name', 'like', "%{$search}%")
                       ->orWhere('asset_code', 'like', "%{$search}%")
                       ->orWhere('responsible_person', 'like', "%{$search}%")
                       ->orWhere('location', 'like', "%{$search}%");
                })->orWhere('verified_location', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        // Condition filter
        $condition = $request->input('condition', 'all');
        if ($condition === 'unverified') {
            $query->where('is_verified', false);
        } elseif ($condition === 'verified') {
            $query->where('is_verified', true);
        } elseif ($condition && $condition !== 'all') {
            $query->where('condition', $condition);
        }

        // Category filter
        $categoryCode = $request->input('category_code', 'all');
        if ($categoryCode && $categoryCode !== 'all') {
            $query->whereHas('asset', function ($aq) use ($categoryCode) {
                $aq->where('category_code', $categoryCode);
            });
        }

        // Location filter
        $location = $request->input('location', 'all');
        if ($location && $location !== 'all') {
            $query->where(function ($q) use ($location) {
                $q->where('verified_location', $location)
                  ->orWhereHas('asset', fn ($aq) => $aq->where('location', $location));
            });
        }

        $records = $query->paginate(20)->withQueryString();

        // Unique categories and locations for filters
        $categories = InventoryAsset::select('category_code', 'category_name')
            ->distinct()
            ->whereNotNull('category_code')
            ->orderBy('category_code')
            ->get();

        $locations = InventoryAsset::select('location')
            ->distinct()
            ->whereNotNull('location')
            ->where('location', '!=', '')
            ->orderBy('location')
            ->pluck('location');

        return view('annual-audits.index', compact(
            'allYears',
            'audit',
            'selectedYear',
            'records',
            'search',
            'condition',
            'categoryCode',
            'location',
            'categories',
            'locations'
        ));
    }

    /**
     * Create a new Annual Audit Cycle (e.g. 2571)
     */
    public function createYear(Request $request)
    {
        $validated = $request->validate([
            'fiscal_year' => 'required|string|unique:annual_audits,fiscal_year',
            'title' => 'required|string|max:255',
            'committee_chairman' => 'nullable|string|max:150',
            'committee_members' => 'nullable|string|max:255',
        ], [
            'fiscal_year.required' => 'กรุณาระบุปีงบประมาณ',
            'fiscal_year.unique' => 'ปีงบประมาณนี้มีในระบบแล้ว',
        ]);

        $audit = AnnualAudit::create([
            'fiscal_year' => $validated['fiscal_year'],
            'title' => $validated['title'],
            'committee_chairman' => $validated['committee_chairman'] ?: 'ผอ.กองยุทธศาสตร์และงบประมาณ',
            'committee_members' => $validated['committee_members'] ?: 'คณะกรรมการตรวจนับพัสดุ',
            'status' => 'in_progress',
            'start_date' => Carbon::now(),
            'end_date' => Carbon::now()->addYear(),
        ]);

        // Copy all inventory assets to audit records for this new year
        $assets = InventoryAsset::all();
        foreach ($assets as $asset) {
            AuditRecord::create([
                'annual_audit_id' => $audit->id,
                'asset_id' => $asset->id,
                'condition' => 'unverified',
                'verified_location' => $asset->location,
                'is_verified' => false,
            ]);
        }

        return redirect()->route('annual-audits.index', ['year' => $audit->fiscal_year])
            ->with('success', "เปิดรอบการตรวจสอบประจำปี {$audit->fiscal_year} สำเร็จ (นำเข้า {$assets->count()} รายการพัสดุเข้าสู่บัญชีตรวจนับ)");
    }

    /**
     * Verify an individual item (with Photo Capture & Location specification)
     */
    public function verifyItem(Request $request, $id)
    {
        $record = AuditRecord::with('asset')->findOrFail($id);

        $validated = $request->validate([
            'condition' => 'required|in:normal,damaged,deteriorated,lost',
            'verified_location' => 'required|string|max:255',
            'photo' => 'nullable|image|max:8192', // supports high-res camera photos
            'notes' => 'nullable|string|max:1000',
            'inspector_name' => 'nullable|string|max:100',
        ], [
            'condition.required' => 'กรุณาระบุผลสภาพพัสดุ',
            'verified_location.required' => 'กรุณาระบุสถานที่/ตำแหน่งที่ตรวจพบ',
        ]);

        $photoUrl = $record->photo_url;
        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = 'audit-' . $record->annual_audit_id . '-' . $record->asset_id . '-' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads'), $filename);
            $photoUrl = '/uploads/' . $filename;
        }

        $inspector = $validated['inspector_name'] ?: (Auth::user()?->displayName ?: 'เจ้าหน้าที่ผู้ตรวจ');

        $record->update([
            'condition' => $validated['condition'],
            'verified_location' => $validated['verified_location'],
            'photo_url' => $photoUrl,
            'is_verified' => true,
            'verified_at' => Carbon::now(),
            'verified_by' => $inspector,
            'notes' => $validated['notes'],
        ]);

        // Also update latest location & status on the master asset record
        $record->asset->update([
            'location' => $validated['verified_location'],
            'status' => $validated['condition'],
        ]);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => "บันทึกการตรวจสอบ {$record->asset->name} สำเร็จ",
                'record' => $record,
            ]);
        }

        return back()->with('success', "บันทึกการตรวจสอบ {$record->asset->name} เรียบร้อยแล้ว (ระบุตำแหน่ง: {$validated['verified_location']})");
    }

    /**
     * Batch verify items as normal
     */
    public function batchVerify(Request $request, $auditId)
    {
        $audit = AnnualAudit::findOrFail($auditId);
        $recordIds = $request->input('record_ids', []);

        if (empty($recordIds)) {
            return back()->with('error', 'กรุณาเลือกรายการที่ต้องการบันทึกการตรวจสอบ');
        }

        $inspector = Auth::user()?->displayName ?: 'เจ้าหน้าที่ผู้ตรวจ';
        $now = Carbon::now();

        AuditRecord::where('annual_audit_id', $audit->id)
            ->whereIn('id', $recordIds)
            ->update([
                'condition' => 'normal',
                'is_verified' => true,
                'verified_at' => $now,
                'verified_by' => $inspector,
            ]);

        return back()->with('success', "บันทึกการตรวจสอบเรียบร้อยแล้ว " . count($recordIds) . " รายการ");
    }

    /**
     * Official Government Annual Survey Report
     */
    public function report($auditId)
    {
        $audit = AnnualAudit::with(['records.asset'])->findOrFail($auditId);
        $records = $audit->records()->with('asset')->orderBy('id')->get();

        return view('annual-audits.report', compact('audit', 'records'));
    }

    /**
     * Export Annual Audit Data to CSV
     */
    public function exportCsv($auditId)
    {
        $audit = AnnualAudit::with(['records.asset'])->findOrFail($auditId);
        $records = $audit->records()->with('asset')->orderBy('id')->get();

        $filename = "audit_report_{$audit->fiscal_year}_" . date('Ymd_His') . ".csv";

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($audit, $records) {
            $output = fopen('php://output', 'w');
            fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF)); // UTF-8 BOM

            fputcsv($output, ['แบบรายงานการสำรวจพัสดุและทรัพย์สินองค์การบริหารส่วนจังหวัดนครสวรรค์']);
            fputcsv($output, ['ฝ่ายสถิติข้อมูลและสารสนเทศ']);
            fputcsv($output, ["รอบการตรวจสอบประจำปีงบประมาณ {$audit->fiscal_year}"]);
            fputcsv($output, []);
            fputcsv($output, [
                'ลำดับที่',
                'ชื่อพัสดุ ชนิด/รุ่น/ยี่ห้อ',
                'รหัสพัสดุ',
                'หมวดหมู่',
                'ราคา (บาท)',
                'สถานที่ใช้/เก็บรักษา',
                'ผู้รับผิดชอบการใช้/ดูแล',
                'ผลการตรวจสอบ',
                'สถานที่ตรวจพบจริง',
                'ผู้ตรวจ',
                'วันที่ตรวจ',
                'หมายเหตุ/สภาพความเสียหาย',
            ]);

            foreach ($records as $index => $rec) {
                fputcsv($output, [
                    $rec->asset->item_no ?? ($index + 1),
                    $rec->asset->name ?? '-',
                    $rec->asset->asset_code ?? '-',
                    $rec->asset->category_name ?? '-',
                    $rec->asset->price ?? 0,
                    $rec->asset->location ?? '-',
                    $rec->asset->responsible_person ?? '-',
                    $rec->condition_label,
                    $rec->verified_location ?? $rec->asset->location,
                    $rec->verified_by ?? '-',
                    $rec->verified_at ? $rec->verified_at->format('d/m/Y H:i') : '-',
                    $rec->notes ?? '-',
                ]);
            }

            fclose($output);
        };

        return response()->stream($callback, 200, $headers);
    }
}

