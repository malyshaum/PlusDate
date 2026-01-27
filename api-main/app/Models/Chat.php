<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Chat extends Model
{
    use SoftDeletes;

    protected $fillable = [
        //
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'chat_users')
                   ->withPivot('joined_at')
                   ->withTimestamps();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class);
    }

    public function latestMessage(): HasOne
    {
        return $this->hasOne(ChatMessage::class)->latest('sent_at');
    }

    public static function getChatsBetweenUserAndOthers(int $currentUserId, array $otherUserIds): Collection
    {
        return self::query()
            ->with(['latestMessage.sender', 'users'])
            ->whereHas('users', fn($q) => $q->where('user_id', $currentUserId))
            ->whereHas('users', fn($q) => $q->whereIn('user_id', $otherUserIds))
            ->get();
    }
}
