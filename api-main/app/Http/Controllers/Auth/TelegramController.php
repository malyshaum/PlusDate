<?php

namespace App\Http\Controllers\Auth;

use App\Dto\User\RestoreAccountDto;
use App\Dto\User\UpsertUserDto;
use App\Enums\Core\ErrorMessageEnum;
use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TelegramService;
use App\Services\User\AccountDeletionService;
use App\Services\User\UserService;
use AutoMapperPlus\AutoMapper;
use AutoMapperPlus\Exception\UnregisteredMappingException;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TelegramController extends Controller
{
    // TODO: move to config if needed
    private const array ADMIN_USERNAMES = [
        'shvladzt',
        'alesdead',
        'anakul',
    ];

    public function __construct(
        private readonly UserService $userService,
        private readonly AutoMapper $mapper,
        private readonly TelegramService $telegramService,
        private readonly AccountDeletionService $accountDeletionService
    ){

    }

    /**
     * @todo move to AuthController
     * @throws UnregisteredMappingException
     * @throws ApiException
     * @throws Exception
     */
    public function login(Request $request): JsonResponse
    {
        $data = [];

        if($request->header('x-user') !== null && in_array($request->header('x-user'), self::ADMIN_USERNAMES)) {
            return $this->adminLogin($request->header('x-user'));
        }

        parse_str($request->input('query'), $data);
        if ($request->header('x-user') === null && !$this->telegramService->validateWebAppData($data)) {
            throw new ApiException(ErrorMessageEnum::TELEGRAM_AUTH_ERROR, 403);
        }

        $userData = json_decode($data['user'], true);

        $userDto = $this->userService->getById($userData['id']);

        if ($userDto !== null && $userDto->deletedAt != null) {
            if ($request->input('restore')) {
                $userDto = $this->accountDeletionService->restoreAccount($userDto->id);
            } else {
                throw new ApiException(ErrorMessageEnum::ACCOUNT_WAS_DELETED, 200);
            }
        }

        if ($userDto === null) {
            /** @var UpsertUserDto $upsertDto */
            /** @see UserMapping::configure */
            $upsertDto = $this->mapper->map($userData, UpsertUserDto::class);
            $upsertDto->isOnboarded = false;
            $upsertDto->isUnderModeration = false;
            $upsertDto->isTrialUsed = false;
            $upsertDto->telegramPremium = $userData['telegram_premium'] ?? false;

            $userDto = $this->userService->upsert($upsertDto);
        }

        $token = User::query()
            ->find($userDto->id)
            ->createToken('telegram')
            ->plainTextToken;

        return $this->response(['token' => $token]);
    }

    /**
     * @throws ApiException
     */
    private function adminLogin(string $username): Response|JsonResponse
    {
        $admin = User::query()
            ->where('username',$username)
            ->withTrashed()
            ->firstOrFail();

        // TODO: remove in future for now only for proper testing
        if ($admin->deleted_at != null) {
            $this->accountDeletionService->restoreAccount($admin->id);
        }

        $token = $admin->createToken('telegram')->plainTextToken;

        return $this->response(['token' => $token]);
    }
}
