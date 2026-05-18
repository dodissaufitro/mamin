<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pic extends Model
{
    protected $fillable = ['nama', 'jabatan'];

    public function spjList()
    {
        return $this->hasMany(SpjMakanMinumRapat::class, 'pic_id');
    }
}
