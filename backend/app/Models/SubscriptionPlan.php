<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    protected $connection = 'mysql';
    protected $fillable = [
        'name',
        'slug',
        'monthly_price',
        'yearly_price',
        'features',
        'reservation_limit',
        'max_staff',
        'is_active',
    ];

    protected $casts = [
        'features'           => 'array',
        'is_active'          => 'boolean',
        'reservation_limit'  => 'integer',
        'max_staff'          => 'integer',
    ];
}
