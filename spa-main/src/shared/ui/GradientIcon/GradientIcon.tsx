interface Props {
  icon: React.ReactNode
}

export const GradientIcon = ({ icon }: Props) => {
  return <div className='w-fit mx-auto relative'>{icon}</div>
}
