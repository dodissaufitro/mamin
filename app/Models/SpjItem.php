<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpjItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'spj_makan_minum_rapat_id',
        'item_hps_id',
        'jumlah_order',
        'total_harga',
    ];

    protected function casts(): array
    {
        return [
            'jumlah_order' => 'decimal:2',
            'total_harga' => 'decimal:2',
        ];
    }

    public function spj(): BelongsTo
    {
        return $this->belongsTo(SpjMakanMinumRapat::class, 'spj_makan_minum_rapat_id');
    }

    public function itemHps(): BelongsTo
    {
        return $this->belongsTo(ItemHps::class, 'item_hps_id');
    }
}
