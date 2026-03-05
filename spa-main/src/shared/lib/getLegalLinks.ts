const termsLinks: Record<string, string> = {
  en: "https://docs.google.com/document/d/1fx-MuvvB50afYuwFrJqwsznSNsSaS2BnBq-W90b1BQE/edit?usp=sharing",
  ru: "https://docs.google.com/document/d/18yUoihTs4ELOboHr9xqCA7iwVwu3GuFExRFmPQ4sWzY/edit?usp=sharing",
}

const privacyLinks: Record<string, string> = {
  en: "https://docs.google.com/document/d/1Kq_bzkNxzRB9vXofx9oJhAGSYnFETHqMO6TNzAPZ8dM/edit?usp=sharing",
  ru: "https://docs.google.com/document/d/1aETadT4qQSXcOISZCYXzhf7-5r_tw2FzJWuooWhvFlA/edit?usp=sharing",
}

const DEFAULT_LOCALE = "en"

export const getTermsLink = (locale: string): string => {
  return termsLinks[locale] || termsLinks[DEFAULT_LOCALE]
}

export const getPrivacyLink = (locale: string): string => {
  return privacyLinks[locale] || privacyLinks[DEFAULT_LOCALE]
}
