import { Component } from "react"
import type { ReactNode } from "react"
import i18n from "@/app/localization/i18n"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      const title = i18n.t("error.title", "Ошибка подключения")
      const description = i18n.t("error.description", "Обновите приложение или попробуйте позже")

      return (
        <div className='absolute bottom-0 left-0 right-0 pt-6 px-4 pb-8 bg-grey-10 rounded-tr-[32px] rounded-tl-[32px] text-center'>
          <h1 className='body-bold mb-2'>{title}</h1>
          <p className='caption1-medium opacity-50'>{description}</p>
        </div>
      )
    }

    return this.props.children
  }
}
