import type { ICity } from "@/entities/dictionary/model/types.ts"
import type { IUserSearchFor } from "@/entities/user/model/types.ts"

export const getSearchForLabel = (
  searchFor: IUserSearchFor,
  t: (key: string) => string,
): string => {
  return t(`interests.${searchFor}`)
}

export const getCityName = (city: ICity | undefined, locale: string): string => {
  if (!city) return ""
  return locale === "ru" ? city.ru_name : city.en_name
}
