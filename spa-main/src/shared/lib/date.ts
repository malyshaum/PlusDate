import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

export const formatTimeAgo = (date: string) => {
  const messageDate = dayjs(date)
  const now = dayjs()

  if (messageDate.isSame(now, "day")) {
    return messageDate.format("HH:mm")
  }

  if (messageDate.isSame(now, "week")) {
    return messageDate.format("ddd")
  }

  return messageDate.format("DD/MM")
}

export const formatDate = (date: string, format: string) => {
  return dayjs(date).format(format)
}

export { dayjs }
