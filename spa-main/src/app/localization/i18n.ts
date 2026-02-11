import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import HttpBackend from "i18next-http-backend"
import LanguageDetector, { type CustomDetector } from "i18next-browser-languagedetector"
import { retrieveLaunchParams } from "@tma.js/sdk"

const languageDetector = new LanguageDetector()
const telegramDetector: CustomDetector = {
  name: "telegram",
  lookup() {
    try {
      const data = retrieveLaunchParams()
      const lang = data?.tgWebAppData?.user?.language_code
      if (!lang) return undefined
      return lang
    } catch (err: unknown) {
      console.error(err, "telegramDetector error")
      return undefined
    }
  },
}
languageDetector.addDetector(telegramDetector)

i18n
  .use(HttpBackend)
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "ru"],
    ns: ["common"],
    defaultNS: "common",
    partialBundledLanguages: true,
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    detection: {
      order: ["localStorage", "telegram", "cookie", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
    interpolation: { escapeValue: false },
  })
  .catch((err) => {
    console.log(err)
  })

export default i18n
