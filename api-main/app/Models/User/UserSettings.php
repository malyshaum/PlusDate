<?php

namespace App\Models\User;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property bool $hide_instagram
 * @property bool $hide_age
 */
class UserSettings extends Model
{
    protected $table = 'user_settings';
    protected $fillable = [
        'user_id',
        'disable_notifications',
        'hide_instagram',
        'hide_age',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class,'user_id');
    }
}
