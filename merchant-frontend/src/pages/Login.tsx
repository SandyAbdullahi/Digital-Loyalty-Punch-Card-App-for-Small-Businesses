import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button, TextInput } from '@mantine/core'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const logoSrc = useMemo(() => `${import.meta.env.BASE_URL}logo-1.png`, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-start">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </button>
        </div>
        <div className="text-center">
          <img
            src={logoSrc}
            alt="Rudi"
            className="mx-auto mb-6 h-20 w-auto"
          />
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
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
            <div className="flex items-center gap-2 rounded-2xl bg-accent/10 p-4 text-sm text-accent">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button type="submit" fullWidth size="md" color="teal">
            Sign in
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            New to Rudi?{' '}
            <Link
              to="/register"
              className="font-semibold text-primary hover:text-primary/80"
            >
              Create your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
