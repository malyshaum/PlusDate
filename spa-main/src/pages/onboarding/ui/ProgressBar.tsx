import classNames from "classnames"
import { useOnboardingStore } from "@/processes/onboarding/store/onboardingStore.ts"

export const ProgressBar = () => {
  const { step } = useOnboardingStore()

  return (
    <div className='px-4 w-full h-1 overflow-hidden flex gap-1 items-center'>
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className={classNames("bg-white-10 h-full flex-1 rounded-[6px]", {
            "bg-white-100": step > index,
          })}
        />
      ))}
    </div>
  )
}
