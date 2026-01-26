<?php

namespace App\Mapping\User;

use App\Dto\Storage\ReorderFilesDto;
use App\Dto\Storage\SaveFileDto;
use App\Dto\User\OnboardDto;
use App\Dto\User\UpdatePhotosDto;
use App\Dto\User\UpsertUserDto;
use App\Dto\User\UserDto;
use App\Dto\User\UserFeedProfileDto;
use App\Dto\User\UserSearchPreferenceDto;
use App\Dto\User\UserSettingsDto;
use App\Enums\Core\SearchForEnum;
use App\Enums\Core\GenderEnum;
use App\Dto\User\CreateReportDto;
use App\Http\Requests\User\CreateReportRequest;
use App\Http\Requests\User\OnboardRequest;
use App\Http\Requests\User\UpdatePhotosRequest;
use App\Http\Requests\User\UpsertUserProfileRequest;
use App\Mapping\AutoMapperConfiguratorInterface;
use App\Mapping\Storage\ArrayToReorderFilesDtoMapper;
use App\Models\User;
use AutoMapperPlus\AutoMapper;
use AutoMapperPlus\Configuration\AutoMapperConfig;
use AutoMapperPlus\DataType;
use AutoMapperPlus\NameConverter\NamingConvention\CamelCaseNamingConvention;
use AutoMapperPlus\NameConverter\NamingConvention\SnakeCaseNamingConvention;

class UserMapping implements AutoMapperConfiguratorInterface
{
    public function __construct(
        private readonly AutoMapper $mapper
    )
    {

    }

    public function configure(AutoMapperConfig $config): void
    {
        $config->registerMapping(DataType::ARRAY, UpsertUserDto::class)
            ->forMember('name', function (array $data){
                // TODO: fix this, use one constant approach
                if (isset($data['first_name'])) {
                    return $data['first_name'];
                } elseif (isset($data['name'])) {
                    return $data['name'];
                }
                return "";
            })
            ->forMember('feedProfile', fn(array $data) => $this->mapper->map($data['feedProfile'] ?? null, UserFeedProfileDto::class))
            ->forMember('searchPreference', fn(array $data) => $this->mapper->map($data['searchPreference'] ?? null, UserSearchPreferenceDto::class))
            ->withNamingConventions(new SnakeCaseNamingConvention, new CamelCaseNamingConvention);

        $config->registerMapping(DataType::ARRAY, UserFeedProfileDto::class)
            ->forMember('sex', fn(array $data) => GenderEnum::tryFrom($data['sex']))
            ->forMember('eyeColor', fn(array $data) => $data['eye_color'] ?? null)
            ->forMember('searchFor',
                 fn(array $data) => SearchForEnum::tryFrom($data['search_for']) ?? SearchForEnum::tryFromName((int)$data['search_for']))
            ->withNamingConventions(new SnakeCaseNamingConvention, new CamelCaseNamingConvention);

        $config->registerMapping(User::class, UserDto::class)
            ->useAwareCustomMapper(UserToUserDtoMapper::class);

        $this->configureUpsertUserProfileRequestToDto($config);
        $this->configureUserToUserUpsertDto($config);
        $this->configureArrayToUserSearchPreferenceDto($config);
        $this->configureArrayToUserSettingsDto($config);
        $this->updatePhotosRequestToUpdatePhotosDto($config);
        $this->arrayToSaveFileDto($config);
        $this->configureCreateReportRequestToDto($config);
        $this->configureArrayToCreateReportDto($config);
        $this->arrayToReorderFilesDto($config);

        $config->registerMapping(OnboardRequest::class, OnboardDto::class)
            ->useAwareCustomMapper(OnboardRequestToOnboardDtoMapper::class);
    }

    private function configureUpsertUserProfileRequestToDto(AutoMapperConfig $config): void
    {
        $config->registerMapping(UpsertUserProfileRequest::class, UpsertUserDto::class)
            ->useAwareCustomMapper(UpsertUserProfileRequestToUpsertUserProfileDtoMapper::class);
    }

    private function configureUserToUserUpsertDto(AutoMapperConfig $config): void
    {
        $config->registerMapping(User::class, UpsertUserDto::class);
    }

    private function configureArrayToUserSearchPreferenceDto(AutoMapperConfig $config): void
    {
        $config->registerMapping(DataType::ARRAY, UserSearchPreferenceDto::class)
            ->useAwareCustomMapper(ArrayToUserSearchPreferenceDtoMapper::class);
    }

    private function configureArrayToUserSettingsDto(AutoMapperConfig $config): void
    {
        $config->registerMapping(DataType::ARRAY, UserSettingsDto::class)
            ->withNamingConventions(new SnakeCaseNamingConvention, new CamelCaseNamingConvention);
    }

    private function updatePhotosRequestToUpdatePhotosDto(AutoMapperConfig $config): void
    {
        $config->registerMapping(UpdatePhotosRequest::class, UpdatePhotosDto::class)
            ->useAwareCustomMapper(UpdatePhotosRequestToUpdatePhotosDtoMapper::class);
    }

    private function arrayToSaveFileDto(AutoMapperConfig $config): void
    {
        $config->registerMapping(DataType::ARRAY, SaveFileDto::class)
            ->useAwareCustomMapper(ArrayToSaveFileDtoMapping::class);
    }

    private function configureCreateReportRequestToDto(AutoMapperConfig $config): void
    {
        $config->registerMapping(CreateReportRequest::class, CreateReportDto::class)
            ->useAwareCustomMapper(ArrayToCreateReportDtoMapper::class);
    }

    private function configureArrayToCreateReportDto(AutoMapperConfig $config): void
    {
        $config->registerMapping(DataType::ARRAY, CreateReportDto::class)
            ->useAwareCustomMapper(ArrayToCreateReportDtoMapper::class);
    }

    private function arrayToReorderFilesDto(AutoMapperConfig $config): void
    {
        $config->registerMapping(DataType::ARRAY, ReorderFilesDto::class)
            ->useAwareCustomMapper(ArrayToReorderFilesDtoMapper::class);
    }
}
