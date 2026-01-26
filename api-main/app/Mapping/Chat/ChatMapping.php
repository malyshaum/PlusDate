<?php

namespace App\Mapping\Chat;

use App\Dto\Chat\ChatDto;
use App\Dto\Chat\ChatFilterDto;
use App\Dto\Chat\ChatMessageDto;
use App\Dto\Chat\SendMessageDto;
use App\Mapping\AutoMapperConfiguratorInterface;
use AutoMapperPlus\Configuration\AutoMapperConfig;
use AutoMapperPlus\DataType;
use AutoMapperPlus\NameConverter\NamingConvention\CamelCaseNamingConvention;
use AutoMapperPlus\NameConverter\NamingConvention\SnakeCaseNamingConvention;

class ChatMapping implements AutoMapperConfiguratorInterface
{
    public function configure(AutoMapperConfig $config): void
    {
        $this->arrayToChatDto($config);
        $this->arrayToChatFilterDto($config);
        $this->arrayToSendMessageDto($config);
        $this->arrayToChatMessageDto($config);
    }

    private function arrayToChatFilterDto(AutoMapperConfig $config): void
    {
        $config->registerMapping(DataType::ARRAY, ChatFilterDto::class)
            ->withNamingConventions(new SnakeCaseNamingConvention, new CamelCaseNamingConvention);
    }

    private function arrayToChatDto(AutoMapperConfig $config): void
    {
        $config->registerMapping(DataType::ARRAY, ChatDto::class)
            ->withNamingConventions(new SnakeCaseNamingConvention, new CamelCaseNamingConvention);
    }

    private function arrayToSendMessageDto(AutoMapperConfig $config): void
    {
        $config->registerMapping(DataType::ARRAY, SendMessageDto::class)
            ->withNamingConventions(new SnakeCaseNamingConvention, new CamelCaseNamingConvention);
    }

    private function arrayToChatMessageDto(AutoMapperConfig $config): void
    {
        $config->registerMapping(DataType::ARRAY, ChatMessageDto::class)
            ->withNamingConventions(new SnakeCaseNamingConvention, new CamelCaseNamingConvention);
    }
}
