<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Penyedia extends Model
{
    use HasFactory;
    protected $fillable = ['nama', 'alamat', 'telepon'];

    public function spjList()
    {
        return $this->hasMany(SpjMakanMinumRapat::class, 'penyedia_id');
    }
}
