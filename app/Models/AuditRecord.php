<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditRecord extends Model
{
    use HasFactory;

    protected $table = 'audit_records';

    protected $fillable = [
        'annual_audit_id',
        'asset_id',
        'condition',
        'verified_location',
        'photo_url',
        'is_verified',
        'verified_at',
        'verified_by',
        'notes',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
    ];

    public function annualAudit()
    {
        return $this->belongsTo(AnnualAudit::class, 'annual_audit_id');
    }

    public function asset()
    {
        return $this->belongsTo(InventoryAsset::class, 'asset_id');
    }

    public function getConditionLabelAttribute(): string
    {
        return match ($this->condition) {
            'normal' => '1. ปกติ',
            'damaged' => '2. ชำรุด',
            'deteriorated' => '3. เสื่อมสภาพ',
            'lost' => '4. สูญหาย',
            default => 'ยังไม่ได้ตรวจสอบ',
        };
    }

    public function getConditionBadgeClassAttribute(): string
    {
        return match ($this->condition) {
            'normal' => 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
            'damaged' => 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
            'deteriorated' => 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800',
            'lost' => 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
            default => 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
        };
    }

    public function getDisplayPhotoAttribute()
    {
        if ($this->photo_url) {
            return str_starts_with($this->photo_url, 'http') ? $this->photo_url : asset($this->photo_url);
        }
        return $this->asset?->display_image ?? asset('logo_ictc.png');
    }
}

