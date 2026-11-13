<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnualAudit extends Model
{
    use HasFactory;

    protected $table = 'annual_audits';

    protected $fillable = [
        'fiscal_year',
        'title',
        'start_date',
        'end_date',
        'status',
        'summary_notes',
        'committee_chairman',
        'committee_members',
        'report_file',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function records()
    {
        return $this->hasMany(AuditRecord::class, 'annual_audit_id');
    }

    public function getTotalAssetsAttribute()
    {
        return $this->records()->count();
    }

    public function getVerifiedCountAttribute()
    {
        return $this->records()->where('is_verified', true)->count();
    }

    public function getUnverifiedCountAttribute()
    {
        return $this->records()->where('is_verified', false)->count();
    }

    public function getNormalCountAttribute()
    {
        return $this->records()->where('condition', 'normal')->count();
    }

    public function getDamagedCountAttribute()
    {
        return $this->records()->where('condition', 'damaged')->count();
    }

    public function getDeterioratedCountAttribute()
    {
        return $this->records()->where('condition', 'deteriorated')->count();
    }

    public function getLostCountAttribute()
    {
        return $this->records()->where('condition', 'lost')->count();
    }

    public function getProgressPercentageAttribute()
    {
        $total = $this->total_assets;
        if ($total === 0) return 0;
        return round(($this->verified_count / $total) * 100, 1);
    }

    public function getProgressPercentAttribute()
    {
        return $this->progress_percentage;
    }
}

