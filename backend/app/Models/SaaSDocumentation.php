<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaaSDocumentation extends Model
{
    protected $connection = 'mysql';
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'category',
        'order_index',
        'content',
        'is_published',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];
}
