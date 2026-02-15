interface Window {
  Telegram: {
    WebApp: {
      initDataUnsafe: {
        user?: {
          id: number
          first_name?: string
          last_name?: string
          username?: string
          language_code?: string
          allows_write_to_pm?: boolean
          photo_url?: string
        }
      }
    }
  }
  dataLayer: Array<any>
}
