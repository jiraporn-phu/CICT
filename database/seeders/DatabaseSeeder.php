<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Equipment;
use App\Models\CategoryGroup;
use App\Models\BorrowTransaction;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Admin User
        $admin = User::firstOrCreate(
            ['username' => 'admin'],
            [
                'fullName' => 'ผู้ดูแลระบบ (Admin ICTC)',
                'name' => 'Admin ICTC',
                'phone' => '0812345678',
                'department' => 'IT',
                'role' => 'admin',
                'status' => 'active',
                'password' => Hash::make('admin1234'),
            ]
        );

        // 2. Normal User
        $user = User::firstOrCreate(
            ['username' => 'user01'],
            [
                'fullName' => 'สมชาย รักงานดี',
                'name' => 'สมชาย รักงานดี',
                'phone' => '0898765432',
                'department' => 'PR',
                'role' => 'user',
                'status' => 'active',
                'password' => Hash::make('user1234'),
            ]
        );

        // 3. Category Groups
        $categories = [
            'IT' => ['คอมพิวเตอร์', 'จอภาพ', 'เครื่องพิมพ์', 'อุปกรณ์เครือข่าย', 'อุปกรณ์ต่อพ่วง', 'เซิร์ฟเวอร์', 'อุปกรณ์จัดเก็บข้อมูล'],
            'PR' => ['กล้องถ่ายภาพ', 'กล้องวิดีโอ', 'ไมโครโฟน', 'ไฟส่องสว่าง', 'ขาตั้งกล้อง', 'อุปกรณ์บันทึกเสียง', 'อุปกรณ์สตูดิโอ'],
        ];

        foreach ($categories as $dept => $catList) {
            foreach ($catList as $cat) {
                CategoryGroup::firstOrCreate([
                    'name' => $cat,
                    'department' => $dept,
                ]);
            }
        }

        // 4. Sample Equipment if empty
        if (Equipment::count() === 0) {
            // Find any available images in uploads
            $uploadFiles = glob(public_path('uploads/*.*'));
            $imageUrls = [];
            foreach ($uploadFiles as $file) {
                $imageUrls[] = '/uploads/' . basename($file);
            }

            $sampleItems = [
                [
                    'name' => 'Dell Latitude 5420 (Core i5 11th Gen / 16GB)',
                    'category' => 'คอมพิวเตอร์',
                    'department' => 'IT',
                    'description' => 'โน้ตบุ๊กสำหรับปฏิบัติงาน พร้อมกระเป๋าและที่ชาร์จ',
                    'quantity' => 5,
                    'initialQuantity' => 5,
                    'location' => 'ตู้เก็บโน้ตบุ๊ก ICTC ชั้น 2',
                    'imageUrl' => $imageUrls[0] ?? null,
                ],
                [
                    'name' => 'Lenovo ThinkPad E14 Gen 4',
                    'category' => 'คอมพิวเตอร์',
                    'department' => 'IT',
                    'description' => 'โน้ตบุ๊กประสิทธิภาพสูง สำหรับงานประมวลผล',
                    'quantity' => 3,
                    'initialQuantity' => 3,
                    'location' => 'ห้องปฏิบัติการคอมพิวเตอร์',
                    'imageUrl' => $imageUrls[1] ?? null,
                ],
                [
                    'name' => 'จอภาพ Dell UltraSharp 24" U2422H',
                    'category' => 'จอภาพ',
                    'department' => 'IT',
                    'description' => 'จอ IPS คมชัดสูง พอร์ต HDMI, DisplayPort, Type-C',
                    'quantity' => 8,
                    'initialQuantity' => 8,
                    'location' => 'ห้องเก็บพัสดุ IT',
                    'imageUrl' => $imageUrls[2] ?? null,
                ],
                [
                    'name' => 'Sony Alpha A7 IV Kit 28-70mm',
                    'category' => 'กล้องถ่ายภาพ',
                    'department' => 'PR',
                    'description' => 'กล้อง Full-frame สำหรับถ่ายภาพกิจกรรมและงานประชาสัมพันธ์',
                    'quantity' => 2,
                    'initialQuantity' => 2,
                    'location' => 'ตู้เก็บอุปกรณ์ PR ชั้น 1',
                    'imageUrl' => $imageUrls[3] ?? null,
                ],
                [
                    'name' => 'ไมโครโฟนไร้สาย DJI Mic 2 (2 TX + 1 RX)',
                    'category' => 'ไมโครโฟน',
                    'department' => 'PR',
                    'description' => 'ชุดไมค์ไวร์เลสพร้อมเคสชาร์จ สำหรับบันทึกเสียงสัมภาษณ์',
                    'quantity' => 4,
                    'initialQuantity' => 4,
                    'location' => 'กล่องกันชื้น ห้อง PR',
                    'imageUrl' => $imageUrls[4] ?? null,
                ],
                [
                    'name' => 'ขาตั้งกล้อง Manfrotto Befree Advanced',
                    'category' => 'ขาตั้งกล้อง',
                    'department' => 'PR',
                    'description' => 'ขาตั้งกล้องน้ำหนักเบา พกพาสะดวก พร้อมหัวบอล',
                    'quantity' => 4,
                    'initialQuantity' => 4,
                    'location' => 'ชั้นวางอุปกรณ์ PR',
                    'imageUrl' => $imageUrls[5] ?? null,
                ],
                [
                    'name' => 'เครื่องพิมพ์ HP LaserJet Pro M404dn',
                    'category' => 'เครื่องพิมพ์',
                    'department' => 'IT',
                    'description' => 'เครื่องพิมพ์เลเซอร์ขาวดำ รองรับพิมพ์สองหน้าและเชื่อมต่อ LAN',
                    'quantity' => 2,
                    'initialQuantity' => 2,
                    'location' => 'ศูนย์บริการงานพิมพ์ IT',
                    'imageUrl' => $imageUrls[6] ?? null,
                ],
            ];

            foreach ($sampleItems as $itemData) {
                $eq = Equipment::create($itemData);

                // Add a sample borrow transaction for demo
                if ($eq->name === 'Dell Latitude 5420 (Core i5 11th Gen / 16GB)') {
                    BorrowTransaction::create([
                        'equipment_id' => $eq->id,
                        'user_id' => $user->id,
                        'borrow_quantity' => 1,
                        'status' => 'borrowed',
                        'transaction_type' => 'BORROW',
                        'borrow_date' => Carbon::now()->subDays(2),
                        'due_date' => Carbon::now()->addDays(5),
                        'pickup_location' => $eq->location,
                        'contact_name' => $user->fullName,
                        'contact_phone' => $user->phone,
                        'note' => 'ยืมสำหรับการอบรมเชิงปฏิบัติการประจำสัปดาห์',
                    ]);
                }
            }
        }

        // 5. Seed Inventory Assets from Excel and Annual Audits
        $this->call(InventoryAssetSeeder::class);
    }
}

