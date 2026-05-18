<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        'surat_undangan',
        'memo',
        'invoice',
        'kwitansi',
        'nib',
        'absen',
        'notulen',
        'dokumentasi',
        'kelengkapan_dokumen',
        'pembayaran_spj',
        'kasubbag_kasi',
        'staf',
        'link_spj',
    ];

    protected $casts = [
        'tanggal_pemesanan' => 'date',
        'tanggal_kegiatan' => 'date',
        'deadline_spj' => 'date',
        'surat_undangan' => 'boolean',
        'memo' => 'boolean',
        'invoice' => 'boolean',
        'kwitansi' => 'boolean',
        'nib' => 'boolean',
        'absen' => 'boolean',
        'notulen' => 'boolean',
        'dokumentasi' => 'boolean',
        'kelengkapan_dokumen' => 'boolean',
        'pembayaran_spj' => 'boolean',
        'total_harga' => 'decimal:2',
    ];

    public function pic()
    {
        return $this->belongsTo(Pic::class, 'pic_id');
    }

    public function penyedia()
    {
        return $this->belongsTo(Penyedia::class, 'penyedia_id');
    }

    public function itemHps()
    {
        return $this->belongsTo(ItemHps::class, 'item_hps_id');
    }
}