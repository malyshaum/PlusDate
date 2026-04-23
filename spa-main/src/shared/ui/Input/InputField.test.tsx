import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useForm } from "react-hook-form"
import { describe, expect, it, vi } from "vitest"
import { InputField } from "@/shared/ui/Input/InputField.tsx"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

type FormValues = {
  name: string
}

const TestForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
    },
  })

  return (
    <form onSubmit={handleSubmit(() => undefined)}>
      <InputField
        name='name'
        label='Name'
        register={register}
        error={errors.name}
        placeholder='Enter name'
      />
      <button type='submit'>Submit</button>
    </form>
  )
}

describe("InputField integration", () => {
  it("renders label and forwards typing to the input", async () => {
    const user = userEvent.setup()

    render(<TestForm />)

    const input = screen.getByLabelText("Name")

    await user.type(input, "Anna")

    expect(input).toHaveValue("Anna")
    expect(input).toHaveAttribute("aria-invalid", "false")
  })

  it("shows validation error state from react-hook-form", () => {
    const WithError = () => {
      const { register } = useForm<FormValues>()

      return (
        <InputField
          name='name'
          label='Name'
          register={register}
          error={{ type: "required", message: "validation.required" }}
          placeholder='Enter name'
        />
      )
    }

    render(<WithError />)

    expect(screen.getByRole("alert")).toHaveTextContent("validation.required")
    expect(screen.getByLabelText("Name")).toHaveAttribute("aria-invalid", "true")
  })
})
