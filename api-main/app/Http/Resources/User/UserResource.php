<?php

namespace App\Http\Resources\User;

use App\Enums\Core\FileTypeEnum;
use App\Models\User;
use App\Models\User\UserFile;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UserResource extends JsonResource
{
    public static $wrap = '';

    public function toArray($request): array
    {
        /** @var User $this */
        return [
            'id' => $this->id,
            'name' => $this->name,
            'photo_url' => $this->photo_url,
            'language_code' => $this->language_code,
            'is_onboarded' => $this->is_onboarded,
            'is_under_moderation' => $this->is_under_moderation,
            'is_trial_used' => $this->is_trial_used,
            'instagram' => $this->instagram,
            'profile_description' => $this->profile_description,
            'feed_profile' => UserFeedProfileResource::make($this->whenLoaded('feedProfile')),
            'settings' => UserSettingsResource::make($this->whenLoaded('settings')),
            'moderation' => UserModerationResource::collection($this->whenLoaded('moderation')),
            'search_preference' => SearchPreferenceResource::make($this->whenLoaded('searchPreference')),
            'is_premium' => $this->is_premium,
            'start_param' => $this->start_param,
            'files' => self::prepareFiles(),
            'last_active_at' => $this->last_active_at,
            'blocked' => $this->blocked,
            'blocked_at' => $this->blocked_at,
        ];
    }

    private function prepareFiles(): array
    {
        /** @var Collection $userFiles */
        $userFiles = $this->files;

        if ($userFiles === null) {
            return [];
        }

        return $userFiles->map(function (UserFile $file) {
            $data = $file->toArray();

            if ($file->type === FileTypeEnum::VIDEO->value) {
                $thumbnail = Str::replace('.mp4','.webp', basename($file->filepath));

                $data['thumbnail_url'] = Storage::temporaryUrl(
                    Str::replace(basename($file->filepath), $thumbnail, $file->filepath),
                    Carbon::now()->addDay()
                );
            }

            return $data;
        })->toArray();
    }
}
