<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property Carbon $created_at
 * @property string $type
 * @property int $user_id
 */
class BotNotification extends Model
{
    protected $table = 'user_bot_notifications';

    public $incrementing = false;
    public $timestamps = false;
    protected $fillable = [
        'user_id',
        'type',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];
}
