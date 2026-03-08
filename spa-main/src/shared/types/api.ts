import type { AxiosResponse, AxiosError } from "axios"

export type TSuccessResponse<T> = AxiosResponse<T>

export type TErrorResponse<D = unknown> = AxiosError<D>

export interface PaginationMeta {
  cursor?: string
  has_more?: boolean
  next_cursor?: string
  prev_cursor?: string
  total?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}
