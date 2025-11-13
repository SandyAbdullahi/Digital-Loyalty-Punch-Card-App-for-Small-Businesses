import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

interface User {
  id: string
  email: string
  role: string
  name?: string
  avatar_url?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, confirmPassword: string, role: string) => Promise<void>
  logout: () => void
  updateUser: (newUser: User) => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('customer_token')
    const storedUser = localStorage.getItem('customer_user')
    if (storedToken) {
      setToken(storedToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/v1/auth/login', { email, password, role: 'customer' })
      const { access_token, user: userData } = response.data
      setToken(access_token)
      setUser(userData)
      localStorage.setItem('customer_token', access_token)
      localStorage.setItem('customer_user', JSON.stringify(userData))
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    } catch (error: any) {
      // Re-throw with a more user-friendly message
      if (error.response?.status === 401) {
        const errorMessage = error.response?.data?.detail || 'Invalid email or password'
        throw new Error(errorMessage)
      }
      if (error.response?.status === 403) {
        throw new Error('This account cannot be used on the customer app. Please log in through the merchant portal.')
      }
      throw error
    }
  }

  const register = async (email: string, password: string, confirmPassword: string, role: string) => {
    try {
      const response = await axios.post('/api/v1/auth/register', { email, password, confirm_password: confirmPassword, role })
      const { access_token, user: userData } = response.data
      setToken(access_token)
      setUser(userData)
      localStorage.setItem('customer_token', access_token)
      localStorage.setItem('customer_user', JSON.stringify(userData))
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    } catch (error: any) {
      // Re-throw with a more user-friendly message
      if (error.response?.status === 400) {
        throw new Error('Account already exists with this email')
      }
      if (error.response?.status === 403) {
        throw new Error('This account cannot register on the customer app. Please use the merchant portal if you are a merchant.')
      }
      throw error
    }
  }

  const updateUser = (newUser: User) => {
    setUser(newUser)
    localStorage.setItem('customer_user', JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('customer_token')
    localStorage.removeItem('customer_user')
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
