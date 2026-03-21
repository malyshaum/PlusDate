import { PageLayout } from "@/widgets"
import { SwipeFeed } from "@/features/SwipeCards"

export const FeedPage = () => {
  return (
    <PageLayout className='!px-2 !pt-3 pb-safe-area-bottom-with-menu'>
      <SwipeFeed />
    </PageLayout>
  )
}
