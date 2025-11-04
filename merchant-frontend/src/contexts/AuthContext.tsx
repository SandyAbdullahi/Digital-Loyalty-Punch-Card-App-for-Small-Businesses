import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

interface User {
  id: string
  email: string
  role: string
}

interface Merchant {
  id: string
  display_name: string
  address: string
  phone?: string
  email: string
  logo_url?: string
  description?: string
}

interface AuthContextType {
  user: User | null
  merchant: Merchant | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
  updateMerchant: (merchant: Merchant) => void
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
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    const storedMerchant = localStorage.getItem('merchant')
    if (storedToken) {
      setToken(storedToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
      if (storedMerchant) {
        setMerchant(JSON.parse(storedMerchant))
      }
    }
    setLoading(false)
  }, [])

  const authenticate = async (email: string, password: string) => {
    const response = await axios.post('/api/v1/auth/login-or-register', { email, password, role: 'merchant' })
    const { access_token, user: userData } = response.data
    setToken(access_token)
    setUser(userData)
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(userData))
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    // Fetch merchant data
    try {
      const merchantResponse = await axios.get('/api/v1/merchants/')
      if (merchantResponse.data.length > 0) {
        const merchantData = merchantResponse.data[0]
        setMerchant(merchantData)
        localStorage.setItem('merchant', JSON.stringify(merchantData))
      }
    } catch (error) {
      console.error('Failed to fetch merchant', error)
    }
  }

  const login = (email: string, password: string) => authenticate(email, password)
  const register = (email: string, password: string) => authenticate(email, password)

  const updateUser = (newUser: User) => {
    setUser(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const updateMerchant = (newMerchant: Merchant) => {
    setMerchant(newMerchant)
    localStorage.setItem('merchant', JSON.stringify(newMerchant))
  }

  const logout = () => {
    setUser(null)
    setMerchant(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('merchant')
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, merchant, token, login, register, logout, updateUser, updateMerchant, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
