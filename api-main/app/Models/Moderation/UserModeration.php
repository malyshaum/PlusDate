<?php

namespace App\Models\Moderation;

use App\Models\User;
use App\Models\User\UserFile;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
// * @property int $rejection_reason
 */
class UserModeration extends Model
{
    protected $table = 'user_moderation';

    protected $fillable = [
        'user_id',
        'rejection_reason',
        'is_resolved',
        'user_file_id',
        'note',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class,'user_id');
    }

    public function file(): BelongsTo
    {
        return $this->belongsTo(UserFile::class,'user_file_id');
    }
}
