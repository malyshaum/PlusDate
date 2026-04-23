import { describe, expect, it } from "vitest"
import { isValidName } from "@/shared/lib/validateName.ts"

describe("isValidName", () => {
  it("accepts valid latin and cyrillic names", () => {
    expect(isValidName("Anna Maria")).toBe(true)
    expect(isValidName("Ольга")).toBe(true)
    expect(isValidName("Jean-Luc")).toBe(true)
    expect(isValidName("O'Connor")).toBe(true)
  })

  it("rejects empty, too long, and invalid names", () => {
    expect(isValidName("")).toBe(false)
    expect(isValidName("   ")).toBe(false)
    expect(isValidName("A".repeat(51))).toBe(false)
    expect(isValidName("John_123")).toBe(false)
  })
})
