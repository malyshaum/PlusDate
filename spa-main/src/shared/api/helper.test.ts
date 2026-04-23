import { describe, expect, it } from "vitest"
import { objectToQueryString } from "@/shared/api/helper.ts"

describe("objectToQueryString", () => {
  it("omits nullish, empty, and false values", () => {
    const query = objectToQueryString({
      page: 1,
      search: "anna",
      empty: "",
      hidden: false,
      optional: undefined,
      nullable: null,
    })

    expect(query).toBe("page=1&search=anna")
  })

  it("serializes numbers and boolean true", () => {
    const query = objectToQueryString({
      premium: true,
      limit: 20,
    })

    expect(query).toBe("premium=true&limit=20")
  })
})
