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
        'item_hps_id',
        'jumlah_order',
        'total_harga',
        'pembayaran_spj',
        'tracking_spj',
        'kasubbag_kasi',
        'staf',
        'link_spj',
        'kelengkapan_dokumen',
    ];

    protected $casts = [
        'tanggal_pemesanan' => 'date',
        'tanggal_kegiatan' => 'date',
        'deadline_spj' => 'date',
        'pembayaran_spj' => 'boolean',
        'kelengkapan_dokumen' => 'boolean',
        'total_harga' => 'decimal:2',
    ];

    public function pic(): BelongsTo
    {
        return $this->belongsTo(Pic::class, 'pic_id');
    }

    public function penyedia(): BelongsTo
    {
        return $this->belongsTo(Penyedia::class, 'penyedia_id');
    }

    public function itemHps(): BelongsTo
    {
        return $this->belongsTo(ItemHps::class, 'item_hps_id');
    }

    public function spjDokumens(): HasMany
    {
        return $this->hasMany(SpjDokumen::class);
    }
}
