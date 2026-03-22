<?php
 
namespace App\Models;
 
use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;
 
class PersonalAccessToken extends SanctumPersonalAccessToken
{
    protected $connection = 'mysql'; // Default to central, but will be overridden by tenancy bootstrap
}
