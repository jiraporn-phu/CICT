<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('borrow_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained('equipment')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->integer('borrow_quantity')->default(1);
            $table->string('status')->default('pending'); // pending, approved, borrowed, returned, overdue, rejected, requisitioned
            $table->string('transaction_type')->default('BORROW'); // BORROW, REQUISITION
            $table->timestamp('borrow_date')->useCurrent();
            $table->timestamp('due_date')->nullable();
            $table->timestamp('return_date')->nullable();
            $table->string('before_image_url')->nullable();
            $table->string('after_image_url')->nullable();
            $table->string('pickup_location')->nullable();
            $table->string('return_location')->nullable();
            $table->string('contact_name')->nullable();
            $table->string('contact_phone')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('borrow_transactions');
    }
};

