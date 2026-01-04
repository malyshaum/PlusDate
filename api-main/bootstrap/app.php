<?php

use App\Exceptions\ApiException;
use App\Http\Middleware\RecordActivityMiddleware;
use App\Http\Middleware\SetApplicationJsonHeaderMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(SetApplicationJsonHeaderMiddleware::class);
        $middleware->validateCsrfTokens(except: [
            'stripe/*',
        ]);
    })
    ->withBroadcasting(
        __DIR__.'/../routes/channels.php',
        ['prefix' => 'api', 'middleware' => ['api', 'auth:sanctum']],
    )
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (ApiException $e) {
            return $e->render();
        });
    })->create();
