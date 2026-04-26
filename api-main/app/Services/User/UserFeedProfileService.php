<?php

namespace App\Services\User;

use App\Dto\Feed\UserFeedProfilesFilterDto;
use App\Dto\User\UserFeedProfileDto;
use App\Dto\User\UserSearchPreferenceDto;
use App\Enums\Core\ErrorMessageEnum;
use App\Enums\Core\SearchForEnum;
use App\Exceptions\ApiException;
use App\Mapping\User\UserMapping;
use App\Models\User;
use App\Models\User\UserFeedProfile;
use App\Models\User\UserSearchPreference;
use App\Repositories\User\UserBlockRepositoryInterface;
use AutoMapperPlus\AutoMapper;
use AutoMapperPlus\Exception\UnregisteredMappingException;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\Cursor;
use Illuminate\Support\Facades\DB;

readonly class UserFeedProfileService
{
    public function __construct(
        private AutoMapper $mapper,
        private UserBlockRepositoryInterface $blockRepository,
    )
    {
        //
    }

    private function apply(Builder $query, UserSearchPreferenceDto $filter): Builder
    {
        $usePostgis = config('database.use_postgis');

        foreach ($filter->toArray() as $key => $value) {
            if ($value === null) {
                continue;
            }
            switch ($key) {
                case 'gender':
                    $query->where('sex', $value);
                    break;
                case 'with_video':
                    if ($value === true) {
                        $query->whereHas('user.videos');
                    }
                    break;
                case 'to_age':
                    $query->where('age', '<=', $value);
                    break;
                case 'from_age':
                    $query->where('age', '>=', $value);
                    break;
                case 'with_premium':
                    if ($value === true) {
                        $query->whereHas('user', fn(Builder $query) => $query->where('is_premium', true));
                    }
                    break;
                case 'city_id':
                    if ($usePostgis) {
                        $city = DB::table('cities')
                            ->select(DB::raw('ST_AsText(location) as location'))
                            ->find((int)$value);

                        if ($city?->location !== null) {
                            $query->addSelect(DB::raw("ST_Distance(coordinates, ST_GeogFromText('$city->location')) as distance"));
                            $query->orderBy('distance');
                        }
                    } else {
                        $query->where('city_id', (int)$value);
                    }
                    break;
                case 'eye_color':
                    if(!empty($value)) {
                        $query->whereIn('eye_color', $value);
                    }
                    break;
                case 'zodiac_signs':
                    if(!empty($value)) {
                        $query->whereIn('zodiac_sign', $value);
                    }
                    break;
                case 'activity_id':
                    $query->where('activity_id', $value);
                    break;
                case 'activity_ids':
                    $value = array_filter($value);
                    if (!empty($value)) {
                        $query->whereHas('activities', function (Builder $q) use ($value) {
                            $q->whereIn('activities.id', $value);
                        });
                    }
                    break;
                case 'activityId':
                    if ($value !== null) {
                        $query->whereHas('activities', function (Builder $q) use ($value) {
                            $q->where('activities.id', $value);
                        });
                    }
                    break;
                case 'height_from':
                    $query->where('height', '>=', $value);
                    break;
                case 'height_to':
                    $query->where('height', '<=', $value);
                    break;
                case 'hobbies':
                    if (!empty($value)) {
                        $query->where(function($q) use ($value) {
                            foreach ($value as $hobby) {
                                $q->orWhereJsonContains('hobbies', $hobby);
                            }
                        });
                    }
                    break;
                case 'search_for':
                    if ($value === SearchForEnum::NO_ANSWER->value) {
                        break;
                    }
                    $query->whereIn('search_for', [$value, SearchForEnum::NO_ANSWER]);

                    break;
            }
        }

        return $query;
    }

    /**
     * @throws UnregisteredMappingException
     * @throws ApiException
     * @todo Use mapping, return CursorCollectionDto instead of array
     */
    public function get(UserFeedProfilesFilterDto $filter): array
    {
        $searchPreferences = UserSearchPreference::query()->where('user_id', $filter->userId)->first();
        if ($searchPreferences === null) {
            throw new ApiException(ErrorMessageEnum::ERROR_NO_SEARCH_PREFERENCES);
        }

        /** @var UserSearchPreferenceDto $searchPreferenceDto */
        /** @see UserMapping::configureArrayToUserSearchPreferenceDto */
        $searchPreferenceDto = $this->mapper->map($searchPreferences->toArray(), UserSearchPreferenceDto::class);

        if ($searchPreferenceDto === null) {
            return [];
        }

        $blockedUserIds = $this->blockRepository->getBlockedUserIds($filter->userId);

        $query = UserFeedProfile::query()
            ->select(['user_id','id'])
            ->whereNot('user_id', $filter->userId)
            ->whereHas('user', fn(Builder $query) => $query
                ->where('is_under_moderation', false)
                ->where('is_onboarded', true)
                ->where('blocked', false))
            ->when(!empty($blockedUserIds), fn(Builder $q) => $q->whereNotIn('user_id', $blockedUserIds))
            ->whereNotExists(function ($query) use ($filter) {
                //todo should not use RAW query, use Model
                $query->select(DB::raw(1))
                    ->from('user_swipes')
                    ->where('user_swipes.user_id', $filter->userId)
                    ->whereColumn('user_swipes.profile_id', 'user_feed_profile.id');
            })
            ->limit($filter->perPage);

        if ($filter->skipFilter === false) {
            $query = $this->apply($query, $searchPreferenceDto);
        }

        $data = $query->cursorPaginate(perPage: $filter->perPage, cursor: Cursor::fromEncoded($filter->cursor));

        $nextCursor = $data->nextCursor();
        $prevCursor = $data->previousCursor();
        $hasMore = $data->hasMorePages();

        $usersId = collect($data->items())->pluck('user_id')->toArray();

        $users = User::query()
            ->whereIn('id', $usersId)
            ->when(!empty($usersId), fn($q) => $q->orderByRaw('array_position(ARRAY[' . implode(',', $usersId) . '], id)'))
            ->with(['validFiles', 'feedProfile.activities', 'settings'])
            ->get();

        return [
            'data' => $users,
            'next_cursor' => $nextCursor?->encode(),
            'prev_cursor' => $prevCursor?->encode(),
            'has_more' => $hasMore,
            'per_page' => $data->perPage(),
            'path' => $data->path()
        ];
    }

    /**
     * @throws Exception
     */
    public function upsert(UserFeedProfileDto $dto): UserFeedProfileDto
    {
        DB::beginTransaction();
        try {
            $data = $dto->toArray();
            $activityIds = $data['activity_ids'] ?? null;
            unset($data['activity_ids']);

            $userFeedProfile = UserFeedProfile::query()->updateOrCreate([
                'user_id' => $dto->userId
            ], $data);

            if ($activityIds !== null) {
                $userFeedProfile->activities()->sync($activityIds);
            }

            $userFeedProfile->load('activities');

            DB::commit();
            /** @see UserMapping::configure() */
            return $this->mapper->map($userFeedProfile->toArray(), UserFeedProfileDto::class);
        } catch (Exception $exception) {
            DB::rollBack();
            throw $exception;
        }
    }

    public function getByUserId(int $userId): UserFeedProfileDto|null
    {
        $feedProfile = UserFeedProfile::query()
            ->with('activities')
            ->where('user_id', $userId)
            ->first();

        if ($feedProfile === null) {
            return null;
        }

        /** @see UserMapping::configure() */
        return $this->mapper->map($feedProfile->toArray(), UserFeedProfileDto::class);
    }
}
