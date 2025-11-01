import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { vi } from 'vitest'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
})

function TestComponent() {
  const { user, login, logout, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  return (
    <div>
      {user ? (
        <div>
          <span>Welcome {user.email}</span>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => login('test@example.com', 'password')}>Login</button>
      )}
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('renders login button when not authenticated', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('logs in successfully', async () => {
    const user = userEvent.setup()
    mockedAxios.post.mockResolvedValue({
      data: {
        access_token: 'token123',
        user: { id: '1', email: 'test@example.com', role: 'customer' }
      }
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByText('Login')).toBeInTheDocument()

    await act(async () => {
      await user.click(screen.getByText('Login'))
    })

    await waitFor(() => {
      expect(screen.getByText('Welcome test@example.com')).toBeInTheDocument()
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'token123')
  })

  it('logs out', async () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'token') return 'token123'
      if (key === 'user') return JSON.stringify({ id: '1', email: 'test@example.com', role: 'customer' })
      return null
    })

    const user = userEvent.setup()

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Welcome test@example.com')).toBeInTheDocument()
    })

    await act(async () => {
      await user.click(screen.getByText('Logout'))
    })

    await waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument()
    })

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
  })
})