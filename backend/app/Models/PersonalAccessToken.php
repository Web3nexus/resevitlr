<?php
 
namespace App\Models;
 
use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;
 
class PersonalAccessToken extends SanctumPersonalAccessToken
{
    // No hardcoded connection so it follows the tenancy-swapped default connection
}
