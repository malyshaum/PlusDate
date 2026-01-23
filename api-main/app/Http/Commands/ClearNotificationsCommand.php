<?php

namespace App\Http\Commands;

use App\Models\BotNotification;
use Illuminate\Support\Facades\Log;
use Telegram\Bot\Commands\Command;

class ClearNotificationsCommand extends Command
{
    protected string $name = 'clear_notifications';
    protected string $description = 'Clear notifications';

    public function handle(): void
    {
        $userId = $this->getUpdate()->getChat()->getId();

        BotNotification::query()
            ->where('user_id', $userId)
            ->delete();

        $this->replyWithMessage([
            'text' => 'notifications cleared successfully',
        ]);
    }
}
