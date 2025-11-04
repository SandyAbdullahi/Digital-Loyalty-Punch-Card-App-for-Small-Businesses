import { FormEvent, useState } from 'react'
import axios from 'axios'
import { Button, Input, Label, Textarea } from '@rudi/ui'

const Settings = () => {
  const [formState, setFormState] = useState({
    businessName: '',
    email: '',
    address: '',
    phone: '',
    logoUrl: '',
    about: '',
  })
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const handleChange = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    try {
      await axios.post('/api/v1/merchants/', {
        display_name: formState.businessName,
        logo_url: formState.logoUrl,
      })
      setToast({ type: 'success', message: 'Settings saved successfully.' })
    } catch (error) {
      console.error('Failed to save settings', error)
      setToast({ type: 'error', message: 'We could not save your changes. Try again?' })
    } finally {
      setSaving(false)
      setTimeout(() => setToast(null), 2400)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="font-heading text-3xl font-semibold text-foreground">Merchant Profile</h1>
        <p className="text-sm text-muted-foreground">
          Set up your merchant profile to start creating loyalty programs.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-3xl bg-card p-8 shadow-lg"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Business name</Label>
            <Input
              value={formState.businessName}
              onChange={(event) => handleChange('businessName', event.target.value)}
              className="h-11 rounded-2xl border-border bg-background"
              placeholder="Rudi Coffee Collective"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Email</Label>
            <Input
              type="email"
              value={formState.email}
              onChange={(event) => handleChange('email', event.target.value)}
              className="h-11 rounded-2xl border-border bg-background"
              placeholder="hello@rudicoffee.com"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Phone</Label>
            <Input
              value={formState.phone}
              onChange={(event) => handleChange('phone', event.target.value)}
              className="h-11 rounded-2xl border-border bg-background"
              placeholder="+1 555 123 4567"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Logo URL</Label>
            <Input
              value={formState.logoUrl}
              onChange={(event) => handleChange('logoUrl', event.target.value)}
              className="h-11 rounded-2xl border-border bg-background"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Address</Label>
          <Textarea
            value={formState.address}
            onChange={(event) => handleChange('address', event.target.value)}
            className="rounded-2xl border-border bg-background"
            placeholder="123 Brew Street, Lagos"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">About your experience</Label>
          <Textarea
            value={formState.about}
            onChange={(event) => handleChange('about', event.target.value)}
            className="rounded-2xl border-border bg-background"
            placeholder="Share your vibe with customers joining your loyalty journey."
            rows={4}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="space-x-4 text-sm">
            <button type="button" className="text-primary hover:underline">
              Change password
            </button>
            <button type="button" className="text-accent hover:underline">
              Deactivate account
            </button>
          </div>
          <Button type="submit" className="btn-primary px-6" disabled={saving}>
            {saving ? 'Saving…' : 'Save settings'}
          </Button>
        </div>
      </form>

      {toast && (
        <div
          className={`fixed bottom-8 right-6 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg ${
            toast.type === 'success' ? 'bg-primary' : 'bg-accent'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default Settings

