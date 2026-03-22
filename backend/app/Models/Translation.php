<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Translation extends Model
{
    protected $fillable = ['locale', 'group', 'key', 'value'];

    public function scopeLocale($query, $locale)
    {
        return $query->where('locale', $locale);
    }
}
