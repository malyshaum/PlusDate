<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class RecordActivityMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param Closure(Request): (Response) $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        /** @var User $user */
        if ($user = $request->user()) {
            if ($user->last_active_at === null) {
                $this->updateActivity($user);
            } elseif ($user->last_active_at !== null && Carbon::parse($user->last_active_at)->lt(Carbon::now()->subMinute())) {
                $this->updateActivity($user);
            }
        }

        return $next($request);
    }

    private function updateActivity(User $user): void
    {
        DB::table('users')
            ->where('id', $user->id)
            ->update(['last_active_at' => Carbon::now()]);
    }
}
