import axios from "axios"
import Cookies from "js-cookie"
import { env } from "@/shared/config/env"
import { retrieveRawInitData } from "@tma.js/sdk-react"

const api = axios.create({
  baseURL: env.apiUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

let authFailureCallback: ((error: Error) => void) | null = null

export const setAuthFailureCallback = (callback: (error: Error) => void) => {
  authFailureCallback = callback
}

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

api.interceptors.request.use(
  (config) => {
    const authToken = Cookies?.get("auth_token")
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`
    }
    return config
  },
  (rawError: unknown) => {
    let err: Error

    if (rawError instanceof Error) {
      err = rawError
    } else {
      const message = typeof rawError === "string" ? rawError : JSON.stringify(rawError)
      err = new Error(message)
    }
    return Promise.reject(err)
  },
)

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config

    if (error?.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const initData = retrieveRawInitData()

        if (!initData) {
          const error = new Error("No Telegram init data available for re-authentication")
          processQueue(error)
          isRefreshing = false
          return Promise.reject(error)
        }

        const data = (await api.post("/login", {
          query: initData,
        })) as { token: string }

        Cookies.set("auth_token", data.token)

        originalRequest.headers.Authorization = `Bearer ${data.token}`

        processQueue()
        isRefreshing = false

        return api(originalRequest)
      } catch (loginError) {
        Cookies.remove("auth_token")
        const authError = new Error("Authentication failed. Please reload the application.")
        processQueue(authError)
        isRefreshing = false

        if (authFailureCallback) {
          authFailureCallback(authError)
        }

        return Promise.reject(authError)
      }
    }

    const finalError = error instanceof Error ? error : new Error(String(error))
    return Promise.reject(finalError)
  },
)

export default api
