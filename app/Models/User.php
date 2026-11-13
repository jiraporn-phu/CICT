<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'username',
        'name',
        'fullName',
        'phone',
        'department',
        'role',
        'status',
        'image',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return strtoupper($this->role ?? '') === 'ADMIN' || strtoupper($this->role ?? '') === 'SUPERADMIN';
    }

    public function borrows()
    {
        return $this->hasMany(BorrowTransaction::class, 'user_id');
    }

    public function wishlist()
    {
        return $this->hasMany(WishlistItem::class, 'user_id');
    }

    public function getDisplayNameAttribute()
    {
        return $this->fullName ?: ($this->name ?: $this->username);
    }

    public function getAvatarUrlAttribute()
    {
        if ($this->image) {
            return str_starts_with($this->image, 'http') ? $this->image : asset($this->image);
        }
        return 'https://ui-avatars.com/api/?name=' . urlencode($this->displayName) . '&background=0284c7&color=fff&bold=true';
    }
}

