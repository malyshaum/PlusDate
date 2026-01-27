<?php

namespace App\Models\User;

use App\Enums\User\DeletionReasonEnum;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $deletion_type
 * @property array $deletion_reasons
 * @property string|null $deletion_note
 * @property array $user_profile
 * @property array $full_profile
 * @property array $statistics
 * @property int|null $deleted_by
 * @property Carbon|null $can_restore_until
 * @property Carbon $deleted_at
 * @property Carbon|null $hard_deleted_at
 */
class UserDeletionSnapshot extends Model
{
    protected $table = 'user_deletion_snapshots';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'deletion_type',
        'deletion_reasons',
        'deletion_note',
        'user_profile',
        'full_profile',
        'statistics',
        'deleted_by',
        'can_restore_until',
        'deleted_at',
        'hard_deleted_at',
    ];

    protected $casts = [
        'deletion_reasons' => 'array',
        'user_profile' => 'array',
        'full_profile' => 'array',
        'statistics' => 'array',
        'can_restore_until' => 'datetime',
        'deleted_at' => 'datetime',
        'hard_deleted_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id')->withTrashed();
    }

    public function deletedByAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }
}
