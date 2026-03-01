export const env = {
  mode: import.meta.env.VITE_MODE,
  apiUrl: import.meta.env.VITE_API_URL,
  socket: {
    host: import.meta.env.VITE_SOCKET_HOST,
    port: Number(import.meta.env.VITE_SOCKET_PORT),
    authUrl: import.meta.env.VITE_SOCKET_AUTH_URL,
    wsUrl: import.meta.env.VITE_CENTRIFUGO_WS_URL as string,
  },
  gtm_token: import.meta.env.VITE_GTM_TOKEN,
  maintenanceMode: import.meta.env.VITE_MAINTENANCE_MODE === "true",
} as const
