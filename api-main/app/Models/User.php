<?php

namespace App\Models;

use App\Enums\Core\FileTypeEnum;
use App\Models\Moderation\UserModeration;
use App\Models\User\UserDeletionSnapshot;
use App\Models\User\UserFeedProfile;
use App\Models\User\UserFile;
use App\Models\User\UserSearchPreference;
use App\Models\User\UserSettings;
use App\Models\User\UserSwipe;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Carbon;
use Laravel\Cashier\Billable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property int $id
 * @property string $name
 * @property string|null $username
 * @property string $stripe_id
 * @property string $photo_url
 * @property string $language_code
 * @property bool $is_onboarded
 * @property bool $is_under_moderation
 * @property bool $blocked
 * @property Carbon|null $blocked_at
 * @property bool $bot_blocked
 * @property Carbon|null $bot_blocked_at
 * @property bool $is_premium
 * @property bool $telegram_premium
 * @property bool $is_trial_used
 * @property string $instagram
 * @property string|null $start_param
 * @property string $profile_description
 * @property Collection $files
 * @property Collection $validFiles
 * @property Collection $videos
 * @property Collection $photos
 * @property UserFeedProfile $feedProfile
 * @property UserSettings|null $settings
 * @property UserSearchPreference|null $searchPreference
 * @property Collection|null $moderation
 * @property Carbon $last_active_at
 * @property Carbon $initial_premium_granted_at
 * @method static Builder<static> withTrashed(bool $withTrashed = true)
 * @method static Builder<static> onlyTrashed()
 * @method static Builder<static> withoutTrashed()
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Billable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'name',
        'username',
        'photo_url',
        'is_onboarded',
        'language_code',
        'is_under_moderation',
        'blocked',
        'blocked_at',
        'bot_blocked',
        'bot_blocked_at',
        'instagram',
        'profile_description',
        'is_premium',
        'is_trial_used',
        'start_param',
        'telegram_premium',
        'last_active_at',
    ];

    protected $hidden = [
        'stripe_id',
        'pm_type',
        'pm_last_four',
        'pivot'
    ];

    public function moderation(): HasMany
    {
        return $this->hasMany(UserModeration::class,'user_id');
    }

    public function feedProfile(): HasOne
    {
        return $this->hasOne(UserFeedProfile::class, 'user_id');
    }

    public function files(): HasMany
    {
        return $this->hasMany(UserFile::class, 'user_id', 'id');
    }

    public function validFiles(): HasMany
    {
        return $this->hasMany(UserFile::class, 'user_id', 'id')
            ->whereDoesntHave('moderation')
            ->where('is_under_moderation', false)
            ->where('type', '!=', FileTypeEnum::VERIFICATION_PHOTO);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(UserFile::class, 'user_id', 'id')
                    ->where('type', FileTypeEnum::IMAGE->value);
    }

    public function videos(): HasMany
    {
        return $this->hasMany(UserFile::class, 'user_id', 'id')
                    ->where('type', FileTypeEnum::VIDEO->value);
    }

    public function settings(): HasOne
    {
        return $this->hasOne(UserSettings::class, 'user_id');
    }

    public function searchPreference(): HasOne
    {
        return $this->hasOne(UserSearchPreference::class, 'user_id');
    }

    public function chats(): BelongsToMany
    {
        return $this->belongsToMany(Chat::class, 'chat_users')
                   ->withPivot('joined_at')
                   ->withTimestamps()
                   ->orderBy('chats.updated_at', 'desc');
    }

    public function swipes(): HasMany
    {
        return $this->hasMany(UserSwipe::class, 'user_id');
    }

    public function sentMessages(): HasMany
    {
        return $this->hasMany(ChatMessage::class, 'sender_id');
    }

    public function deletionSnapshot(): HasOne
    {
        return $this->hasOne(UserDeletionSnapshot::class, 'user_id');
    }
}
