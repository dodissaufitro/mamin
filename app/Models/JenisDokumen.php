<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class JenisDokumen extends Model
{
    protected $fillable = [
        'kode',
        'nama',
    ];

    public function itemHps(): BelongsToMany
    {
        return $this->belongsToMany(ItemHps::class, 'item_hps_jenis_dokumen');
    }

    public static function defaultKodesForItem(?string $namaItem): array
    {
        if ($namaItem && str_contains(strtolower($namaItem), 'galon')) {
            return ['nib', 'invoice', 'kwitansi', 'memo'];
        }

        return [
            'surat_undangan',
            'memo',
            'invoice',
            'kwitansi',
            'nib',
            'absen',
            'notulen',
            'dokumentasi',
        ];
    }
}
