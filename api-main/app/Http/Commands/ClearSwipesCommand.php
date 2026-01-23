<?php

namespace App\Http\Commands;

use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\User\UserFeedProfile;
use App\Models\User\UserSwipe;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Telegram\Bot\Commands\Command;

class ClearSwipesCommand extends Command
{
    protected string $name = 'clear_swipes';
    protected string $description = 'Clear swipes';

    public function handle(): void
    {
        $userId = $this->getUpdate()->getChat()->getId();

        DB::beginTransaction();
        try {
            $feedProfile = UserFeedProfile::query()->where('user_id', $userId)->first();
            if ($feedProfile !== null) {
                UserSwipe::query()->where('profile_id', $feedProfile->id)->forceDelete();
            }

            $chatIds = DB::table('chat_users')
                ->where('user_id', $userId)
                ->get()
                ->pluck('chat_id')
                ->toArray();

            DB::table('chat_users')
                ->whereIn('chat_id', $chatIds)
                ->delete();

            Chat::query()->whereIn('id', $chatIds)->forceDelete();
            ChatMessage::query()->whereIn('chat_id', $chatIds)->forceDelete();

            UserSwipe::query()->where('user_id', $userId)->forceDelete();
            DB::commit();

            $this->replyWithMessage([
                'text' => 'user swipes clear successfully',
            ]);
        }catch (Exception $exception) {
            DB::rollBack();
            $this->replyWithMessage([
                'text' => 'error',
            ]);
            throw $exception;
        }
    }
}
