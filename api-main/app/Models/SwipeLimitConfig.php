<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $config_key
 * @property int $config_value
 * @property string|null $description
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class SwipeLimitConfig extends Model
{
    protected $table = 'swipe_limits_config';

    protected $fillable = [
        'config_key',
        'config_value',
        'description',
    ];

    protected $casts = [
        'config_value' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
