<?php

namespace App\Models\User;

use App\Enums\Core\GenderEnum;
use App\Enums\Core\SearchForEnum;
use App\Models\Dictionary\Activity;
use App\Models\Dictionary\City;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSearchPreference extends Model
{
    protected $table = 'user_search_preferences';
    public $timestamps = false;
    protected $fillable = [
        'user_id',
        'city_id',
        'include_nearby',
        'with_video',
        'from_age',
        'to_age',
        'expand_age_range',
        'gender',
        'search_for',
        'eye_color',
        'zodiac_signs',
        'activity_id',
        'activity_ids',
        'hobbies',
        'with_premium',
        'height_from',
        'height_to',
    ];

    protected $casts = [
        'gender' => GenderEnum::class,
        'search_for' => SearchForEnum::class,
        'hobbies' => 'array',
        'eye_color' => 'array',
        'zodiac_signs' => 'array',
        'activity_ids' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class,'user_id');
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class,'city_id');
    }

    /**
     * @deprecated Use activity_ids instead. This method is kept for backward compatibility.
     */
    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class,'activity_id');
    }
}
