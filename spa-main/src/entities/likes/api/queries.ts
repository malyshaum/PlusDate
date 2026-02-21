import type { InfiniteData } from "@tanstack/react-query"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchLikes, respondToLike } from "./api"
import type { Match, SwipeAction } from "@/features/SwipeCards/model/types.ts"
import { useUserGTMEvent } from "@/entities/user/lib/useUserGTMEvent.ts"
import { USER_KEYS, useUser } from "@/entities/user/api/queries.ts"
import type { ILike } from "@/entities/likes/model/types.ts"
import type { IUser, IUserStats } from "@/entities/user/model/types.ts"
import type { PaginatedResponse } from "@/shared/types/api"
import { FEED_QUERY_KEYS } from "@/features/SwipeCards/api/queries"

export const LIKES_QUERY_KEY = ["likes", false] as const
export const STATS_QUERY_KEY = [USER_KEYS.user, "stats"] as const

export const useLikes = (only_mutual?: boolean, enabled = true) => {
  return useInfiniteQuery({
    queryKey: ["likes", only_mutual],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      fetchLikes(pageParam, only_mutual),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.meta.has_more ? lastPage.meta.next_cursor : undefined
    },
    refetchOnMount: "always",
    enabled,
  })
}

export const useRespondToLikeMutation = ({
  onSuccess,
}: { onSuccess?: (res: Match) => void } = {}) => {
  const queryClient = useQueryClient()
  const sendUserEvent = useUserGTMEvent()
  const { data: user } = useUser()

  return useMutation({
    mutationKey: ["respondToLike"],
    mutationFn: ({ profileId, action }: { profileId: number; action: SwipeAction; userId: number }) => {
      return respondToLike(profileId, action)
    },
    onMutate: async ({ userId }) => {
      await queryClient.cancelQueries({ queryKey: LIKES_QUERY_KEY })
      await queryClient.cancelQueries({ queryKey: STATS_QUERY_KEY })

      const previousLikes = queryClient.getQueryData<InfiniteData<PaginatedResponse<ILike>>>(LIKES_QUERY_KEY)
      const previousStats = queryClient.getQueryData<IUserStats>(STATS_QUERY_KEY)

      queryClient.setQueryData<InfiniteData<PaginatedResponse<ILike>>>(
        LIKES_QUERY_KEY,
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((like) => like.user_id !== userId),
            })),
          }
        },
      )

      queryClient.setQueryData<InfiniteData<PaginatedResponse<IUser>>>(
        FEED_QUERY_KEYS.profiles(),
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((profile) => profile.id !== userId),
            })),
          }
        },
      )

      if (previousStats) {
        queryClient.setQueryData<IUserStats>(STATS_QUERY_KEY, {
          ...previousStats,
          unresolved_likes: Math.max(0, previousStats.unresolved_likes - 1),
        })
      }

      return { previousLikes, previousStats }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousLikes) {
        queryClient.setQueryData(LIKES_QUERY_KEY, context.previousLikes)
      }
      if (context?.previousStats) {
        queryClient.setQueryData(STATS_QUERY_KEY, context.previousStats)
      }
    },
    onSuccess: (res, context) => {
      if (context?.action && user?.feed_profile) {
        sendUserEvent({
          event: "swipe",
          action: context.action,
          age: user.feed_profile.age,
          gender: user.feed_profile.sex,
        })
      }

      onSuccess?.(res)
    },
  })
}
