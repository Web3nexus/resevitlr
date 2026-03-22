<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffProfile extends Model
{
    protected $fillable = ['name', 'email', 'phone', 'role', 'is_active', 'avatar_url'];
}
