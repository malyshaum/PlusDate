import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchFeedProfiles, swipeProfile, revertDislike, deleteMatch, viewMatch } from "./api"
import type { Match, SwipeAction } from "../model/types"
import { USER_KEYS, useUser } from "@/entities/user/api/queries.ts"
import type { IUserLimits, IUserStats } from "@/entities/user/model/types.ts"
import { useUserGTMEvent } from "@/entities/user/lib/useUserGTMEvent.ts"

export const FEED_QUERY_KEYS = {
  all: ["swipe-feed"] as const,
  profiles: () => [...FEED_QUERY_KEYS.all, "profiles"] as const,
}

export const useSwipeFeed = () => {
  return useInfiniteQuery({
    queryKey: FEED_QUERY_KEYS.profiles(),
    queryFn: ({ pageParam }: { pageParam: string | undefined }) => fetchFeedProfiles(pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.meta.has_more ? lastPage.meta.next_cursor : undefined
    },
    select: (data) => {
      const seen = new Set<number>()
      return {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          data: page.data.filter((profile) => {
            if (seen.has(profile.id)) return false
            seen.add(profile.id)
            return true
          }),
        })),
      }
    },
  })
}

export const useSwipeProfile = ({ onSuccess }: { onSuccess?: (res: Match) => void } = {}) => {
  const queryClient = useQueryClient()
  const sendUserEvent = useUserGTMEvent()
  const { data: user } = useUser()

  return useMutation({
    mutationFn: ({ profileId, action }: { profileId: number; action: SwipeAction }) => {
      return swipeProfile(profileId, action)
    },
    onMutate: ({ action }) => {
      const previousLimits = queryClient.getQueryData<IUserLimits>([
        USER_KEYS.user,
        USER_KEYS.limits,
      ])

      if (previousLimits) {
        queryClient.setQueryData<IUserLimits>([USER_KEYS.user, USER_KEYS.limits], (old) => {
          if (!old) return old

          switch (action) {
            case "like":
              return { ...old, likes: old.likes + 1, is_on_cooldown: false }
            case "superlike":
              return { ...old, superlikes: old.superlikes + 1, is_on_cooldown: false }
            case "dislike":
              return old
            default:
              return old
          }
        })
      }

      return { previousLimits }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousLimits) {
        queryClient.setQueryData([USER_KEYS.user, USER_KEYS.limits], context.previousLimits)
      } else {
        void queryClient.invalidateQueries({
          queryKey: [USER_KEYS.user, USER_KEYS.limits],
        })
      }
    },
    onSuccess: async (res, context) => {
      const limits = queryClient.getQueryData<IUserLimits>([USER_KEYS.user, USER_KEYS.limits])

      if (limits && context.action !== "dislike") {
        const remaining =
          context.action === "like"
            ? limits.likes_day_limit - limits.likes
            : limits.superlikes_day_limit - limits.superlikes

        if (remaining <= 0) {
          void queryClient.invalidateQueries({
            queryKey: [USER_KEYS.user, USER_KEYS.limits],
          })
        }

        const likesRemaining = limits.likes_day_limit - limits.likes
        const superlikesRemaining = limits.superlikes_day_limit - limits.superlikes
        if (likesRemaining <= 0 && superlikesRemaining <= 0) {
          await queryClient.invalidateQueries({
            queryKey: FEED_QUERY_KEYS.profiles(),
          })
        }
      }

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

export const useRevertDislike = () => {
  const sendUserEvent = useUserGTMEvent()

  return useMutation({
    mutationFn: ({ swipeId }: { swipeId: number }) => {
      return revertDislike(swipeId)
    },
    onSuccess: () => {
      sendUserEvent({ event: "revert_like" })
    },
  })
}

export const useDeleteProfileMatch = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (profileId: number) => {
      return deleteMatch(profileId)
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: [USER_KEYS.user, "stats"] })

      const previousStats = queryClient.getQueryData<IUserStats>([USER_KEYS.user, "stats"])

      if (previousStats) {
        queryClient.setQueryData<IUserStats>([USER_KEYS.user, "stats"], {
          ...previousStats,
          matches: Math.max(0, previousStats.matches - 1),
        })
      }

      return { previousStats }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousStats) {
        queryClient.setQueryData([USER_KEYS.user, "stats"], context.previousStats)
      }
    },
    onSuccess: () => {
      onSuccess?.()
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: [USER_KEYS.user, "stats"] })
    },
  })
}

export const useViewProfileMatch = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (profileId: number) => {
      return viewMatch(profileId)
    },
    onMutate: () => {
      const previousStats = queryClient.getQueryData<IUserStats>([USER_KEYS.user, "stats"])
      if (previousStats) {
        queryClient.setQueryData<IUserStats>([USER_KEYS.user, "stats"], {
          ...previousStats,
          unviewed_matches: Math.max(0, previousStats.unviewed_matches - 1),
        })
      }

      return { previousStats }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousStats) {
        queryClient.setQueryData([USER_KEYS.user, "stats"], context.previousStats)
      }
    },
    onSuccess: () => {
      onSuccess?.()
    },
  })
}
