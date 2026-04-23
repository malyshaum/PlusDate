import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/app/localization/i18n", () => ({
  default: {
    t: (_key: string, fallback?: string) => fallback ?? _key,
  },
}))

import { ErrorBoundary } from "@/app/providers/ErrorBoundary.tsx"

const Crash = () => {
  throw new Error("boom")
}

describe("ErrorBoundary", () => {
  it("renders fallback UI when child crashes", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <Crash />
      </ErrorBoundary>,
    )

    expect(screen.getByText("Ошибка подключения")).toBeInTheDocument()
    expect(screen.getByText("Обновите приложение или попробуйте позже")).toBeInTheDocument()

    consoleError.mockRestore()
  })
})
