import { FormEvent, useState, useEffect } from 'react'
import axios from 'axios'
import { Button, Textarea, Text, Container, Stack, Card, SimpleGrid, Group } from '@mantine/core'
import { Input, Label } from '@rudi/ui'
import { useAuth } from '../contexts/AuthContext'
import {
  applyTheme,
  extractThemeFromSettings,
  DEFAULT_THEME,
  PRESET_THEMES,
  DEFAULT_PRESET_ID,
  ThemeSettingsPayload,
} from '../utils/theme'

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
  theme_primary_color?: string
  theme_secondary_color?: string
  theme_accent_color?: string
  theme_background_color?: string
  theme_mode?: 'light' | 'dark'
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
    theme_primary_color: DEFAULT_THEME.theme_primary_color,
    theme_secondary_color: DEFAULT_THEME.theme_secondary_color,
    theme_accent_color: DEFAULT_THEME.theme_accent_color,
    theme_background_color: DEFAULT_THEME.theme_background_color,
    theme_mode: DEFAULT_THEME.theme_mode,
  })
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null)
  const [savingSettings, setSavingSettings] = useState(false)

  const syncPresetSelection = (payload: ThemeSettingsPayload) => {
    const normalize = (value?: string) => value?.toLowerCase() ?? ''
    const match = PRESET_THEMES.find((preset) => {
      const { values } = preset
      return (
        normalize(values.theme_primary_color) === normalize(payload.theme_primary_color) &&
        normalize(values.theme_secondary_color) === normalize(payload.theme_secondary_color) &&
        normalize(values.theme_accent_color) === normalize(payload.theme_accent_color) &&
        normalize(values.theme_background_color) === normalize(payload.theme_background_color) &&
        values.theme_mode === (payload.theme_mode ?? values.theme_mode)
      )
    })
    setSelectedThemeId(match?.id ?? null)
  }

  const applyPresetValues = (values: ThemeSettingsPayload) => {
    const normalized = extractThemeFromSettings(values)
    setSettingsForm((prev) => ({
      ...prev,
      theme_primary_color: normalized.theme_primary_color,
      theme_secondary_color: normalized.theme_secondary_color,
      theme_accent_color: normalized.theme_accent_color,
      theme_background_color: normalized.theme_background_color,
      theme_mode: normalized.theme_mode,
    }))
    applyTheme(normalized)
    localStorage.setItem('merchantTheme', JSON.stringify(normalized))
    syncPresetSelection(normalized)
  }

  const handlePresetSelect = (presetId: string) => {
    const preset = PRESET_THEMES.find((item) => item.id === presetId)
    if (!preset) return
    setSelectedThemeId(presetId)
    applyPresetValues(preset.values)
  }

  const handleResetTheme = () => {
    handlePresetSelect(DEFAULT_PRESET_ID)
  }

  const populateSettingsForm = (data: MerchantSettings) => {
    setSettings(data)
    setSettingsForm({
      avg_spend_per_visit_kes: data.avg_spend_per_visit_kes !== null ? data.avg_spend_per_visit_kes.toString() : '',
      baseline_visits_per_customer_per_period:
        data.baseline_visits_per_customer_per_period !== null
          ? data.baseline_visits_per_customer_per_period.toString()
          : '',
      avg_reward_cost_kes: data.avg_reward_cost_kes !== null ? data.avg_reward_cost_kes.toString() : '',
      monthly_subscription_kes: data.monthly_subscription_kes !== null ? data.monthly_subscription_kes.toString() : '',
      theme_primary_color: data.theme_primary_color ?? DEFAULT_THEME.theme_primary_color,
      theme_secondary_color: data.theme_secondary_color ?? DEFAULT_THEME.theme_secondary_color,
      theme_accent_color: data.theme_accent_color ?? DEFAULT_THEME.theme_accent_color,
      theme_background_color: data.theme_background_color ?? DEFAULT_THEME.theme_background_color,
      theme_mode: data.theme_mode ?? DEFAULT_THEME.theme_mode,
    })
    const themePayload = extractThemeFromSettings(data)
    localStorage.setItem('merchantTheme', JSON.stringify(themePayload))
    applyTheme(themePayload)
    syncPresetSelection(themePayload)
  }

  useEffect(() => {
    const storedTheme = localStorage.getItem('merchantTheme')
    if (storedTheme) {
      try {
        const payload = JSON.parse(storedTheme)
        applyTheme(payload)
        syncPresetSelection(payload)
      } catch {
        // ignore invalid theme data
      }
    }

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
              populateSettingsForm(settingsResponse.data)
            }
          } catch (settingsError: any) {
            // If settings don't exist (404), set default values
            if (settingsError.response?.status === 404) {
              const defaults = {
                avg_spend_per_visit_kes: '500',
                baseline_visits_per_customer_per_period: '1',
                avg_reward_cost_kes: '100',
                monthly_subscription_kes: '',
                theme_primary_color: DEFAULT_THEME.theme_primary_color,
                theme_secondary_color: DEFAULT_THEME.theme_secondary_color,
                theme_accent_color: DEFAULT_THEME.theme_accent_color,
                theme_background_color: DEFAULT_THEME.theme_background_color,
                theme_mode: DEFAULT_THEME.theme_mode,
              }
              setSettingsForm(defaults)
              applyTheme(DEFAULT_THEME)
              setSelectedThemeId(DEFAULT_PRESET_ID)
              localStorage.setItem('merchantTheme', JSON.stringify(DEFAULT_THEME))
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
          populateSettingsForm(settingsResponse.data)
        }
      } catch (error: any) {
        // If settings don't exist (404), set default values
        if (error.response?.status === 404) {
          const defaults = {
            avg_spend_per_visit_kes: '500',
            baseline_visits_per_customer_per_period: '1',
            avg_reward_cost_kes: '100',
            monthly_subscription_kes: '',
            theme_primary_color: DEFAULT_THEME.theme_primary_color,
            theme_secondary_color: DEFAULT_THEME.theme_secondary_color,
            theme_accent_color: DEFAULT_THEME.theme_accent_color,
            theme_background_color: DEFAULT_THEME.theme_background_color,
            theme_mode: DEFAULT_THEME.theme_mode,
          }
          setSettingsForm(defaults)
          applyTheme(DEFAULT_THEME)
          setSelectedThemeId(DEFAULT_PRESET_ID)
          localStorage.setItem('merchantTheme', JSON.stringify(DEFAULT_THEME))
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
      if (settingsForm.theme_primary_color) {
        dataToSend.theme_primary_color = settingsForm.theme_primary_color
      }
      if (settingsForm.theme_secondary_color) {
        dataToSend.theme_secondary_color = settingsForm.theme_secondary_color
      }
      if (settingsForm.theme_accent_color) {
        dataToSend.theme_accent_color = settingsForm.theme_accent_color
      }
      if (settingsForm.theme_background_color) {
        dataToSend.theme_background_color = settingsForm.theme_background_color
      }
      if (settingsForm.theme_mode) {
        dataToSend.theme_mode = settingsForm.theme_mode
      }
      await axios.put(`/api/v1/merchants/${merchant.id}/settings`, dataToSend)
      // Refetch settings to confirm
      const settingsResponse = await axios.get(`/api/v1/merchants/${merchant.id}/settings`)
      if (settingsResponse.data) {
        populateSettingsForm(settingsResponse.data)
      }
      setToast({ type: 'success', message: 'Analytics and theme settings saved successfully.' })
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

  const activePreset = selectedThemeId ? PRESET_THEMES.find((preset) => preset.id === selectedThemeId) : null

  return (
    <Container size="lg" className="py-8">
      <Stack gap="xl">
        <div className="space-y-1 text-center">
          <h1 className="font-heading text-3xl font-semibold text-foreground">Merchant Mission Control</h1>
          <p className="text-sm text-muted-foreground">
            Keep your profile, analytics assumptions, and dashboard theme in sync for accurate insights.
          </p>
        </div>

        <Card radius="xl" padding="xl" withBorder shadow="md">
          <Stack gap="sm" mb="md">
            <Text fw={600} size="lg">Brand Profile</Text>
            <Text size="sm" c="dimmed">Customers see this information across the merchant and customer apps.</Text>
          </Stack>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  placeholder="+254 700 000 000"
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
                placeholder="123 Brew Street, Nairobi"
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
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="space-x-4 text-sm">
                <button type="button" className="text-primary hover:underline">Change password</button>
                <button type="button" className="text-accent hover:underline">Deactivate account</button>
              </div>
              <Button type="submit" className="btn-primary px-6" disabled={saving}>
                {saving ? 'Saving...' : 'Save profile'}
              </Button>
            </div>
          </form>
        </Card>

        <Card radius="xl" padding="xl" withBorder shadow="md">
          <Stack gap="sm" mb="md">
            <Text fw={600} size="lg">Analytics Assumptions</Text>
            <Text size="sm" c="dimmed">
              These values feed the revenue estimation and repeat-visit metrics on your analytics dashboard.
            </Text>
          </Stack>
          {settings && (
            <div className="rounded-2xl border border-border bg-muted/20 p-4 mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="py-2 font-semibold text-foreground">Assumption</th>
                      <th className="py-2 font-semibold text-foreground">Current Value</th>
                      <th className="py-2 font-semibold text-foreground">Unit</th>
                      <th className="py-2 font-semibold text-foreground">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-3 text-muted-foreground">Avg Spend per Visit</td>
                      <td className="py-3 font-medium">{settings.avg_spend_per_visit_kes?.toFixed(2) ?? 'Not set'}</td>
                      <td className="py-3 text-muted-foreground">KES</td>
                      <td className="py-3 text-muted-foreground">{new Date(settings.updated_at).toLocaleDateString()}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-muted-foreground">Baseline Visits / Customer</td>
                      <td className="py-3 font-medium">{settings.baseline_visits_per_customer_per_period?.toFixed(1) ?? 'Not set'}</td>
                      <td className="py-3 text-muted-foreground">Visits</td>
                      <td className="py-3 text-muted-foreground">{new Date(settings.updated_at).toLocaleDateString()}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-muted-foreground">Avg Reward Cost</td>
                      <td className="py-3 font-medium">{settings.avg_reward_cost_kes?.toFixed(2) ?? 'Not set'}</td>
                      <td className="py-3 text-muted-foreground">KES</td>
                      <td className="py-3 text-muted-foreground">{new Date(settings.updated_at).toLocaleDateString()}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-muted-foreground">Monthly Subscription</td>
                      <td className="py-3 font-medium">{settings.monthly_subscription_kes?.toFixed(2) ?? 'Not set'}</td>
                      <td className="py-3 text-muted-foreground">KES</td>
                      <td className="py-3 text-muted-foreground">{new Date(settings.updated_at).toLocaleDateString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <form className="flex flex-col gap-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-semibold text-foreground">Avg Spend per Visit (KES)</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    How much a typical customer spends per visit.
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
                  <Label className="text-sm font-semibold text-foreground">Baseline Visits / Customer</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Visits you'd expect without a loyalty program.
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
                  <p className="text-xs text-muted-foreground mt-1">Average cost to fulfil a reward.</p>
                </div>
                <Input
                  type="number"
                  value={settingsForm.avg_reward_cost_kes}
                  onChange={(event) => handleSettingsChange('avg_reward_cost_kes', event.target.value)}
                  onFocus={(e) => e.target.select()}
                  className="h-11 rounded-2xl border-border bg-background"
                  placeholder="e.g., 120"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-semibold text-foreground">Monthly Subscription (KES)</Label>
                  <p className="text-xs text-muted-foreground mt-1">Optional platform fee if applicable.</p>
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
              <Text size="sm" c="dimmed">
                These inputs fuel revenue uplift, reward cost, and ROI calculations.
              </Text>
              <Button type="button" onClick={handleSaveSettings} className="btn-primary px-6" disabled={savingSettings}>
                {savingSettings ? 'Saving...' : 'Save Analytics Settings'}
              </Button>
            </div>
          </form>
        </Card>

        <Card radius="xl" padding="xl" withBorder shadow="md">
          <Stack gap="sm" mb="md">
            <Group justify="space-between" align="flex-start">
              <div>
                <Text fw={600} size="lg">Theme Customization</Text>
                <Text size="sm" c="dimmed">
                  Choose one of Adobe Color's UI/UX trend palettes to style your merchant mission control.
                </Text>
              </div>
              <Button variant="subtle" size="xs" onClick={handleResetTheme} disabled={savingSettings}>
                Reset to default
              </Button>
            </Group>
          </Stack>
          <Stack gap="xs" mb="lg">
            <Text size="sm" c="dimmed">
              Each preset applies tuned primary, navigation, accent, and background colors with the recommended light or dark mode.
            </Text>
            <Text size="xs" c="dimmed">
              {activePreset
                ? `Currently previewing: ${activePreset.label} (${activePreset.source}).`
                : 'Currently previewing a legacy custom palette. Pick a preset to standardize your dashboard.'}
            </Text>
          </Stack>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" mb="lg">
            {PRESET_THEMES.map((theme) => {
              const isActive = theme.id === selectedThemeId
              return (
                <button
                  type="button"
                  key={theme.id}
                  onClick={() => handlePresetSelect(theme.id)}
                  className={[
                    'w-full rounded-2xl border-2 p-4 text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                    isActive ? 'border-primary shadow-xl ring-2 ring-primary/30' : 'border-border hover:-translate-y-0.5 hover:border-primary/40',
                  ].join(' ')}
                  aria-pressed={isActive}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-heading text-base font-semibold text-foreground">{theme.label}</p>
                      <p className="text-xs text-muted-foreground">{theme.description}</p>
                    </div>
                    <span className="rounded-full border border-border px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {theme.values.theme_mode === 'dark' ? 'Dark' : 'Light'}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {theme.swatches.map((swatch) => (
                      <span
                        key={`${theme.id}-${swatch}`}
                        className="h-9 w-9 rounded-2xl border border-border"
                        style={{ backgroundColor: swatch }}
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-[11px] uppercase tracking-wide text-muted-foreground">{theme.source}</p>
                </button>
              )
            })}
          </SimpleGrid>
          <div className="flex items-center justify-between pt-4 border-t border-border mt-2">
            <Text size="sm" c="dimmed">
              Theme presets update the entire dashboard instantly. Save to persist for your whole team.
            </Text>
            <Button type="button" onClick={handleSaveSettings} className="btn-primary px-6" disabled={savingSettings}>
              {savingSettings ? 'Saving...' : 'Save Theme Selection'}
            </Button>
          </div>
        </Card>

        {toast && (
          <div
            className={`fixed bottom-8 right-6 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg ${
              toast.type === 'success' ? 'bg-primary' : 'bg-accent'
            }`}
          >
            {toast.message}
          </div>
        )}
      </Stack>
    </Container>
  )
}

export default Settings
