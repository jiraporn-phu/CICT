<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('annual_audit_id')->constrained('annual_audits')->onDelete('cascade');
            $table->foreignId('asset_id')->constrained('inventory_assets')->onDelete('cascade');
            
            // Result of inspection
            $table->string('condition')->default('unverified'); // unverified, normal, damaged, deteriorated, lost
            $table->string('verified_location')->nullable(); // ตำแหน่งที่ตรวจพบจริง
            $table->string('photo_url')->nullable(); // รูปถ่ายยืนยันการตรวจสอบ (ถ่ายจากกล้องมือถือ/แท็บเล็ต/อัปโหลด)
            $table->boolean('is_verified')->default(false); // ตรวจสอบแล้วหรือไม่
            $table->timestamp('verified_at')->nullable();
            $table->string('verified_by')->nullable(); // ผู้ตรวจสอบ
            $table->text('notes')->nullable(); // บันทึกสภาพความเสียหาย / เหตุผล
            $table->timestamps();

            $table->unique(['annual_audit_id', 'asset_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_records');
    }
};

