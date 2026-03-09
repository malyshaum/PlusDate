import type { ReactNode } from "react"

interface Props {
  icon: ReactNode
  text: string
}

export const IconTextRow = ({ icon, text }: Props) => {
  return (
    <div className='flex items-center gap-4'>
      <div className='h-8 w-8 flex items-center justify-center bg-white-20 rounded-full'>
        {icon}
      </div>
      <div className='flex-1 caption1-medium text-left'>{text}</div>
    </div>
  )
}
