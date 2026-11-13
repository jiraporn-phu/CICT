<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_assets', function (Blueprint $table) {
            $table->id();
            $table->string('item_no')->nullable(); // ลำดับที่
            $table->string('name'); // ชื่อพัสดุ ชนิด/รุ่น/ยี่ห้อ
            $table->string('asset_code')->nullable()->index(); // รหัสพัสดุ เช่น 416-64-1710
            $table->string('category_code')->nullable(); // 400, 401, 416, etc.
            $table->string('category_name')->nullable(); // หมวดหมู่
            $table->string('department')->default('IT'); // แผนก / สังกัด
            $table->decimal('price', 15, 2)->default(0); // ราคา
            $table->string('acquired_date')->nullable(); // วันที่ได้มา
            $table->string('location')->nullable(); // สถานที่ใช้ / เก็บรักษา
            $table->string('responsible_person')->nullable(); // ผู้รับผิดชอบการใช้/ดูแล
            $table->string('supervisor')->nullable(); // ผู้ควบคุม
            $table->string('status')->default('normal'); // normal, damaged, deteriorated, lost
            $table->string('image_url')->nullable(); // รูปภาพพัสดุ
            $table->text('notes')->nullable(); // หมายเหตุ
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_assets');
    }
};

