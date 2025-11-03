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
      await axios.post('/api/v1/merchants/profile', formState)
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
        <h1 className="font-heading text-3xl font-semibold text-rudi-maroon">Profile & Settings</h1>
        <p className="text-sm text-rudi-maroon/70">
          Keep your mission control details polished and up to date.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-3xl bg-white p-8 shadow-rudi-card"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-rudi-maroon">Business name</Label>
            <Input
              value={formState.businessName}
              onChange={(event) => handleChange('businessName', event.target.value)}
              className="h-11 rounded-2xl border-[#EADCC7] bg-[#FFF9F0]"
              placeholder="Rudi Coffee Collective"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-rudi-maroon">Email</Label>
            <Input
              type="email"
              value={formState.email}
              onChange={(event) => handleChange('email', event.target.value)}
              className="h-11 rounded-2xl border-[#EADCC7] bg-[#FFF9F0]"
              placeholder="hello@rudicoffee.com"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-rudi-maroon">Phone</Label>
            <Input
              value={formState.phone}
              onChange={(event) => handleChange('phone', event.target.value)}
              className="h-11 rounded-2xl border-[#EADCC7] bg-[#FFF9F0]"
              placeholder="+1 555 123 4567"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-rudi-maroon">Logo URL</Label>
            <Input
              value={formState.logoUrl}
              onChange={(event) => handleChange('logoUrl', event.target.value)}
              className="h-11 rounded-2xl border-[#EADCC7] bg-[#FFF9F0]"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-rudi-maroon">Address</Label>
          <Textarea
            value={formState.address}
            onChange={(event) => handleChange('address', event.target.value)}
            className="rounded-2xl border-[#EADCC7] bg-[#FFF9F0]"
            placeholder="123 Brew Street, Lagos"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-rudi-maroon">About your experience</Label>
          <Textarea
            value={formState.about}
            onChange={(event) => handleChange('about', event.target.value)}
            className="rounded-2xl border-[#EADCC7] bg-[#FFF9F0]"
            placeholder="Share your vibe with customers joining your loyalty journey."
            rows={4}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="space-x-4 text-sm">
            <button type="button" className="text-rudi-teal hover:underline">
              Change password
            </button>
            <button type="button" className="text-rudi-coral hover:underline">
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
            toast.type === 'success' ? 'bg-rudi-teal' : 'bg-rudi-coral'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default Settings

