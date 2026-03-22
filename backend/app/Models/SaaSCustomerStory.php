<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaaSCustomerStory extends Model
{
    protected $connection = 'mysql';
    use HasFactory;

    protected $fillable = [
        'client_name',
        'slug',
        'logo_url',
        'metrics',
        'content',
        'is_published',
    ];

    protected $casts = [
        'metrics' => 'array',
        'is_published' => 'boolean',
    ];
}
