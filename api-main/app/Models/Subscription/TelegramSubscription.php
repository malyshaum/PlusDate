<?php

namespace App\Models\Subscription;

use Illuminate\Database\Eloquent\Model;

class TelegramSubscription extends Model
{
    protected $fillable = [
        'user_id',
        'plan',
        'active_until',
    ];
}
