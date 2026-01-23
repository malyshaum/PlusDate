<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\BeforeValidException;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\SignatureInvalidException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminServiceMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param Closure(Request): (Response) $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            JWT::decode($request->bearerToken(), new Key(config('services.admin.jwt'), 'HS256'));
        } catch (SignatureInvalidException|BeforeValidException|ExpiredException $e) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        return $next($request);
    }
}
