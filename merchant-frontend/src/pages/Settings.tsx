import { FormEvent, useState, useEffect } from 'react'
import axios from 'axios'
import { Button, Input, Label, Textarea } from '@rudi/ui'
import { useAuth } from '../contexts/AuthContext'

type Merchant = {
  id: string
  display_name: string
  address: string
  phone?: string
  email?: string
  logo_url?: string
  description?: string
}

const Settings = () => {
  const { user, merchant: contextMerchant, updateUser, updateMerchant } = useAuth()
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [formState, setFormState] = useState({
    businessName: '',
    email: '',
    address: '',
    phone: '',
    logoUrl: '',
    about: '',
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchMerchant = async () => {
      try {
        const response = await axios.get('/api/v1/merchants/')
        if (response.data.length > 0) {
          const merchantData = response.data[0]
          setMerchant(merchantData)
          updateMerchant(merchantData)
          setFormState({
            businessName: merchantData.display_name || '',
            email: user?.email || '',
            address: merchantData.address || '',
            phone: merchantData.phone || '',
            logoUrl: merchantData.logo_url || '',
            about: merchantData.description || '',
          })
        }
      } catch (error) {
        console.error('Failed to fetch merchant', error)
      }
    }
    if (!contextMerchant) {
      fetchMerchant()
    } else {
      setMerchant(contextMerchant)
      setFormState({
        businessName: contextMerchant.display_name || '',
        email: user?.email || '',
        address: contextMerchant.address || '',
        phone: contextMerchant.phone || '',
        logoUrl: contextMerchant.logo_url || '',
        about: contextMerchant.description || '',
      })
    }
  }, [contextMerchant, user?.email, updateMerchant])

  const handleChange = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    try {
       const formData = new FormData()
       formData.append('name', formState.businessName)
       formData.append('description', formState.about)
       formData.append('website', '') // Not in form
       formData.append('address', formState.address)
       formData.append('phone', formState.phone)
       if (logoFile) {
         formData.append('logo', logoFile)
       }
       const merchantResponse = await axios.put('/api/v1/merchants/profile', formData, {
         headers: {
           'Content-Type': 'multipart/form-data',
         },
       })
       setMerchant(merchantResponse.data)
       updateMerchant(merchantResponse.data)
       setFormState(prev => ({
         ...prev,
         businessName: merchantResponse.data.display_name || '',
         address: merchantResponse.data.address || '',
         phone: merchantResponse.data.phone || '',
         logoUrl: merchantResponse.data.logo_url || '',
         about: merchantResponse.data.description || '',
       }))

      // Update user email if changed
      if (formState.email !== user?.email) {
        const userFormData = new FormData()
        userFormData.append('name', user?.name || '')
        userFormData.append('email', formState.email)
        const userResponse = await axios.put('/api/v1/customer/profile', userFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        // Update user in context
        updateUser(userResponse.data)
      }

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
             <Label className="text-sm font-semibold text-foreground">Logo</Label>
             <Input
               type="file"
               accept="image/*"
               onChange={(event) => setLogoFile(event.target.files?.[0] || null)}
               className="h-11 rounded-2xl border-border bg-background"
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

