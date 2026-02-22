interface Props {
  src: string | null | undefined
  className?: string
}

export const UserSelfie = ({ src }: Props) => {
  return (
    <div className='h-10 w-10 rounded-full bg-grey-6 flex items-center justify-center overflow-hidden'>
      {src ? (
        <img src={src} alt='User Selfie' className='h-full w-full object-cover' />
      ) : (
        <div className='h-5 w-5 bg-grey-4 rounded-full' />
      )}
    </div>
  )
}
