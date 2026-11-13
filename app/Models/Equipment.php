<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Equipment extends Model
{
    use HasFactory;

    protected $table = 'equipment';

    protected $fillable = [
        'name',
        'category',
        'department',
        'description',
        'quantity',
        'initialQuantity',
        'status',
        'imageUrl',
        'location',
    ];

    protected $appends = [
        'available_quantity',
        'display_image',
        'active_borrows_count',
    ];

    public function borrows()
    {
        return $this->hasMany(BorrowTransaction::class, 'equipment_id');
    }

    public function wishlists()
    {
        return $this->hasMany(WishlistItem::class, 'equipment_id');
    }

    public function getActiveBorrowsCountAttribute()
    {
        return $this->borrows()
            ->whereIn('status', ['borrowed', 'overdue'])
            ->sum('borrow_quantity');
    }

    public function getAvailableQuantityAttribute()
    {
        $borrowed = $this->active_borrows_count;
        return max(0, $this->quantity - $borrowed);
    }

    public function getDisplayImageAttribute()
    {
        if ($this->imageUrl) {
            return str_starts_with($this->imageUrl, 'http') ? $this->imageUrl : asset($this->imageUrl);
        }
        return asset('logo_ictc.png');
    }
}

