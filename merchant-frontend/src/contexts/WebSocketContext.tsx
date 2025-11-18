import React, { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react'
import { useAuth } from './AuthContext'

interface WebSocketContextType {
  isConnected: boolean
  lastMessage: Record<string, unknown> | null
  redeemNotifications: RedeemNotification[]
  markRedeemNotificationAsRead: (notificationId: string) => void
  unreadRedeemCount: number
}

interface RedeemNotification {
  id: string
  customer_name: string
  program_name: string
  stamps_redeemed: number
  code: string
  reward_id: string
  timestamp: string
  read?: boolean
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (!context) throw new Error('useWebSocket must be used within WebSocketProvider')
  return context
}

interface WebSocketProviderProps {
  children: ReactNode
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { user, token } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<Record<string, unknown> | null>(null)
  const [redeemNotifications, setRedeemNotifications] = useState<RedeemNotification[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const buildWebSocketUrl = (userId: string): string | null => {
    let base =
      (typeof import.meta !== 'undefined' &&
        (import.meta as any).env?.VITE_API_URL) ||
      (typeof window !== 'undefined' ? window.location.origin : '')

    if (!base) return null

    try {
      const url = new URL(base)
      const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
      return `${wsProtocol}//${url.host}/api/v1/ws/merchant/${userId}`
    } catch {
      return null
    }
  }

  const connect = useCallback(() => {
    if (!user || !token) return

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close()
    }

    const wsUrl = buildWebSocketUrl(user.id)
    if (!wsUrl) {
      console.warn('Unable to determine WebSocket URL for merchant')
      return
    }
    console.log('Connecting to merchant WebSocket:', wsUrl)

    try {
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        console.log('Merchant WebSocket connected')
        setIsConnected(true)
        reconnectAttempts.current = 0
      }

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          console.log('Merchant WebSocket message received:', message)
          setLastMessage(message)

          if (message.type === 'redeem_request') {
            // Add new redeem notification
            const notification: RedeemNotification = {
              id: `${message.code}_${Date.now()}`, // Unique ID
              customer_name: message.customer_name,
              program_name: message.program_name,
              stamps_redeemed: message.stamps_redeemed,
              code: message.code,
              reward_id: String(message.reward_id ?? ''),
              timestamp: new Date().toISOString(),
              read: false
            }
            setRedeemNotifications((prev: RedeemNotification[]) => [notification, ...prev])
          }
        } catch (error) {
          console.error('Failed to parse merchant WebSocket message:', error)
        }
      }

      wsRef.current.onclose = (event) => {
        console.log('Merchant WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          console.log(`Attempting to reconnect merchant WebSocket in ${delay}ms...`)
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++
            connect()
          }, delay)
        }
      }

      wsRef.current.onerror = (error) => {
        console.error('Merchant WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to create merchant WebSocket connection:', error)
    }
  }, [user, token])

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Component unmounting')
      wsRef.current = null
    }

    setIsConnected(false)
  }

  const markRedeemNotificationAsRead = (notificationId: string) => {
    setRedeemNotifications((prev: RedeemNotification[]) =>
      prev.map((notification: RedeemNotification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  // Connect when user logs in
  useEffect(() => {
    if (user && token) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [user, token, connect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [])

  const unreadRedeemCount = redeemNotifications.filter(n => !n.read).length

  const value: WebSocketContextType = {
    isConnected,
    lastMessage,
    redeemNotifications,
    markRedeemNotificationAsRead,
    unreadRedeemCount
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}
