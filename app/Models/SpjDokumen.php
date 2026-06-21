<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class SpjDokumen extends Model
{
    protected $fillable = [
        'spj_makan_minum_rapat_id',
        'jenis_dokumen_id',
        'file_path',
        'original_filename',
    ];

    protected $appends = [
        'url',
    ];

    public function spj(): BelongsTo
    {
        return $this->belongsTo(SpjMakanMinumRapat::class, 'spj_makan_minum_rapat_id');
    }

    public function jenisDokumen(): BelongsTo
    {
        return $this->belongsTo(JenisDokumen::class);
    }

    public function getUrlAttribute(): ?string
    {
        if (! $this->file_path) {
            return null;
        }

        return Storage::disk('public')->url($this->file_path);
    }
}
