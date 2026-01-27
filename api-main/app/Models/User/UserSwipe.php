<?php

namespace App\Models\User;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property $user User
 * @property string $action
 */
class UserSwipe extends Model
{
    use SoftDeletes;

    protected $table = 'user_swipes';
    protected $fillable = [
        'user_id',
        'profile_id',
        'action',
        'is_match',
        'is_respond',
        'is_viewed'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function profile(): BelongsTo
    {
        return $this->belongsTo(UserFeedProfile::class, 'profile_id');
    }
}
