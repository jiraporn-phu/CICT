<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class BorrowTransaction extends Model
{
    use HasFactory;

    protected $table = 'borrow_transactions';

    protected $fillable = [
        'equipment_id',
        'user_id',
        'borrow_quantity',
        'status',
        'transaction_type',
        'borrow_date',
        'due_date',
        'return_date',
        'before_image_url',
        'after_image_url',
        'pickup_location',
        'return_location',
        'contact_name',
        'contact_phone',
        'note',
    ];

    protected $casts = [
        'borrow_date' => 'datetime',
        'due_date' => 'datetime',
        'return_date' => 'datetime',
        'borrow_quantity' => 'integer',
    ];

    public function equipment()
    {
        return $this->belongsTo(Equipment::class, 'equipment_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Alias for borrower
    public function borrower()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function getStatusLabelAttribute(): string
    {
        $labels = [
            'available' => 'มีในสต็อก',
            'borrowed' => 'กำลังยืม',
            'maintenance' => 'ซ่อมบำรุง',
            'retired' => 'ปลดระวาง',
            'overdue' => 'เกินกำหนดคืน',
            'returned' => 'คืนแล้ว',
            'pending' => 'รออนุมัติ',
            'approved' => 'อนุมัติแล้ว',
            'rejected' => 'ปฏิเสธ',
            'requisitioned' => 'เบิกอุปกรณ์แล้ว',
            'cancelled' => 'ยกเลิก',
        ];

        return $labels[$this->status] ?? $this->status;
    }

    public function getStatusBadgeClassAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
            'approved' => 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
            'borrowed' => 'bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
            'returned' => 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
            'overdue' => 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
            'rejected' => 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
            'requisitioned' => 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800',
            default => 'bg-slate-50 text-slate-600 border-slate-200',
        };
    }

    public function isOverdue(): bool
    {
        if (in_array($this->status, ['borrowed', 'overdue']) && $this->due_date) {
            return $this->due_date->isPast();
        }
        return false;
    }
}

