<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiInteraction extends Model
{
    use HasFactory;

    protected $fillable = [
        'platform',
        'sender',
        'content',
        'reply',
        'status',
        'sentiment',
        'is_reservation',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_reservation' => 'boolean',
    ];
}
