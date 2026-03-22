<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $fillable = [
        'description',
        'amount',
        'expense_date',
        'category',
        'receipt_url'
    ];

    protected $casts = [
        'expense_date' => 'date'
    ];
}
