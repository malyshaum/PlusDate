import { useQuery } from "@tanstack/react-query"
import { getActivities, getCities, getHobbies } from "@/entities/dictionary/api/dictionaries.api.ts"

const DICTIONARY_KEYS = {
  dictionary: "dictionary",
  activity: "activity",
  hobbies: "hobbies",
  cities: "cities",
  location: "location",
}

export const useActivities = (t: (key: string) => string) => {
  return useQuery({
    queryKey: [DICTIONARY_KEYS.dictionary, DICTIONARY_KEYS.activity],
    queryFn: () => getActivities({ text: "" }),
    select: (data) => {
      return (
        data?.map((item) => ({
          id: item.id,
          title: t(`activities.${item.title}`),
          key: item.title,
        })) || []
      )
    },
  })
}

export const useHobbies = (t: (key: string) => string) => {
  return useQuery({
    queryKey: [DICTIONARY_KEYS.dictionary, DICTIONARY_KEYS.hobbies],
    queryFn: () => getHobbies({ text: "" }),
    select: (data) => {
      return (
        data?.map((item) => {
          return {
            value: item.id,
            label: t(`hobbies.${item.title}`),
            icon: item.emoji,
          }
        }) || []
      )
    },
  })
}

export const useCities = (key: string, params?: { latitude?: number; longitude?: number }) => {
  return useQuery({
    queryKey: [DICTIONARY_KEYS.dictionary, DICTIONARY_KEYS.cities, key, params],
    queryFn: () => getCities({ text: key, ...params }),
  })
}

export const useUserLocation = (
  params: { latitude: number; longitude: number },
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: [DICTIONARY_KEYS.dictionary, DICTIONARY_KEYS.location, params],
    queryFn: () => getCities(params),
    enabled: options?.enabled,
  })
}
