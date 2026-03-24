<?php
 
namespace App\Models;
 
use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;
 
class PersonalAccessToken extends SanctumPersonalAccessToken
{
    /**
     * @override
     * Find the token instance for the given string.
     * Fallback to central database if not found in tenant database.
     */
    public static function findToken($token)
    {
        $res = parent::findToken($token);
        
        if (!$res && tenancy()->initialized) {
            // Fallback to central database
            return \Illuminate\Support\Facades\DB::connection('mysql')->transaction(function () use ($token) {
                 return \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            });
        }
        
        return $res;
    }
}
