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

type MerchantSettings = {
  merchant_id: string
  avg_spend_per_visit_kes: number
  baseline_visits_per_customer_per_period: number
  avg_reward_cost_kes: number
  default_period: string
  monthly_subscription_kes?: number
  updated_at: string
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
  const [settings, setSettings] = useState<MerchantSettings | null>(null)
  const [settingsForm, setSettingsForm] = useState({
    avg_spend_per_visit_kes: '',
    baseline_visits_per_customer_per_period: '',
    avg_reward_cost_kes: '',
    monthly_subscription_kes: '',
  })
  const [savingSettings, setSavingSettings] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const merchantsResponse = await axios.get('/api/v1/merchants/')
        if (merchantsResponse.data.length > 0) {
          const merchantData = merchantsResponse.data[0]
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

          // Fetch settings with correct merchant id
          try {
            const settingsResponse = await axios.get(`/api/v1/merchants/${merchantData.id}/settings`)
            if (settingsResponse.data) {
              setSettings(settingsResponse.data)
              setSettingsForm({
                avg_spend_per_visit_kes: settingsResponse.data.avg_spend_per_visit_kes !== null ? settingsResponse.data.avg_spend_per_visit_kes.toString() : '',
                baseline_visits_per_customer_per_period: settingsResponse.data.baseline_visits_per_customer_per_period !== null ? settingsResponse.data.baseline_visits_per_customer_per_period.toString() : '',
                avg_reward_cost_kes: settingsResponse.data.avg_reward_cost_kes !== null ? settingsResponse.data.avg_reward_cost_kes.toString() : '',
                monthly_subscription_kes: settingsResponse.data.monthly_subscription_kes !== null ? settingsResponse.data.monthly_subscription_kes.toString() : '',
              })
            }
          } catch (settingsError: any) {
            // If settings don't exist (404), set default values
            if (settingsError.response?.status === 404) {
              setSettingsForm({
                avg_spend_per_visit_kes: '500',
                baseline_visits_per_customer_per_period: '1',
                avg_reward_cost_kes: '100',
                monthly_subscription_kes: '',
              })
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch data', error)
      }
    }

    const fetchSettingsForExistingMerchant = async () => {
      if (!contextMerchant) return
      try {
        const settingsResponse = await axios.get(`/api/v1/merchants/${contextMerchant.id}/settings`)
        if (settingsResponse.data) {
          setSettings(settingsResponse.data)
          setSettingsForm({
            avg_spend_per_visit_kes: settingsResponse.data.avg_spend_per_visit_kes !== null ? settingsResponse.data.avg_spend_per_visit_kes.toString() : '',
            baseline_visits_per_customer_per_period: settingsResponse.data.baseline_visits_per_customer_per_period !== null ? settingsResponse.data.baseline_visits_per_customer_per_period.toString() : '',
            avg_reward_cost_kes: settingsResponse.data.avg_reward_cost_kes !== null ? settingsResponse.data.avg_reward_cost_kes.toString() : '',
            monthly_subscription_kes: settingsResponse.data.monthly_subscription_kes !== null ? settingsResponse.data.monthly_subscription_kes.toString() : '',
          })
        }
      } catch (error: any) {
        // If settings don't exist (404), set default values
        if (error.response?.status === 404) {
          setSettingsForm({
            avg_spend_per_visit_kes: '500',
            baseline_visits_per_customer_per_period: '1',
            avg_reward_cost_kes: '100',
            monthly_subscription_kes: '',
          })
        } else {
          console.error('Failed to fetch settings', error)
        }
      }
    }

    if (!contextMerchant) {
      fetchData()
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
      fetchSettingsForExistingMerchant()
    }
  }, [contextMerchant, user?.email, updateMerchant])

  const handleChange = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const handleSettingsChange = (field: keyof typeof settingsForm, value: string) => {
    setSettingsForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveSettings = async () => {
    if (!merchant?.id) return
    setSavingSettings(true)
    try {
      const dataToSend: any = {}
      if (typeof settingsForm.avg_spend_per_visit_kes === 'string' && settingsForm.avg_spend_per_visit_kes.trim()) {
        dataToSend.avg_spend_per_visit_kes = parseFloat(settingsForm.avg_spend_per_visit_kes)
      }
      if (typeof settingsForm.baseline_visits_per_customer_per_period === 'string' && settingsForm.baseline_visits_per_customer_per_period.trim()) {
        dataToSend.baseline_visits_per_customer_per_period = parseFloat(settingsForm.baseline_visits_per_customer_per_period)
      }
      if (typeof settingsForm.avg_reward_cost_kes === 'string' && settingsForm.avg_reward_cost_kes.trim()) {
        dataToSend.avg_reward_cost_kes = parseFloat(settingsForm.avg_reward_cost_kes)
      }
      if (typeof settingsForm.monthly_subscription_kes === 'string' && settingsForm.monthly_subscription_kes.trim()) {
        dataToSend.monthly_subscription_kes = parseFloat(settingsForm.monthly_subscription_kes)
      }
      await axios.put(`/api/v1/merchants/${merchant.id}/settings`, dataToSend)
      // Refetch settings to confirm
      const settingsResponse = await axios.get(`/api/v1/merchants/${merchant.id}/settings`)
      if (settingsResponse.data) {
        setSettings(settingsResponse.data)
        setSettingsForm({
          avg_spend_per_visit_kes: settingsResponse.data.avg_spend_per_visit_kes || 0,
          baseline_visits_per_customer_per_period: settingsResponse.data.baseline_visits_per_customer_per_period || 0,
          avg_reward_cost_kes: settingsResponse.data.avg_reward_cost_kes || 0,
          monthly_subscription_kes: settingsResponse.data.monthly_subscription_kes || 0,
        })
      }
      setToast({ type: 'success', message: 'Analytics settings saved successfully.' })
    } catch (error) {
      console.error('Failed to save settings', error)
      setToast({ type: 'error', message: 'Failed to save analytics settings.' })
    } finally {
      setSavingSettings(false)
      setTimeout(() => setToast(null), 2400)
    }
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

       <div className="space-y-4">
         <div className="space-y-1">
           <h2 className="font-heading text-2xl font-semibold text-foreground">Analytics Assumptions</h2>
           <p className="text-sm text-muted-foreground">
             Configure key assumptions to calculate the revenue impact of your loyalty programs.
           </p>
         </div>

         <div className="rounded-2xl bg-muted/30 p-6 border border-border">
           <h3 className="font-heading text-lg font-semibold text-foreground mb-3">How These Values Work</h3>
           <div className="space-y-3 text-sm text-muted-foreground">
             <p>
               <strong>Revenue Estimation:</strong> We calculate the incremental revenue from your loyalty program by comparing actual customer visits against a baseline (what they'd visit without the program).
             </p>
             <ul className="list-disc list-inside space-y-1 ml-4">
               <li><strong>Avg Spend per Visit:</strong> How much does a typical customer spend when they visit? This is multiplied by extra visits to estimate revenue uplift.</li>
               <li><strong>Baseline Visits:</strong> How many times would customers visit per month without your loyalty program? This helps measure the program's effectiveness.</li>
               <li><strong>Avg Reward Cost:</strong> What's the average cost of providing rewards (like free items or discounts)? This is subtracted from the revenue uplift.</li>
               <li><strong>Monthly Subscription:</strong> Optional platform fee - included in net calculations if applicable.</li>
             </ul>
             <p className="text-xs mt-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
               <strong>Example:</strong> If customers spend KES 500/visit, visit 3 times/month (baseline 2), and rewards cost KES 100 each, your program generates KES 300 extra revenue per customer per month (after costs).
             </p>
           </div>
         </div>
         </div>

         {settings && (
           <div className="rounded-2xl bg-card p-6 shadow-lg">
             <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Current Settings</h3>
             <div className="overflow-x-auto">
               <table className="w-full text-sm">
                 <thead>
                   <tr className="border-b border-border">
                     <th className="text-left py-2 font-semibold text-foreground">Assumption</th>
                     <th className="text-left py-2 font-semibold text-foreground">Current Value</th>
                     <th className="text-left py-2 font-semibold text-foreground">Unit</th>
                     <th className="text-left py-2 font-semibold text-foreground">Last Updated</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border">
                   <tr>
                     <td className="py-3 text-muted-foreground">Avg Spend per Visit</td>
                     <td className="py-3 font-medium">{settings.avg_spend_per_visit_kes ? settings.avg_spend_per_visit_kes.toFixed(2) : 'Not set'}</td>
                     <td className="py-3 text-muted-foreground">KES</td>
                     <td className="py-3 text-muted-foreground">{new Date(settings.updated_at).toLocaleDateString()}</td>
                   </tr>
                   <tr>
                     <td className="py-3 text-muted-foreground">Baseline Visits per Customer per Period</td>
                     <td className="py-3 font-medium">{settings.baseline_visits_per_customer_per_period ? settings.baseline_visits_per_customer_per_period.toFixed(1) : 'Not set'}</td>
                     <td className="py-3 text-muted-foreground">visits</td>
                     <td className="py-3 text-muted-foreground">{new Date(settings.updated_at).toLocaleDateString()}</td>
                   </tr>
                   <tr>
                     <td className="py-3 text-muted-foreground">Avg Reward Cost</td>
                     <td className="py-3 font-medium">{settings.avg_reward_cost_kes ? settings.avg_reward_cost_kes.toFixed(2) : 'Not set'}</td>
                     <td className="py-3 text-muted-foreground">KES</td>
                     <td className="py-3 text-muted-foreground">{new Date(settings.updated_at).toLocaleDateString()}</td>
                   </tr>
                   <tr>
                     <td className="py-3 text-muted-foreground">Monthly Subscription</td>
                     <td className="py-3 font-medium">{settings.monthly_subscription_kes ? settings.monthly_subscription_kes.toFixed(2) : 'Not set'}</td>
                     <td className="py-3 text-muted-foreground">KES</td>
                     <td className="py-3 text-muted-foreground">{new Date(settings.updated_at).toLocaleDateString()}</td>
                   </tr>
                 </tbody>
               </table>
             </div>
           </div>
         )}

       <form className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-3xl bg-card p-8 shadow-lg">
         <div className="grid gap-6 sm:grid-cols-2">
           <div className="space-y-3">
             <div>
               <Label className="text-sm font-semibold text-foreground">Avg Spend per Visit (KES)</Label>
               <p className="text-xs text-muted-foreground mt-1">
                 Average amount customers spend per visit
               </p>
             </div>
             <Input
               type="number"
               value={settingsForm.avg_spend_per_visit_kes}
               onChange={(event) => handleSettingsChange('avg_spend_per_visit_kes', event.target.value)}
               onFocus={(e) => e.target.select()}
               className="h-11 rounded-2xl border-border bg-background"
               placeholder="e.g., 500"
               min="0"
               step="0.01"
               required
             />
           </div>
           <div className="space-y-3">
             <div>
               <Label className="text-sm font-semibold text-foreground">Baseline Visits per Customer per Period</Label>
               <p className="text-xs text-muted-foreground mt-1">
                 Expected visits without loyalty program
               </p>
             </div>
             <Input
               type="number"
               value={settingsForm.baseline_visits_per_customer_per_period}
               onChange={(event) => handleSettingsChange('baseline_visits_per_customer_per_period', event.target.value)}
               onFocus={(e) => e.target.select()}
               className="h-11 rounded-2xl border-border bg-background"
               placeholder="e.g., 2.5"
               min="0"
               step="0.1"
               required
             />
           </div>
         </div>
         <div className="grid gap-6 sm:grid-cols-2">
           <div className="space-y-3">
             <div>
               <Label className="text-sm font-semibold text-foreground">Avg Reward Cost (KES)</Label>
               <p className="text-xs text-muted-foreground mt-1">
                 Cost of providing rewards to customers
               </p>
             </div>
             <Input
               type="number"
               value={settingsForm.avg_reward_cost_kes}
               onChange={(event) => handleSettingsChange('avg_reward_cost_kes', event.target.value)}
               onFocus={(e) => e.target.select()}
               className="h-11 rounded-2xl border-border bg-background"
               placeholder="e.g., 100"
               min="0"
               step="0.01"
               required
             />
           </div>
           <div className="space-y-3">
             <div>
               <Label className="text-sm font-semibold text-foreground">Monthly Subscription (KES)</Label>
               <p className="text-xs text-muted-foreground mt-1">
                 Optional monthly platform fee
               </p>
             </div>
             <Input
               type="number"
               value={settingsForm.monthly_subscription_kes}
               onChange={(event) => handleSettingsChange('monthly_subscription_kes', event.target.value)}
               onFocus={(e) => e.target.select()}
               className="h-11 rounded-2xl border-border bg-background"
               placeholder="e.g., 5000"
               min="0"
               step="0.01"
             />
           </div>
         </div>
         <div className="flex items-center justify-between pt-4 border-t border-border">
           <div className="text-sm text-muted-foreground">
             These values help calculate revenue impact of your loyalty programs
           </div>
           <Button type="button" onClick={handleSaveSettings} className="btn-primary px-6" disabled={savingSettings}>
             {savingSettings ? 'Saving…' : 'Save Analytics Settings'}
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

