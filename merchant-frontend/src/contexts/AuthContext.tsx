import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import axios from 'axios'
import { applyTheme, extractThemeFromSettings } from '../utils/theme'

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
  loginDeveloperWithCredentials: (email: string, password: string) => Promise<void>
  register: (
    email: string,
    password: string,
    confirmPassword: string,
    analytics?: { averageSpendPerVisit?: number; baselineVisitsPerPeriod?: number; rewardCostEstimate?: number }
  ) => Promise<void>
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
    try {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      const storedMerchant = localStorage.getItem('merchant')
      const storedTheme = localStorage.getItem('merchantTheme')

      if (storedToken) {
        setToken(storedToken)
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser))
          } catch {
            // ignore bad user JSON
          }
        }
        if (storedMerchant) {
          try {
            setMerchant(JSON.parse(storedMerchant))
          } catch {
            // ignore bad merchant JSON
          }
        }
      }

      if (storedTheme) {
        try {
          applyTheme(JSON.parse(storedTheme))
        } catch {
          // ignore invalid theme
        }
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const loadAndApplyTheme = async (merchantId: string) => {
    try {
      const settingsResponse = await axios.get(`/api/v1/merchants/${merchantId}/settings`)
      const themePayload = extractThemeFromSettings(settingsResponse.data)
      localStorage.setItem('merchantTheme', JSON.stringify(themePayload))
      applyTheme(themePayload)
    } catch (error) {
      console.error('Failed to load merchant theme settings', error)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/v1/auth/login', { email, password, role: 'merchant' })
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
          await loadAndApplyTheme(merchantData.id)
        }
      } catch (error) {
        console.error('Failed to fetch merchant', error)
      }
    } catch (error: any) {
      // Re-throw with a more user-friendly message
      if (error.response?.status === 401) {
        const errorMessage = error.response?.data?.detail || 'Invalid email or password'
        throw new Error(errorMessage)
      }
      if (error.response?.status === 403) {
        throw new Error('This account is not allowed to log in to the merchant portal. Please use the customer app instead.')
      }
      throw error
    }
  }

  const register = async (
    email: string,
    password: string,
    confirmPassword: string,
    analytics?: { averageSpendPerVisit?: number; baselineVisitsPerPeriod?: number; rewardCostEstimate?: number }
  ) => {
    try {
      const response = await axios.post('/api/v1/auth/register', {
        email,
        password,
        confirm_password: confirmPassword,
        role: 'merchant',
        average_spend_per_visit: analytics?.averageSpendPerVisit,
        baseline_visits_per_period: analytics?.baselineVisitsPerPeriod,
        reward_cost_estimate: analytics?.rewardCostEstimate
      })
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
          await loadAndApplyTheme(merchantData.id)
        }
      } catch (error) {
        console.error('Failed to fetch merchant', error)
      }
    } catch (error: any) {
      // Re-throw with a more user-friendly message
      if (error.response?.status === 400) {
        throw new Error('Account already exists with this email')
      }
      if (error.response?.status === 403) {
        throw new Error('This account cannot be used on the merchant portal. Please sign up as a merchant or log in through the customer app.')
      }
      throw error
    }
  }

  const updateUser = useCallback((newUser: User) => {
    setUser(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
  }, [])

  const updateMerchant = useCallback((newMerchant: Merchant) => {
    setMerchant(newMerchant)
    localStorage.setItem('merchant', JSON.stringify(newMerchant))
  }, [])

  // Dev-only helper to gate the developer portal until backend support exists.
  const DEV_EMAIL = 'ab2d222@gmail.com'
  const DEV_PASSWORD = 'mypassword101'
  const loginDeveloperWithCredentials = useCallback(async (email: string, password: string) => {
    if (email !== DEV_EMAIL || password !== DEV_PASSWORD) {
      throw new Error('Invalid developer credentials')
    }
    const devUser = { id: 'dev-1', email: DEV_EMAIL, role: 'developer' }
    const devToken = 'developer-mock-token'
    setUser(devUser)
    setMerchant(null)
    setToken(devToken)
    localStorage.setItem('user', JSON.stringify(devUser))
    localStorage.setItem('token', devToken)
    delete axios.defaults.headers.common['Authorization']
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setMerchant(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('merchant')
    delete axios.defaults.headers.common['Authorization']
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        merchant,
        token,
        login,
        register,
        logout,
        updateUser,
        updateMerchant,
        loading,
        loginDeveloperWithCredentials,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
