<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaaSSetting extends Model
{
    protected $connection = 'mysql';
    protected $fillable = ['key', 'value'];

    public static function get(string $key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        if (!$setting) return $default;
        
        $val = $setting->value;
        // Basic JSON detect
        if (str_starts_with($val, '[') || str_starts_with($val, '{')) {
            return json_decode($val, true);
        }

        // Cast boolean strings
        if ($val === 'true') return true;
        if ($val === 'false') return false;
        
        return $val;
    }
}
