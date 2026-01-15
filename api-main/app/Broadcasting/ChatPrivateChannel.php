<?php

namespace App\Broadcasting;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class ChatPrivateChannel
{
    /**
     * Create a new channel instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Authenticate the user's access to the channel.
     */
    public function join(User $user, int $id): array|bool
    {
        return DB::table('chat_users')
            ->where('user_id', $user->id)
            ->where('chat_id', $id)
            ->exists();
    }
}
