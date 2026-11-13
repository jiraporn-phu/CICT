<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryAsset;
use App\Models\AnnualAudit;
use App\Models\AuditRecord;
use App\Models\Equipment;
use Carbon\Carbon;

class InventoryAssetSeeder extends Seeder
{
    public function run(): void
    {
        $csvFile = database_path('data/annual_survey_data.csv');
        if (!file_exists($csvFile)) {
            return;
        }

        $lines = file($csvFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        $categoryMap = [
            '400' => 'ครุภัณฑ์สำนักงาน (โต๊ะ)',
            '401' => 'ครุภัณฑ์สำนักงาน (เก้าอี้)',
            '406' => 'ครุภัณฑ์สำนักงาน (ตู้/ชั้นวาง)',
            '416' => 'ครุภัณฑ์คอมพิวเตอร์และเครือข่าย',
            '420' => 'ครุภัณฑ์เครื่องปรับอากาศ',
            '432' => 'พัดลม',
            '452' => 'ครุภัณฑ์โฆษณาและเผยแพร่ (กล้องถ่ายภาพ/วิดีโอ)',
            '454' => 'ครุภัณฑ์โฆษณาและเผยแพร่ (โดรน/กล้อง PTZ)',
            '456' => 'โทรทัศน์',
            '458' => 'ไมโครโฟน',
            '459' => 'ลำโพงไร้สาย',
            '460' => 'เครื่องบันทึกเสียงดิจิตอล',
            '462' => 'เครื่องขยายเสียงและระบบเสียง',
            '464' => 'วิทยุสื่อสาร',
            '482' => 'เครื่องตรวจสภาพอากาศ',
            '489' => 'เครื่องพิมพ์ (Printer)',
            '493' => 'เครื่องสำรองไฟฟ้า (UPS)',
            '514' => 'จอรับภาพโปรเจคเตอร์',
            '518' => 'โปรแกรมระบบปฏิบัติการ',
            '533' => 'ตู้จัดเก็บเซิร์ฟเวอร์ (Server Rack)',
            '541' => 'ระบบ Virtualization',
            '543' => 'อินเตอร์คอมไร้สาย',
        ];

        // Sample photos from uploads
        $uploadFiles = glob(public_path('uploads/*.*'));
        $samplePhotos = [];
        foreach ($uploadFiles as $f) {
            $samplePhotos[] = '/uploads/' . basename($f);
        }

        $currentCategoryCode = '400';
        $assets = [];

        foreach ($lines as $line) {
            $row = str_getcsv($line);
            if (count($row) < 3) continue;

            if (empty($row[0]) && !empty($row[1]) && is_numeric(str_replace('.0', '', trim($row[1])))) {
                $currentCategoryCode = str_replace('.0', '', trim($row[1]));
                continue;
            }

            if (is_numeric(str_replace('.0', '', trim($row[0])))) {
                $itemNo = (int)str_replace('.0', '', trim($row[0]));
                $name = trim($row[1]);
                $acquiredDate = trim($row[2]);
                $price = (float)str_replace(',', '', trim($row[3]));

                $c1 = !empty($row[4]) ? str_replace('.0', '', trim($row[4])) : $currentCategoryCode;
                $c2 = !empty($row[5]) ? str_replace('.0', '', trim($row[5])) : '';
                $c3 = !empty($row[6]) ? str_replace('.0', '', trim($row[6])) : '';
                $assetCode = trim("$c1-$c2-$c3", '-');

                if (empty($c1) || $c1 == '0') {
                    $c1 = $currentCategoryCode;
                }

                $location = !empty($row[7]) ? trim($row[7]) : 'ฝ่ายสถิติข้อมูลฯ';
                $responsible = !empty($row[8]) ? trim($row[8]) : 'นายชาตรี';
                $supervisor = !empty($row[9]) ? trim($row[9]) : 'ผอ.กองยุทธศาสตร์ฯ';
                $notes = !empty($row[11]) ? trim($row[11]) : (!empty($row[10]) ? trim($row[10]) : '');

                $categoryName = $categoryMap[$c1] ?? ($categoryMap[$currentCategoryCode] ?? 'ครุภัณฑ์ทั่วไป');

                $department = 'IT';
                if (str_contains($location, 'ปชส') || str_contains($location, 'ประชาสัมพันธ์') || str_contains($categoryName, 'โฆษณา')) {
                    $department = 'PR';
                }

                $status = 'normal';
                if (str_contains($notes, 'ชำรุด') || str_contains($notes, 'พัง') || str_contains($notes, 'ส่งเคลม')) {
                    $status = 'damaged';
                } elseif (str_contains($notes, 'เสื่อมสภาพ')) {
                    $status = 'deteriorated';
                } elseif (str_contains($notes, 'สูญหาย') || str_contains($notes, 'ยังหาไม่เจอ')) {
                    $status = 'lost';
                }

                // Random sample photo if available
                $img = !empty($samplePhotos) ? $samplePhotos[($itemNo + (int)$c1) % count($samplePhotos)] : null;

                $asset = InventoryAsset::create([
                    'item_no' => $itemNo,
                    'name' => $name,
                    'asset_code' => $assetCode,
                    'category_code' => $c1,
                    'category_name' => $categoryName,
                    'department' => $department,
                    'price' => $price,
                    'acquired_date' => $acquiredDate,
                    'location' => $location,
                    'responsible_person' => $responsible,
                    'supervisor' => $supervisor,
                    'status' => $status,
                    'notes' => $notes,
                    'image_url' => $img,
                ]);

                $assets[] = $asset;
            }
        }

        // 1. Create Annual Audit for Fiscal Year 2570 (Current In-Progress Year)
        $audit2570 = AnnualAudit::firstOrCreate(
            ['fiscal_year' => '2570'],
            [
                'title' => 'รอบการตรวจสอบพัสดุและทรัพย์สิน ประจำปีงบประมาณ 2570',
                'start_date' => '2026-10-01',
                'end_date' => '2027-09-30',
                'status' => 'in_progress',
                'committee_chairman' => 'ผอ.กองยุทธศาสตร์และงบประมาณ',
                'committee_members' => 'นายชาตรี (ประธาน), นายรวิภณ (กรรมการ), น.ส.ฐิติมา (กรรมการและเลขานุการ)',
                'summary_notes' => 'อยู่ระหว่างการสำรวจและตรวจนับพัสดุครุภัณฑ์ประจำปี 2570 ของฝ่ายสถิติข้อมูลและสารสนเทศ',
            ]
        );

        // 2. Create Annual Audit for Fiscal Year 2569 (Completed Year with Photos)
        $audit2569 = AnnualAudit::firstOrCreate(
            ['fiscal_year' => '2569'],
            [
                'title' => 'รอบการตรวจสอบพัสดุและทรัพย์สิน ประจำปีงบประมาณ 2569 (ตรวจสอบครบถ้วน)',
                'start_date' => '2025-10-01',
                'end_date' => '2026-09-30',
                'status' => 'completed',
                'committee_chairman' => 'ผอ.กองยุทธศาสตร์และงบประมาณ',
                'committee_members' => 'นายชาตรี (ประธาน), นายรวิภณ (กรรมการ), น.ส.ฐิติมา (กรรมการและเลขานุการ)',
                'summary_notes' => 'การสำรวจตรวจนับพัสดุประจำปีงบประมาณ 2569 ดำเนินการตรวจสอบครบถ้วน 100% พร้อมบันทึกภาพถ่ายสภาพครุภัณฑ์ทุกรายการ',
            ]
        );

        // Populate Audit Records for 2570 and 2569
        foreach ($assets as $idx => $asset) {
            // For 2570: Partially verified so officer can test checking it live
            $isVerified2570 = ($idx % 3 === 0);
            $cond2570 = $isVerified2570 ? $asset->status : 'unverified';

            AuditRecord::firstOrCreate(
                [
                    'annual_audit_id' => $audit2570->id,
                    'asset_id' => $asset->id,
                ],
                [
                    'condition' => $cond2570,
                    'verified_location' => $asset->location,
                    'photo_url' => $isVerified2570 ? $asset->image_url : null,
                    'is_verified' => $isVerified2570,
                    'verified_at' => $isVerified2570 ? Carbon::now()->subDays(rand(1, 15)) : null,
                    'verified_by' => $isVerified2570 ? 'นายชาตรี (ผู้ตรวจ)' : null,
                    'notes' => $asset->notes,
                ]
            );

            // For 2569: 100% Verified with full photos
            AuditRecord::firstOrCreate(
                [
                    'annual_audit_id' => $audit2569->id,
                    'asset_id' => $asset->id,
                ],
                [
                    'condition' => $asset->status === 'damaged' ? 'damaged' : ($asset->status === 'deteriorated' ? 'deteriorated' : 'normal'),
                    'verified_location' => $asset->location,
                    'photo_url' => $asset->image_url,
                    'is_verified' => true,
                    'verified_at' => Carbon::parse('2026-09-20')->subDays(rand(1, 30)),
                    'verified_by' => 'คณะกรรมการตรวจสอบพัสดุประจำปี 2569',
                    'notes' => $asset->notes ?: 'ตรวจสอบเรียบร้อย ครบถ้วนตามบัญชี',
                ]
            );
        }
    }
}

