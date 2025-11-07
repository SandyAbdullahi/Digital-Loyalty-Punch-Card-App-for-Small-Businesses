import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Label, Textarea } from '@rudi/ui'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'

const DemoSettings = () => {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [formState, setFormState] = useState({
    businessName: 'Demo Café',
    email: 'demo@cafe.com',
    address: '123 Main St, Nairobi',
    phone: '+254 700 123 456',
    logoUrl: '',
    about: 'A cozy café serving the best coffee in town.',
  })
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    // Mock save
    setTimeout(() => {
      setToast({ type: 'success', message: 'Demo settings saved!' })
      setSaving(false)
      setTimeout(() => setToast(null), 3000)
    }, 1000)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col lg:ml-60">
        <TopBar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto px-4 pb-10 pt-4 sm:px-6 lg:px-8">
          <div className="space-y-6 lg:space-y-8">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-heading text-2xl font-bold text-foreground">
                  Settings
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your business profile and preferences
                </p>
              </div>
              <button
                onClick={() => navigate('/demo')}
                className="btn-primary w-full sm:w-auto"
              >
                Back to Dashboard
              </button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-3xl bg-card p-6 shadow-lg">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6">
                  Business Information
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Business Name</Label>
                    <Input
                      value={formState.businessName}
                      onChange={(e) => setFormState(prev => ({ ...prev, businessName: e.target.value }))}
                      className="h-12 rounded-2xl border-border bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Email</Label>
                    <Input
                      type="email"
                      value={formState.email}
                      onChange={(e) => setFormState(prev => ({ ...prev, email: e.target.value }))}
                      className="h-12 rounded-2xl border-border bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Address</Label>
                    <Input
                      value={formState.address}
                      onChange={(e) => setFormState(prev => ({ ...prev, address: e.target.value }))}
                      className="h-12 rounded-2xl border-border bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Phone</Label>
                    <Input
                      value={formState.phone}
                      onChange={(e) => setFormState(prev => ({ ...prev, phone: e.target.value }))}
                      className="h-12 rounded-2xl border-border bg-background"
                    />
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <Label className="text-sm font-semibold text-foreground">About</Label>
                  <Textarea
                    value={formState.about}
                    onChange={(e) => setFormState(prev => ({ ...prev, about: e.target.value }))}
                    className="min-h-24 rounded-2xl border-border bg-background"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>

            {toast && (
              <div className={`rounded-full px-4 py-2 text-xs font-semibold shadow-sm ${
                toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {toast.message}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DemoSettings