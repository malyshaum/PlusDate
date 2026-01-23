<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\PresenceRequest;
use App\Services\User\PresenceService;
use Illuminate\Http\JsonResponse;

class PresenceController extends Controller
{
    public function __construct(
        private readonly PresenceService $presenceService,
    ) {
    }

    public function presence(PresenceRequest $request): JsonResponse
    {
        $onlineIds = $this->presenceService->getOnlineMatchUserIds(
            $request->validated('user_id')
        );

        return $this->response($onlineIds);
    }
}