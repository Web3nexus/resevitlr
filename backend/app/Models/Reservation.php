<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    protected $fillable = [
        'customer_name',
        'customer_email',
        'customer_phone',
        'reservation_time',
        'party_size',
        'restaurant_table_id',
        'status',
        'special_requests'
    ];

    protected $casts = [
        'reservation_time' => 'datetime'
    ];

    public function table(): BelongsTo
    {
        return $this->belongsTo(RestaurantTable::class, 'restaurant_table_id');
    }
}
