<?php

namespace App\Providers;

use App\Core\Extend\CoreAutoMapper;
use App\Enums\Core\TagEnum;
use App\Mapping\Chat\ChatMapping;
use App\Mapping\CursorCollectionMapping;
use App\Mapping\Dictionary\DictionaryMapping;
use App\Mapping\Feed\FeedMapping;
use App\Mapping\User\UserMapping;
use AutoMapperPlus\AutoMapper;
use AutoMapperPlus\AutoMapperInterface;
use App\Core\Extend\AutoMapperConfig;
use AutoMapperPlus\Configuration\AutoMapperConfigInterface;
use App\Core\Extend\Mapping;
use AutoMapperPlus\Configuration\MappingInterface;
use Illuminate\Support\ServiceProvider;

class AutoMapperServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(MappingInterface::class, fn () => Mapping::class);
        $this->app->singleton(AutoMapperConfigInterface::class, fn(): AutoMapperConfig => new AutoMapperConfig());
        $this->app->singleton(
            AutoMapper::class,
            fn(): AutoMapper => new CoreAutoMapper($this->app->make(AutoMapperConfigInterface::class))
        );
        $this->app->singleton(
            AutoMapperInterface::class,
            AutoMapper::class
        );

        $this->app->tag([
            UserMapping::class,
            FeedMapping::class,
            ChatMapping::class,
            CursorCollectionMapping::class,
            DictionaryMapping::class,
        ],TagEnum::MAPPINGS->name);
    }
}
