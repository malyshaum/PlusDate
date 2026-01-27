<?php

namespace App\Models\User;

use App\Models\Moderation\UserModeration;
use App\Models\User;
use App\Services\User\FileService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int $user_id
 * @property int $file_id
 * @property bool $is_under_moderation
 * @property bool $is_main
 * @property int|null $order
 * @property string $filepath
 * @property string $url
 * @property string $type
 * @property Carbon $created_at
 */
class UserFile extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'user_files';

    protected $fillable = [
        'user_id',
        'filepath',
        'type',
        'file_id',
        'is_under_moderation',
        'is_main',
        'order',
    ];

    protected $appends = ['url'];

    public function url(): Attribute
    {
        return new Attribute(
            get: fn ($value) => $value ?? Cache::remember('user_file:'.$this->id.':link', Carbon::now()->addDay(), function () {
                return Storage::temporaryUrl($this->filepath, Carbon::now()->addDay());
            })
        );
    }

    public function getUrlWithPrefix(string $prefix): string
    {
        $cacheKey = 'user_file:'.$this->id.':'.$prefix.':link';

//        return Cache::remember($cacheKey, Carbon::now()->addDay(), function () use ($prefix) {
            $filename = $prefix . basename($this->filepath);
            $prefixedPath = Str::replace(basename($this->filepath), $filename, $this->filepath);
//            $path = Storage::exists($prefixedPath) ? $prefixedPath : $this->filepath;
            $path = $prefixedPath;

            return Storage::temporaryUrl($path, Carbon::now()->addDay());
//        });
    }

    public function getMiniUrl(): string
    {
        return $this->getUrlWithPrefix(FileService::PREFIX_MINI);
    }

    public function getMediumUrl(): string
    {
        return $this->getUrlWithPrefix(FileService::PREFIX_MEDIUM);
    }

    public function getBlurredUrl(): string
    {
        return $this->getUrlWithPrefix(FileService::PREFIX_BLURRED);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function file(): HasOne
    {
        return $this->hasOne(UserFile::class, 'file_id', 'id');
    }

    public function moderation(): HasMany
    {
        return $this->hasMany(UserModeration::class, 'user_file_id', 'id');
    }
}
