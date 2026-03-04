import type { ComponentType, JSX } from "react"
import { AnimatePresence } from "framer-motion"
import PageTransitionUltimate, {
  type AnimationType,
} from "@/features/PageTransitionUltimate/PageTransitionUltimate"

export function withPageTransition<P extends object>(
  Component: ComponentType<P>,
  key: string,
  type: AnimationType = "fade",
): ComponentType<P> {
  return (props: P): JSX.Element => (
    <AnimatePresence mode='wait'>
      <PageTransitionUltimate type={type} key={key}>
        <Component {...props} />
      </PageTransitionUltimate>
    </AnimatePresence>
  )
}
