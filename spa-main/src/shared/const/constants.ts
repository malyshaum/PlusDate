export const MAX_IMAGE_FILE_SIZE = 100 * 1024 * 1024
export const MAX_VIDEO_FILE_SIZE = 100 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/heif",
  "image/heic",
]
export const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime", // .mov
  "video/hevc", // .hevc
]

export const UserModerationReasons = {
  1: "rejectionReasons.bad_photo_quality",
  2: "rejectionReasons.face_not_detected",
  3: "rejectionReasons.violation_of_internal_rules",
  4: "rejectionReasons.nsfw_content",
  5: "rejectionReasons.general_reason",
  6: "rejectionReasons.bad_photo_quality",
  7: "rejectionReasons.face_not_detected",
  8: "rejectionReasons.nsfw_content",
  9: "rejectionReasons.face_from_verification_photo_not_found",
  10: "rejectionReasons.user_profile_photo_face_from_verification_photo_not_found",
  11: "rejectionReasons.declined_by_admin",
  12: "rejectionReasons.internal_error",
  13: "rejectionReasons.video_inappropriate",
  14: "rejectionReasons.name_inappropriate",
  15: "rejectionReasons.description_inappropriate",
  16: "rejectionReasons.instagram_inappropriate",
} as const

// case BAD_PHOTO_QUALITY = 1;
// case FACE_NOT_DETECTED = 2;
// case VIOLATION_OF_INTERNAL_RULES  = 3;
// case NSFW_CONTENT = 4;
// case GENERAL_REASON = 5;
// case USER_PROFILE_PHOTO_BAD_PHOTO_QUALITY = 6;
// case USER_PROFILE_PHOTO_FACE_NOT_DETECTED = 7;
// case USER_PROFILE_PHOTO_NSFW_CONTENT = 8;
// case FACE_FROM_VERIFICATION_PHOTO_NOT_FOUND = 9;
// case USER_PROFILE_PHOTO_FACE_FROM_VERIFICATION_PHOTO_NOT_FOUND = 10;
// case DECLINED_BY_ADMIN = 11;
// case VIDEO_INAPPROPRIATE = 13;
// case NAME_INAPPROPRIATE = 14;
// case DESCRIPTION_INAPPROPRIATE = 15;
// case INSTAGRAM_INAPPROPRIATE = 16;
