<?php

namespace App\Models\User;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $current_phase
 * @property Carbon|null $phase_started_at
 * @property int $swipes_used_in_phase
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property User $user
 */
class UserSwipeState extends Model
{
    protected $table = 'user_swipe_state';

    protected $fillable = [
        'user_id',
        'current_phase',
        'phase_started_at',
        'swipes_used_in_phase',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'swipes_used_in_phase' => 'integer',
        'phase_started_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
