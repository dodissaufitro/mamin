<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Penyedia extends Model
{
    protected $fillable = ['nama', 'alamat', 'telepon'];

    public function spjList()
    {
        return $this->hasMany(SpjMakanMinumRapat::class, 'penyedia_id');
    }
}
