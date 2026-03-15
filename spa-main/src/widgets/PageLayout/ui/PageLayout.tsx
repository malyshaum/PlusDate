import { type ReactNode, type CSSProperties } from "react"
import classNames from "classnames"

interface Props {
  children: ReactNode
  className?: string
  style?: CSSProperties
  shadow?: {
    top: boolean
    bottom: boolean
  }
  ref?: React.Ref<HTMLElement>
}

export const PageLayout = ({ children, className, style, shadow, ref }: Props) => {
  return (
    <main
      className={classNames("px-4 pt-4 flex-1 h-full overflow-y-auto", className)}
      style={style}
      ref={ref}
    >
      {shadow?.top && (
        <div className='h-[170px] absolute inset-0 bottom-auto bg-gradient-to-b from-black to-transparent pointer-events-none' />
      )}
      {children}
      {shadow?.bottom && (
        <div className='h-[97px] absolute inset-0 top-auto bg-gradient-to-t from-black to-transparent pointer-events-none z-1' />
      )}
    </main>
  )
}
