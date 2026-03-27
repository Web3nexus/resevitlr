<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\AutomationController;
use Illuminate\Support\Facades\Log;

class ProcessSocialWebhook implements ShouldQueue
{
    use Queueable;

    protected $tenant;
    protected $payload;

    /**
     * Create a new job instance.
     */
    public function __construct($tenant, array $payload)
    {
        $this->tenant = $tenant;
        $this->payload = $payload;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            tenancy()->initialize($this->tenant);

            $req = new Request();
            $req->merge($this->payload);

            $controller = new AutomationController();
            $controller->handleSocialWebhook($req);

            tenancy()->end();
        } catch (\Exception $e) {
            Log::error('Background Webhook Processing Failed', ['error' => $e->getMessage()]);
            tenancy()->end();
        }
    }
}
