# ICTC-Asset — ระบบบริหารจัดการยืม-คืนอุปกรณ์ IT (Laravel Edition)

ระบบบริหารจัดการครุภัณฑ์และพัสดุดิจิทัล พัฒนาด้วย **Laravel Framework** ตามสถาปัตยกรรม MVC มาตรฐาน พร้อมใช้งานทันที

---

## 🚀 วิธีการเปิดใช้งาน (Getting Started)

### 1. ความต้องการของระบบ (Prerequisites)
- **PHP** >= 8.2 (เปิดใช้งานส่วนขยาย `pdo_mysql`, `mbstring`, `fileinfo`, `openssl`, `curl`)
- **Composer** >= 2.0
- **MySQL** หรือ **MariaDB** (เช่น XAMPP)

### 2. ติดตั้งและตั้งค่า (Installation & Setup)
ฐานข้อมูลและตารางข้อมูลตัวอย่างถูกจัดเตรียมไว้เรียบร้อยแล้ว:
- ฐานข้อมูล: `ictc_asset`
- ผู้ใช้ MySQL: `root` (รหัสผ่านว่าง)

หากต้องการรีเซ็ตฐานข้อมูลหรือ Seeder ข้อมูลใหม่เมื่อใดก็ตาม:
```bash
php artisan migrate:fresh --seed
```

### 3. รันโปรเจกต์ (Run Server)
```bash
php artisan serve
```
จากนั้นเปิดเบราว์เซอร์เข้าที่: **[http://localhost:8000](http://localhost:8000)**

---

## 🔑 บัญชีเข้าสู่ระบบเริ่มต้น (Default Accounts)

ระบบมาพร้อมกับบัญชีเริ่มต้นสำหรับทดสอบการใช้งานทันที (หรือสามารถคลิกที่ปุ่มในหน้า Login เพื่อกรอกอัตโนมัติ):

| สิทธิ์ (Role) | ชื่อผู้ใช้งาน (Username) | รหัสผ่าน (Password) | คำอธิบาย |
|---|---|---|---|
| **ผู้ดูแลระบบ (Admin)** | `admin` | `admin1234` | มีสิทธิ์เต็ม: แดชบอร์ด, อนุมัติยืม/เบิก, จัดการอุปกรณ์, จัดการผู้ใช้ |
| **ผู้ใช้ทั่วไป (User)** | `user01` | `user1234` | สิทธิ์พนักงาน: ค้นหาอุปกรณ์, ยืม/เบิก, แจ้งคืน, ดูประวัติของตนเอง |

---

## 📁 โครงสร้างโปรเจกต์ตามมาตรฐาน Laravel (Architecture)

โปรเจกต์นี้ได้รับการแปลงและจัดระเบียบตามโครงสร้าง **Laravel MVC** เพื่อให้ง่ายต่อการแก้ไขและต่อยอดในอนาคต:

```
myproject/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php       # เข้าสู่ระบบ, สมัครสมาชิก, โปรไฟล์, เปลี่ยนรหัสผ่าน
│   │   │   ├── HomeController.php       # หน้าแรก, ค้นหา, กรองแผนก/หมวดหมู่, Wishlist
│   │   │   ├── EquipmentController.php  # จัดการอุปกรณ์, เพิ่ม/แก้ไข/ลบ, จัดการหมวดหมู่
│   │   │   ├── BorrowController.php     # อนุมัติคำขอยืม/เบิก, บันทึกคืน, พิมพ์ใบยืม
│   │   │   ├── DashboardController.php  # สถิติภาพรวม, กราฟ, พิมพ์รายงานสรุป
│   │   │   └── UserController.php       # จัดการผู้ใช้งาน, อนุมัติสมาชิก, เปลี่ยนสิทธิ์
│   │   └── Middleware/
│   │       └── AdminMiddleware.php      # ป้องกันการเข้าถึงหน้าจัดการเฉพาะ Admin
│   ├── Models/
│   │   ├── User.php                     # โมเดลผู้ใช้งาน (รองรับ role และ status)
│   │   ├── Equipment.php                # โมเดลครุภัณฑ์อุปกรณ์ คำนวณคงเหลืออัตโนมัติ
│   │   ├── BorrowTransaction.php        # โมเดลธุรกรรมยืม/เบิกอุปกรณ์
│   │   ├── WishlistItem.php             # โมเดลบันทึกรายการที่สนใจ
│   │   └── CategoryGroup.php            # โมเดลกลุ่มหมวดหมู่แยกตามแผนก
│   └── Providers/
├── config/                              # ค่าการตั้งค่าต่างๆ ของระบบ
├── database/
│   ├── migrations/                      # สคริปต์โครงสร้างตารางฐานข้อมูล
│   └── seeders/
│       └── DatabaseSeeder.php           # ข้อมูลเริ่มต้น (Admin, User, หมวดหมู่, อุปกรณ์ตัวอย่าง)
├── public/
│   ├── logo_ictc.png                    # โลโก้ ICTC
│   ├── uploads/                         # โฟลเดอร์เก็บรูปภาพอุปกรณ์และรูปโปรไฟล์
│   └── index.php                        # Entry point ของระบบ
├── resources/
│   └── views/                           # หน้าจอ Blade Templates ทั้งหมด
│       ├── layouts/
│       │   ├── app.blade.php            # เลย์เอาต์หลักพร้อม Sidebar, Topbar, Dark Mode
│       │   └── guest.blade.php          # เลย์เอาต์หน้า Login/Register
│       ├── auth/
│       │   ├── login.blade.php          # หน้าเข้าสู่ระบบ
│       │   └── register.blade.php       # หน้าสมัครสมาชิก
│       ├── home.blade.php               # หน้าหลัก ค้นหาและทำรายการยืม-เบิก
│       ├── equipment/
│       │   ├── index.blade.php          # หน้าจัดการอุปกรณ์ (Admin)
│       │   └── show.blade.php           # หน้ารายละเอียดอุปกรณ์
│       ├── borrow/
│       │   ├── index.blade.php          # หน้าตรวจสอบสถานะยืม-เบิก (Admin)
│       │   ├── my-requests.blade.php    # หน้ารายการของฉัน และแจ้งคืน (User)
│       │   └── slip.blade.php           # แบบฟอร์มใบยืม-คืนอุปกรณ์ (พิมพ์/PDF)
│       ├── dashboard/
│       │   ├── index.blade.php          # หน้าแดชบอร์ดสถิติและกราฟ
│       │   └── report.blade.php         # รายงานสรุปครุภัณฑ์ทางการ
│       ├── users/
│       │   └── index.blade.php          # หน้าจัดการผู้ใช้งาน (Admin)
│       └── profile/
│           └── index.blade.php          # หน้าแก้ไขข้อมูลส่วนตัว
├── routes/
│   └── web.php                          # กำหนดเส้นทาง URL ทั้งหมดของระบบ
├── storage/                             # บันทึกไฟล์แคชและล็อก
├── .env                                 # การตั้งค่า Environment และการเชื่อมต่อฐานข้อมูล
└── _nextjs_backup/                      # โฟลเดอร์สำรองข้อมูลไฟล์ Next.js เดิม (เก็บไว้เพื่อความปลอดภัย)
```

---

## 🛠️ จุดสำคัญในการแก้ไขและพัฒนาต่อในภายหลัง (Customization Guide)

1. **การเพิ่ม/แก้ Route และฟังก์ชัน URL**:
   - ไปที่ [`routes/web.php`](file:///d:/laravel_project/myproject/routes/web.php)
2. **การปรับแต่ง Controller & Business Logic**:
   - อยู่ในโฟลเดอร์ [`app/Http/Controllers/`](file:///d:/laravel_project/myproject/app/Http/Controllers/)
3. **การแก้ไข UI / หน้าตาเว็บไซต์**:
   - หน้าตาเขียนด้วย Blade Template + Tailwind CSS + Alpine.js อยู่ใน [`resources/views/`](file:///d:/laravel_project/myproject/resources/views/)
4. **การปรับโครงสร้างตารางข้อมูล**:
   - สามารถสร้างหรือแก้ไฟล์ Migration ใน [`database/migrations/`](file:///d:/laravel_project/myproject/database/migrations/) แล้วสั่ง `php artisan migrate`
