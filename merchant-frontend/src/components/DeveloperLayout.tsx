import { FormEvent, useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import DeveloperSidebar from './DeveloperSidebar'
import TopBar from './TopBar'

const DeveloperLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, loading, loginDeveloperWithCredentials } = useAuth()
  const [devEmail, setDevEmail] = useState('ab2d222@gmail.com')
  const [devPassword, setDevPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (loading) return <div>Loading...</div>
  if (!user || user.role !== 'developer') {
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setError(null)
      setSubmitting(true)
      try {
        await loginDeveloperWithCredentials(devEmail.trim(), devPassword)
      } catch (err: any) {
        setError(err?.message || 'Invalid developer credentials')
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-md">
          <div className="text-center">
            <p className="font-heading text-lg font-semibold text-foreground">Developer access</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in with your developer credentials to manage the platform.
            </p>
          </div>
          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground/80">Email</label>
              <input
                type="email"
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground/80">Password</label>
              <input
                type="password"
                value={devPassword}
                onChange={(e) => setDevPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              className="btn-primary w-full justify-center"
              disabled={submitting}
            >
              {submitting ? 'Signing in...' : 'Sign in as developer'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DeveloperSidebar />
      <div className="flex flex-1 flex-col lg:ml-64">
        <TopBar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto px-4 pb-10 pt-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DeveloperLayout
