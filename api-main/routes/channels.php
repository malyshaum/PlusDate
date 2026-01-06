<?php

use App\Broadcasting\ChatPrivateChannel;
use App\Broadcasting\UserPrivateChannel;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('user.{id}',UserPrivateChannel::class);
Broadcast::channel('chat.{id}',ChatPrivateChannel::class);
