<?php

namespace App\Enums\Core;

use App\Enums\BaseEnumTrait;

enum ErrorMessageEnum: string
{
    use BaseEnumTrait;

    case VALIDATION_INVALID = 'validation.invalid';
    case VALIDATION_NOT_NUMERIC = 'validation.not_numeric';
    case TELEGRAM_AUTH_ERROR = 'auth.telegram.error';
    case ENTITY_DOESNT_EXISTS_ERROR = 'entity.doesnt_exists.error';
    case CANT_UPDATE_ENTITY_VALIDATION = 'entity.validation.cant_update';
    case VALIDATION_PROFILE_ON_MODERATION = 'validation.profile.on_moderation';
    case ERROR_FILE_IS_MISSING = 'error.file_is_missing';
    case API_IMMAGA_ERROR = 'api.immaga.error';
    case API_IMMAGA_FACE_NOT_FOUND = 'api.immaga.face.not_found';
    case VALIDATION_WRONG_NUMBER_OF_PHOTOS = 'validation.wrong_number_of_photos';
    case VALIDATION_DUPLICATE_PHOTOS = 'validation.duplicate_photos';
    case VALIDATION_NO_VERIFICATION_PHOTO_PROVIDED = 'validation.no_verification_photo_provided';
    case ERROR_NO_VERIFICATION_PHOTO = 'error.no_verification_photo';
    case VALIDATION_USER_ALREADY_ONBOARDED = 'validation.user_already_onboarded';
    case ERROR_WHILE_DELETING_FILE = 'error.delete_file';
    case ERROR_WHILE_UPLOADING_FILE = 'error.uploading_file';
    case VALIDATION_SWIPE_ALREADY_EXISTS = 'validation.swipe.already_exists';
    case ERROR_NO_SEARCH_PREFERENCES = 'error.no_search_preferences_provided';
    case VALIDATION_USER_DOES_NOT_HAVE_FEED_PROFILE = 'validation.user_does_not_have_feed_profile';
    case VALIDATION_NOT_VALID_SWIPE = 'validation.not_valid_swipe';
    case API_TELEGRAM_CREATE_INVOICE_ERROR = 'api.telegram.create_invoice_link.error';
    case VALIDATION_TRIAL_ALREADY_USED = 'validation.trial.already_used';
    case TRIAL_NO_LONGER_AVAILABLE = 'validation.trial.no_longer_available';
    case VALIDATION_USER_CANT_SEE_PROFILE = 'validation.user_cant_see_profile';
    case APP_PAYMENT_ERROR = 'error.payment';
    case VALIDATION_SWIPES_DAY_LIMIT_REACHED = 'validation.swipe.day_limit_reached';
    case VALIDATION_PREMIUM_REQUIRED = 'validation.premium_required';
    case ADMIN_INVALID_CONFIG_KEY = 'admin.invalid_config_key';
    case ERROR_FILE_IS_INVALID = 'error.file_is_invalid';
    case VALIDATION_PHOTO_ALREADY_WAS_UPDATED = 'validation.photo.already_updated';
    case VALIDATION_NO_ACTIVE_SUBSCRIPTION = 'validation.no_active_subscription';
    case VALIDATION_VIDEO_ALREADY_EXISTS = 'validation.video.already_exists';
    case VALIDATION_PARENT_VIDEO_NOT_EXISTS = 'validation.video.parent_not_exists';
    case VALIDATION_USER_DONT_HAVE_NEEDED_FILES = 'validation.user_dont_have_needed_files';
    case ACCOUNT_ALREADY_DELETED = 'account.already_deleted';
    case RESTORE_PERIOD_EXPIRED = 'account.restore_period_expired';
    case ACCOUNT_NOT_FOUND = 'account.not_found';
    case ACCOUNT_WAS_DELETED = 'account.deleted';
    case BLOCK_ACCOUNT_MYSELF = 'block_account_myself';
}
