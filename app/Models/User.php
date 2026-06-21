<?php

namespace App\Models;

use App\Enums\UserRole;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
        ];
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === UserRole::SuperAdmin;
    }

    public function isPic(): bool
    {
        return $this->role === UserRole::Pic;
    }

    public function isBendahara(): bool
    {
        return $this->role === UserRole::Bendahara;
    }

    /**
     * @return array<string, bool>
     */
    public function permissions(): array
    {
        return [
            'manageUsers' => $this->isSuperAdmin(),
            'manageMasterData' => $this->isSuperAdmin(),
            'viewInbox' => $this->isSuperAdmin() || $this->isBendahara(),
            'createSpj' => $this->isSuperAdmin() || $this->isPic(),
            'updateSpj' => $this->isSuperAdmin() || $this->isBendahara(),
            'deleteSpj' => $this->isSuperAdmin() || $this->isPic(),
            'viewSpj' => $this->isSuperAdmin() || $this->isPic() || $this->isBendahara(),
            'viewDashboard' => true,
        ];
    }
}
