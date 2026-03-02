export const heightsCm = Array.from({ length: 220 - 100 + 1 }, (_, i) => ({
  label: `${100 + i}`,
  value: `${100 + i}`,
}))

export const getEyeColors = (t: (key: string) => string) => [
  {
    label: t("eyeColors.green"),
    value: "green",
  },
  {
    label: t("eyeColors.blue"),
    value: "blue",
  },
  {
    label: t("eyeColors.grey"),
    value: "grey",
  },
  {
    label: t("eyeColors.brown"),
    value: "brown",
  },
]

export const years = Array.from({ length: 60 - 18 + 1 }, (_, i) => ({
  label: `${18 + i}`,
  value: `${18 + i}`,
}))

export const searchForOptions = (t: (key: string) => string) => [
  { value: "relations", label: t("interests.relations") },
  { value: "friends", label: t("interests.friends") },
  { value: "no_answer", label: t("interests.no_answer") },
]
