import type { QueryClient, InfiniteData } from "@tanstack/react-query"
import type { PaginatedResponse } from "@/shared/types/api"

export function prependToInfiniteQuery<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  item: T,
) {
  queryClient.setQueryData<InfiniteData<PaginatedResponse<T>>>(
    queryKey,
    (old) => {
      if (!old) return old
      return {
        ...old,
        pages: old.pages.map((page, i) =>
          i === 0 ? { ...page, data: [item, ...page.data] } : page,
        ),
      }
    },
  )
}