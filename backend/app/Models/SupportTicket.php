<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportTicket extends Model
{
    protected $fillable = [
        'tenant_id',
        'subject',
        'message',
        'status',
        'priority',
        'category'
    ];
}
