export {}

declare global {
  interface MediaTrackCapabilities {
    torch?: boolean
  }

  interface MediaTrackConstraintSet {
    torch?: boolean
  }

  interface MediaTrackConstraints {
    torch?: boolean
  }
}
