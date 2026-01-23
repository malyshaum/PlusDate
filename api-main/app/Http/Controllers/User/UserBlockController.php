<?php

declare(strict_types=1);

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\BlockUserRequest;
use App\Http\Requests\User\UnblockUserRequest;
use App\Services\User\UserBlockingServiceInterface;
use Illuminate\Http\JsonResponse;

final class UserBlockController extends Controller
{
    public function __construct(
        private readonly UserBlockingServiceInterface $blockingService,
    ) {
    }

    public function block(BlockUserRequest $request): JsonResponse
    {
        $this->blockingService->blockUser(
            $request->getAuthUserId(),
            $request->getBlockedUserId()
        );

        return $this->response([]);
    }

    public function unblock(UnblockUserRequest $request): JsonResponse
    {
        $this->blockingService->unblockUser(
            $request->getAuthUserId(),
            $request->getBlockedUserId()
        );

        return $this->response([]);
    }
}
