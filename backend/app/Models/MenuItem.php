<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MenuItem extends Model
{
    protected $fillable = [
        'menu_category_id', 
        'name', 
        'description', 
        'price', 
        'image_url', 
        'is_available', 
        'sort_order'
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(MenuCategory::class, 'menu_category_id');
    }

    public function addons(): HasMany
    {
        return $this->hasMany(MenuItemAddon::class);
    }
}
