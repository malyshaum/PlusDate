export const getOptions = (t: (key: string) => string) => [
  {
    value: "inappropriate_content",
    label: t("profileReport.reasons.inappropriate_content"),
    emoji: "🔞",
  },
  {
    value: "fake_profile",
    label: t("profileReport.reasons.fake_profile"),
    emoji: "🤖",
  },
  {
    value: "scam",
    label: t("profileReport.reasons.scam"),
    emoji: "💰",
  },
  {
    value: "spam_or_advertisement",
    label: t("profileReport.reasons.spam_or_advertisement"),
    emoji: "📣",
  },
  {
    value: "other",
    label: t("profileReport.reasons.other"),
    emoji: "🤔",
  },
]

export type ReportSource = "swipe_feed" | "like_profile" | "chat_profile" | "chat"
