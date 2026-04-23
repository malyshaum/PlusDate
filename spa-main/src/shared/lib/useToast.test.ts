import { beforeEach, describe, expect, it } from "vitest"
import { useToast } from "@/shared/lib/useToast.ts"

describe("useToast store", () => {
  beforeEach(() => {
    useToast.setState({ toasts: [] })
  })

  it("stores only the latest toast", () => {
    useToast.getState().showToast({ text: "First" })
    useToast.getState().showToast({ text: "Second" })

    const { toasts } = useToast.getState()

    expect(toasts).toHaveLength(1)
    expect(toasts[0]?.text).toBe("Second")
  })

  it("removes toast by id", () => {
    useToast.getState().showToast({ text: "Toast" })
    const toastId = useToast.getState().toasts[0]?.id

    expect(toastId).toBeDefined()

    useToast.getState().hideToast(toastId!)

    expect(useToast.getState().toasts).toHaveLength(0)
  })
})
