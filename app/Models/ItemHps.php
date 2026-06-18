<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class ItemHps extends Model
{
    use HasFactory;
    protected $table = 'item_hps';

    protected $fillable = [
        'nama_item',
        'volume',
        'harga_unit',
    ];

    protected function casts(): array
    {
        return [
            'volume' => 'decimal:2',
            'harga_unit' => 'decimal:2',
        ];
    }

    public function spjList()
    {
        return $this->hasMany(SpjMakanMinumRapat::class, 'item_hps_id');
    }
}
