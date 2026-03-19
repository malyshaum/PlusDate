import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"
import { PageLayout } from "@/widgets"
import { useChatMessages, useReadMessages } from "@/entities/chats/api/queries"
import { useUser, useExternalUser } from "@/entities/user/api/queries"
import type { IMessage } from "@/entities/chats/model/types"
import { MessageItem } from "./MessageItem"
import { groupMessagesByDate, useChatSocket, useChatPresence, useTypingIndicator } from "../lib"
import classNames from "classnames"
import { debounce, throttle } from "lodash"
import { MessageForm } from "@/pages/chat/ui/MessageForm.tsx"
import { UserCard } from "@/pages/chat/ui/UserCard.tsx"
import { useCentrifugeEvent } from "@/shared/sockets"
import { useQueryClient } from "@tanstack/react-query"
import { ScrollButton } from "@/pages/chat/ui/ScrollButton.tsx"
import { AnimatePresence } from "framer-motion"
import { retrieveLaunchParams, viewport } from "@tma.js/sdk"

export const Chat = () => {
  const launchParams = retrieveLaunchParams()
  const { tgWebAppPlatform: platform } = launchParams
  const { chatId } = useParams<{ chatId: string }>()
  const { data: user } = useUser()
  const currentUserId = user?.id
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const userId = searchParams.get("userId")
  const userIdNum = userId ? parseInt(userId) : undefined
  const { data: externalUser } = useExternalUser(userIdNum)
  const queryClient = useQueryClient()
  const [infiniteScrollEnabled, setInfiniteScrollEnabled] = useState(false)
  const isAtBottomRef = useRef(false)
  const [showScrollButton, setShowScrollButton] = useState(false)

  const handleMatchDeleted = useCallback(
    (data: { user_id: number }) => {
      if (data.user_id === Number(userId)) {
        void navigate("/chats", { replace: true })
      }
    },
    [userId, navigate],
  )

  useCentrifugeEvent<{ user_id: number }>("user.match_deleted", handleMatchDeleted, !!currentUserId)

  const { isOtherUserOnline } = useChatPresence(chatId, userIdNum)
  const { isOtherUserTyping, publishTyping, resetTyping } = useTypingIndicator(chatId, userIdNum)

  const hasInitiallyScrolledRef = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const lastVisibleMessageIdRef = useRef<number | null>(null)
  const lastProcessedMessageIdRef = useRef<number | null>(null)
  const initialFirstUnreadIdRef = useRef<number | null>(null)
  const scrollHeightBeforeFetchRef = useRef<number>(0)
  const previousPageCountRef = useRef<number>(0)

  const {
    data: messagesData,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isLoading,
    isSuccess,
  } = useChatMessages(chatId || "", currentUserId)

  const { addMessageToCache } = useChatSocket(chatId, currentUserId)

  const onSendMessageSuccess = (message: IMessage) => {
    addMessageToCache(message)
    resetTyping()

    setTimeout(() => {
      const container = messagesContainerRef.current
      if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" })
      }
    }, 100)
  }
  const readMessagesMutation = useReadMessages()

  const allMessages = useMemo(() => {
    if (!messagesData?.pages) return []
    return messagesData.pages.flatMap((page) => [...page.data])
  }, [messagesData])

  const firstUnreadMessageId = useMemo(() => {
    const firstUnread = allMessages.find((m) => m.firstUnread)
    return firstUnread?.id || null
  }, [allMessages])

  const sendBatchReadMessages = useCallback(() => {
    const lastVisibleMessageId = lastVisibleMessageIdRef.current

    if (
      !lastVisibleMessageId ||
      lastVisibleMessageId === lastProcessedMessageIdRef.current ||
      !chatId
    ) {
      return
    }

    lastProcessedMessageIdRef.current = lastVisibleMessageId

    readMessagesMutation.mutate(
      {
        chat_id: parseInt(chatId),
        message_id: lastVisibleMessageId,
      },
      {
        onError: () => {
          lastProcessedMessageIdRef.current = null
          lastVisibleMessageIdRef.current = lastVisibleMessageId
        },
        onSuccess: () => {
          lastVisibleMessageIdRef.current = null
        },
      },
    )
  }, [chatId, readMessagesMutation])

  const scheduleBatchSend = useMemo(
    () => debounce(sendBatchReadMessages, 500, { maxWait: 1500 }),
    [sendBatchReadMessages],
  )

  const handleMessageVisible = useCallback(
    (messageId: number) => {
      if (lastProcessedMessageIdRef.current && messageId <= lastProcessedMessageIdRef.current) {
        return
      }

      if (!lastVisibleMessageIdRef.current || messageId > lastVisibleMessageIdRef.current) {
        lastVisibleMessageIdRef.current = messageId
      }

      scheduleBatchSend()
    },
    [scheduleBatchSend],
  )

  const { ref: loadMoreTopRef } = useInView({
    threshold: 0,
    rootMargin: "200px",
    root: messagesContainerRef.current,
    skip: !infiniteScrollEnabled || isFetchingPreviousPage,
    onChange: (inView) => {
      if (inView && hasPreviousPage && !isFetchingPreviousPage && infiniteScrollEnabled) {
        const container = messagesContainerRef.current
        if (container) {
          scrollHeightBeforeFetchRef.current = container.scrollHeight
          previousPageCountRef.current = messagesData?.pages.length || 0
        }

        void fetchPreviousPage()
      }
    },
  })

  const { ref: loadMoreBottomRef } = useInView({
    threshold: 0,
    rootMargin: "200px",
    skip: !infiniteScrollEnabled || isFetchingNextPage,
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage && infiniteScrollEnabled) {
        void fetchNextPage()
      }
    },
  })

  useEffect(() => {
    if (!isLoading && isSuccess && allMessages.length > 0 && !hasInitiallyScrolledRef.current) {
      hasInitiallyScrolledRef.current = true

      if (initialFirstUnreadIdRef.current === null && firstUnreadMessageId) {
        initialFirstUnreadIdRef.current = firstUnreadMessageId
      }

      const container = messagesContainerRef.current
      if (!container) {
        setInfiniteScrollEnabled(true)
        return
      }
      container.scrollTo({ top: container.scrollHeight, behavior: "instant" })

      const lastMessage = allMessages[allMessages.length - 1]
      if (lastMessage && lastMessage.sender_id !== currentUserId && !lastMessage.read_at) {
        setTimeout(() => {
          handleMessageVisible(lastMessage.id)
          scheduleBatchSend.flush()
        }, 100)
      }

      setInfiniteScrollEnabled(true)
    } else if (!isLoading && isSuccess && !hasInitiallyScrolledRef.current) {
      hasInitiallyScrolledRef.current = true
      setInfiniteScrollEnabled(true)
    }
  }, [
    isLoading,
    isSuccess,
    allMessages,
    firstUnreadMessageId,
    currentUserId,
    handleMessageVisible,
    scheduleBatchSend,
  ])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container || !messagesData?.pages) return

    const currentPageCount = messagesData.pages.length
    const hadPreviousFetch =
      previousPageCountRef.current > 0 && currentPageCount > previousPageCountRef.current

    if (hadPreviousFetch && scrollHeightBeforeFetchRef.current > 0 && infiniteScrollEnabled) {
      const scrollHeightAfter = container.scrollHeight
      const scrollDiff = scrollHeightAfter - scrollHeightBeforeFetchRef.current

      container.scrollTop = container.scrollTop + scrollDiff
      scrollHeightBeforeFetchRef.current = 0
      previousPageCountRef.current = 0
    }
  }, [messagesData?.pages, infiniteScrollEnabled])

  useEffect(() => {
    if (hasInitiallyScrolledRef.current) {
      scheduleBatchSend.flush()
    }

    hasInitiallyScrolledRef.current = false
    lastVisibleMessageIdRef.current = null
    lastProcessedMessageIdRef.current = null
    initialFirstUnreadIdRef.current = null
    setInfiniteScrollEnabled(false)

    return () => {
      void queryClient.removeQueries({ queryKey: ["chat-messages", chatId] })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, queryClient])

  useEffect(() => {
    return () => {
      scheduleBatchSend.cancel()
      if (lastVisibleMessageIdRef.current !== null) {
        sendBatchReadMessages()
      }
    }
  }, [scheduleBatchSend, sendBatchReadMessages])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const checkIfAtBottom = () => {
      const threshold = 100
      const isAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <= threshold
      isAtBottomRef.current = isAtBottom
      setShowScrollButton(!isAtBottom)
    }

    const throttledCheck = throttle(checkIfAtBottom, 100)

    checkIfAtBottom()
    container.addEventListener("scroll", throttledCheck)

    return () => {
      container.removeEventListener("scroll", throttledCheck)
      throttledCheck.cancel()
    }
  }, [])

  useEffect(() => {
    if (isAtBottomRef.current && allMessages.length > 0) {
      const container = messagesContainerRef.current
      if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" })
      }
    }
  }, [allMessages.length])

  const messagesByDate = useMemo(() => groupMessagesByDate(allMessages), [allMessages])

  const isOwnMessage = (message: IMessage) => message.sender_id === currentUserId

  const scrollToBottom = useCallback(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" })
    }
  }, [])

  const handleScrollBtnClick = () => {
    setTimeout(scrollToBottom, platform === "ios" ? 100 : 200)
  }

  const openFormRef = useRef<HTMLFormElement>(null)
  const hiddenFormRef = useRef<HTMLFormElement>(null)
  const [isKeyboardOpened, setIsKeyboardOpened] = useState(false)
  const [windowHeight, setWindowHeight] = useState(window.innerHeight)
  const [keyboardHeight, setKeyboardHeight] = useState(platform === "ios" ? windowHeight * 0.4 : 0)

  useEffect(() => {
    setWindowHeight(window.innerHeight)
  }, [])
  const handleInputFocus = () => {
    setTimeout(
      () => {
        scrollToBottom()
      },
      platform === "ios" ? 300 : 600,
    )
    setIsKeyboardOpened(true)
  }

  useEffect(() => {
    if (!openFormRef.current) return

    const input = openFormRef.current.querySelector("textarea")
    if (!input) return
    input.focus()
  }, [isKeyboardOpened])

  const onFocusOut = (e: FocusEvent) => {
    const related = e.relatedTarget as Node | null
    const inside = related && openFormRef.current && openFormRef.current.contains(related)
    if (!inside) {
      setIsKeyboardOpened(false)
    }
  }

  useEffect(() => {
    const visualViewport = window.visualViewport
    const baselineVVRef = { current: visualViewport ? visualViewport.height : null }
    const baselineInnerRef = { current: window.innerHeight }

    const checkViewport = () => {
      const viewportHeight = visualViewport?.height
      const baseVV = baselineVVRef.current ?? visualViewport?.height
      const baseInner = baselineInnerRef.current

      if (!viewportHeight || !baseInner) {
        return
      }

      const deltaVV = baseVV ? baseVV - viewportHeight : 0
      const deltaInner = baseInner - window.innerHeight
      const keyboardHeight = visualViewport ? Math.max(0, deltaVV) : Math.max(0, -deltaInner)

      const isOpen = keyboardHeight > 80

      setIsKeyboardOpened(isOpen)
      if (platform === "android" && !isOpen) {
        setTimeout(() => {
          hiddenFormRef.current?.querySelector("textarea")?.blur()
        }, 300)
      }
      if (keyboardHeight > 0) setKeyboardHeight(keyboardHeight)
    }

    if (visualViewport) baselineVVRef.current = visualViewport.height
    baselineInnerRef.current = window.innerHeight

    checkViewport()

    if (visualViewport) {
      visualViewport.addEventListener("resize", checkViewport)
    }

    document.addEventListener("focusout", onFocusOut, { capture: true })

    return () => {
      document.removeEventListener("focusout", onFocusOut, { capture: true })
      if (visualViewport) {
        visualViewport.removeEventListener("resize", checkViewport)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <PageLayout shadow={{ top: false, bottom: false }}>
      <div
        className={classNames("flex flex-col relative")}
        style={{
          height:
            isKeyboardOpened && platform === "ios"
              ? windowHeight - (keyboardHeight + viewport.safeAreaInsetTop() + 64)
              : "100%",
        }}
      >
        <UserCard user={externalUser} isOtherUserOnline={isOtherUserOnline} />
        <AnimatePresence>
          {showScrollButton && <ScrollButton onClick={handleScrollBtnClick} />}
        </AnimatePresence>
        <div ref={messagesContainerRef} className='flex-1 overflow-y-auto'>
          <div
            className='min-h-full flex flex-col justify-end gap-6'
            style={{
              paddingBottom:
                "calc(var(--tg-viewport-safe-area-inset-bottom, 24px) + 60px + var(--safe-padding))",
            }}
          >
            {hasPreviousPage && !isLoading && !isFetchingPreviousPage && (
              <div ref={loadMoreTopRef} className='h-0 w-full overflow-hidden' />
            )}

            {Object.entries(messagesByDate).map(([date, dateMessages]) => (
              <div key={date}>
                <div className='flex justify-center mb-3'>
                  <span className='text-grey-50 subtitle-medium'>{date}</span>
                </div>

                <div className='space-y-3'>
                  {dateMessages.map((message) => {
                    return (
                      <div key={message.id}>
                        <MessageItem
                          message={message}
                          isOwnMessage={isOwnMessage(message)}
                          onMessageVisible={handleMessageVisible}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {hasNextPage && !isFetchingNextPage && (
              <div ref={loadMoreBottomRef} className='h-0 w-full overflow-hidden' />
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
        {isKeyboardOpened && platform === "ios" && (
          <div onClick={(e) => e.stopPropagation()}>
            <MessageForm
              formRef={openFormRef}
              chatId={chatId}
              onSuccess={onSendMessageSuccess}
              onInputFocus={handleInputFocus}
              isTyping={isOtherUserTyping}
              onTyping={publishTyping}
              typingUserName={externalUser?.name}
              className='!px-0'
            />
          </div>
        )}
      </div>
      {((!isKeyboardOpened && platform === "ios") || platform === "android") && (
        <MessageForm
          formRef={hiddenFormRef}
          chatId={chatId}
          onSuccess={onSendMessageSuccess}
          onInputFocus={handleInputFocus}
          isTyping={isOtherUserTyping}
          typingUserName={externalUser?.name}
          onTyping={publishTyping}
        />
      )}
    </PageLayout>
  )
}
