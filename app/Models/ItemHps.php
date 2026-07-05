<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ItemHps extends Model
{
    use HasFactory;

    protected $table = 'item_hps';

    protected $fillable = [
        'nama_item',
        'volume',
        'harga_unit',
        'kategori',
    ];

    protected function casts(): array
    {
        return [
            'volume' => 'decimal:2',
            'harga_unit' => 'decimal:2',
        ];
    }

    public function spjItems(): HasMany
    {
        return $this->hasMany(SpjItem::class, 'item_hps_id');
    }

    public function jenisDokumens(): BelongsToMany
    {
        return $this->belongsToMany(JenisDokumen::class, 'item_hps_jenis_dokumen');
    }
}
