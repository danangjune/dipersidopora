<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    const ROLE_ADMIN = 'admin';
    const ROLE_SURVEYOR = 'surveyor';
    const ROLE_VERIFIKATOR = 'verifikator';

    use HasFactory, Notifiable;

    protected $primaryKey = 'user_id';

    protected $fillable = [
        'name', 'username', 'email', 'password', 'user_firstname', 'user_lastname', 'user_email', 'user_password', 'user_role',
    ];

    protected $hidden = ['password', 'user_password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->user_role === self::ROLE_ADMIN;
    }

    public function isSurveyor(): bool
    {
        return $this->user_role === self::ROLE_SURVEYOR;
    }

    public function hasRole(string $role): bool
    {
        return $this->user_role === $role;
    }
}
