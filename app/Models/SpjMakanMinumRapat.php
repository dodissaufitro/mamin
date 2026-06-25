<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SpjMakanMinumRapat extends Model
{
    use HasFactory;

    protected $fillable = [
        'tanggal_pemesanan',
        'tanggal_kegiatan',
        'deadline_spj',
        'pic_id',
        'penyedia_id',
        'kegiatan',
        'jenis_mamin',
        'pembayaran_spj',
        'tracking_spj',
        'kasubbag_kasi',
        'staf',
        'link_spj',
        'kelengkapan_dokumen',
    ];

    protected $casts = [
        'tanggal_pemesanan' => 'date:Y-m-d',
        'tanggal_kegiatan' => 'date:Y-m-d',
        'deadline_spj' => 'date:Y-m-d',
        'pembayaran_spj' => 'boolean',
        'kelengkapan_dokumen' => 'boolean',
    ];

    public function pic(): BelongsTo
    {
        return $this->belongsTo(Pic::class, 'pic_id');
    }

    public function penyedia(): BelongsTo
    {
        return $this->belongsTo(Penyedia::class, 'penyedia_id');
    }

    public function spjItems(): HasMany
    {
        return $this->hasMany(SpjItem::class, 'spj_makan_minum_rapat_id');
    }

    public function spjDokumens(): HasMany
    {
        return $this->hasMany(SpjDokumen::class);
    }

    public function getTotalHargaAttribute()
    {
        return $this->spjItems->sum('total_harga');
    }
}
