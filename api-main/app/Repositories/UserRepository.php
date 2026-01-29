<?php

namespace App\Repositories;

use App\Dto\User\UserDto;
use App\Models\User;
use AutoMapperPlus\AutoMapper;
use AutoMapperPlus\Exception\UnregisteredMappingException;
use Illuminate\Support\Carbon;

readonly class UserRepository
{
    public function __construct(
        private AutoMapper $mapper,
    )
    {

    }

    /**
     * @throws UnregisteredMappingException
     */
    public function getById(int $userId, bool $withDeleted = false): UserDto|null
    {
        $user = User::query()
            ->with('feedProfile');

        if ($withDeleted) {
            $user = $user->withTrashed();
        }

        $user = $user->find($userId);

        if ($user === null) {
            return null;
        }

        /** @see UserToUserDtoMapper::mapToObject() */
        return $this->mapper->map($user, UserDto::class);
    }

    public function find(int $userId): User
    {
        return User::query()->findOrFail($userId);
    }

    public function updateKickedBotStatus(int $userId): void
    {
        User::query()
            ->where('id', $userId)
            ->update([
                'bot_blocked' => true,
                'bot_blocked_at' => Carbon::now(),
            ]);
    }

    public function unblockBotStatus(int $userId): void
    {
        User::query()
            ->where('id', $userId)
            ->update([
                'bot_blocked' => false,
                'bot_blocked_at' => null,
            ]);
    }
}
