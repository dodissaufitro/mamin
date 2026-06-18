<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Pic extends Model
{
    use HasFactory;
    protected $fillable = ['nama', 'jabatan'];

    public function spjList()
    {
        return $this->hasMany(SpjMakanMinumRapat::class, 'pic_id');
    }
}
