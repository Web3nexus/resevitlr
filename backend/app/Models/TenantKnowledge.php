<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantKnowledge extends Model
{
    protected $fillable = [
        'title',
        'content',
        'type',
        'file_path',
        'is_active',
    ];
}
