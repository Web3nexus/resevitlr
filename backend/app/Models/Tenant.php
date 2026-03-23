<?php

namespace App\Models;

use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains;

    protected $connection = 'mysql';
    
    public static function getCustomColumns(): array
    {
        return [
            'id',
            'plan',
            'business_name',
            'owner_name',
            'owner_email',
            'status',
            'ai_credits_used',
            'ai_credits_reset_at',
            'features',
            'created_at',
            'updated_at',
        ];
    }

    protected $casts = [
        'features' => 'array',
        'ai_credits_used' => 'integer',
        'ai_credits_reset_at' => 'datetime',
    ];
}
