<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Admin extends Authenticatable
{
    use HasApiTokens, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'permissions',
        'two_factor_method',
        'two_factor_secret',
        'login_pin',
        'two_factor_code',
        'two_factor_expires_at',
    ];

    protected $casts = [
        'permissions' => 'json',
        'two_factor_expires_at' => 'datetime',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'login_pin',
        'two_factor_code',
    ];
}
