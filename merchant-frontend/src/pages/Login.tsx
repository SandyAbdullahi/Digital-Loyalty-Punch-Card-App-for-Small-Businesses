import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button, TextInput } from '@mantine/core'
import { AlertTriangle } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDF6EC] p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img
            src="/logo-1.png"
            alt="Rudi"
            className="mx-auto mb-6 h-16 w-auto transform scale-75"
          />
          <h1 className="font-heading text-3xl font-bold text-rudi-maroon">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-rudi-maroon/70">
            Sign in to your merchant dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <TextInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="merchant@business.com"
            />
            <TextInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-rudi-coral/10 p-4 text-sm text-rudi-coral">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button type="submit" fullWidth size="md" color="teal">
            Sign in
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-rudi-maroon/70">
            New to Rudi?{' '}
            <Link
              to="/register"
              className="font-semibold text-rudi-teal hover:text-rudi-teal/80"
            >
              Create your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
