<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LocaleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->header('X-Locale', $request->header('Accept-Language', config('app.locale')));
        
        // Basic sanitization/validation
        if (in_array($locale, ['en', 'es', 'fr', 'de'])) {
            app()->setLocale($locale);
        }

        return $next($request);
    }
}
