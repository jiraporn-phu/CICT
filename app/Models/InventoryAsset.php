<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryAsset extends Model
{
    use HasFactory;

    protected $table = 'inventory_assets';

    protected $fillable = [
        'item_no',
        'name',
        'asset_code',
        'category_code',
        'category_name',
        'department',
        'price',
        'acquired_date',
        'location',
        'responsible_person',
        'supervisor',
        'status',
        'image_url',
        'notes',
    ];

    public function auditRecords()
    {
        return $this->hasMany(AuditRecord::class, 'asset_id');
    }

    public function getDisplayImageAttribute()
    {
        if ($this->image_url) {
            return str_starts_with($this->image_url, 'http') ? $this->image_url : asset($this->image_url);
        }
        return asset('logo_ictc.png');
    }

    public function getFormattedPriceAttribute()
    {
        return number_format($this->price, 2) . ' บาท';
    }
}

