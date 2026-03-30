export const getOptions = (t: (key: string) => string) => [
  {
    value: "found_someone",
    label: t("profileDelete.reasons.found_someone"),
    icon: "❤️",
  },
  {
    value: "app_problems",
    label: t("profileDelete.reasons.app_problems"),
    icon: "⚙️",
  },
  {
    value: "too_few_users",
    label: t("profileDelete.reasons.too_few_users"),
    icon: "👀",
  },
  {
    value: "bad_interface",
    label: t("profileDelete.reasons.bad_interface"),
    icon: "🧩",
  },
  {
    value: "bad_profiles",
    label: t("profileDelete.reasons.bad_profiles"),
    icon: "⛔",
  },
  {
    value: "other",
    label: t("profileDelete.reasons.other"),
    icon: "🤔",
  },
]
