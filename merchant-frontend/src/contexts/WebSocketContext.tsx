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

  const connect = useCallback(() => {
    if (!user || !token) return

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close()
    }

    const wsUrl = `ws://localhost:8000/api/v1/ws/merchant/${user.id}`
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
              timestamp: new Date().toISOString(),
              read: false
            }
            setRedeemNotifications(prev => [notification, ...prev])
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
    setRedeemNotifications(prev =>
      prev.map(notification =>
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