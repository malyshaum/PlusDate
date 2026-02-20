import { useState, useCallback } from "react"
import { locationManager } from "@tma.js/sdk-react"

interface GeolocationState {
  position: GeolocationPosition | null
}

export const useUserLocation = () => {
  const [geolocationState, setGeolocationState] = useState<GeolocationState>({
    position: null,
  })

  const getCurrentLocation = useCallback(async () => {
    if (!locationManager.isSupported() || !locationManager.isMounted()) {
      setGeolocationState({
        position: null,
      })
      return
    }

    try {
      const location = await locationManager.requestLocation()

      if (!location) {
        setGeolocationState({
          position: null,
        })
        return
      }

      const coords: GeolocationCoordinates = {
        latitude: location.latitude,
        longitude: location.longitude,
        altitude: location.altitude ?? null,
        accuracy: location.horizontal_accuracy ?? 0,
        altitudeAccuracy: location.vertical_accuracy ?? null,
        heading: location.course ?? null,
        speed: location.speed ?? null,
        toJSON() {
          return {
            latitude: this.latitude,
            longitude: this.longitude,
            altitude: this.altitude,
            accuracy: this.accuracy,
            altitudeAccuracy: this.altitudeAccuracy,
            heading: this.heading,
            speed: this.speed,
          }
        },
      }

      const position: GeolocationPosition = {
        coords,
        timestamp: Date.now(),
        toJSON() {
          return {
            coords: this.coords,
            timestamp: this.timestamp,
          }
        },
      }

      setGeolocationState({
        position,
      })
    } catch {
      setGeolocationState({
        position: null,
      })
    }
  }, [])

  return {
    getCurrentLocation,
    position: geolocationState.position,
  }
}
