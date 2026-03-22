<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            // Central Admin API
            Route::middleware('api')
                ->prefix('central-api')
                ->group(base_path('routes/admin.php'));
                
            // Global API (Webhooks)
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->prepend(\Illuminate\Http\Middleware\HandleCors::class);
        $middleware->append(\App\Http\Middleware\LocaleMiddleware::class);
        $middleware->redirectGuestsTo(function ($request) {
            if ($request->is('api/*') || $request->is('central-api/*')) {
                return null; // Return 401 JSON for API
            }
            return route('login');
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
