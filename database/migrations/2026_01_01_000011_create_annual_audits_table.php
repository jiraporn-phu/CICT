<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('annual_audits', function (Blueprint $table) {
            $table->id();
            $table->string('fiscal_year')->unique(); // เช่น 2569, 2570
            $table->string('title'); // รอบการตรวจสอบ ตั้งแต่วันที่ 1 ตุลาคม...
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('status')->default('in_progress'); // in_progress, completed, closed
            $table->text('summary_notes')->nullable();
            $table->string('committee_chairman')->nullable(); // ประธานกรรมการตรวจนับ
            $table->string('committee_members')->nullable(); // กรรมการตรวจนับ
            $table->string('report_file')->nullable(); // ไฟล์รายงานสรุป
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('annual_audits');
    }
};

