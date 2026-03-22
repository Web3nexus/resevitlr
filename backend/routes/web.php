<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Response;

Route::get('/{any}', function () {
    return Response::make(
        file_get_contents(public_path('index.html')),
        200,
        [
            'Content-Type'  => 'text/html',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma'        => 'no-cache',
            'Expires'       => '0',
        ]
    );
})->where('any', '^(?!(api|central-api|sanctum|_debugbar)).*$');
