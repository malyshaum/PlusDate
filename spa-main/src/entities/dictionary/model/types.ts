export interface ICity {
  id: number
  en_country_name: string
  en_name: string
  ru_country_name: string
  ru_name: string
}

export interface IHobby {
  id: number
  title: string
  emoji?: string
}

export interface IActivity {
  id: number
  title: string
  key?: string
}
