import { FormEvent, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@rudi/ui'
import { AlertTriangle, BadgeCheck, Calendar, Clock, PenSquare, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Program {
  id: string
  name: string
  description?: string
  logic_type: string
  earn_rule: Record<string, any>
  redeem_rule: Record<string, any>
  terms?: string
  stamp_icon?: string
  is_active: boolean
  expires_at?: string | null
  stamps_required?: number
}

type ProgramFormState = {
  name: string
  description: string
  logic_type: string
  rewardThreshold: string
  stampValue: string
  expiry: string
  maxPerDay: string
  maxRedemptionsPerDay: string
  notes: string
  stampIcon: string
}

const defaultFormState: ProgramFormState = {
  name: '',
  description: '',
  logic_type: 'punch_card',
  rewardThreshold: '10',
  stampValue: '1',
  expiry: '',
  maxPerDay: '',
  maxRedemptionsPerDay: '',
  notes: '',
  stampIcon: '',
}

const statusBadge = (isActive: boolean) =>
  isActive
    ? 'inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary'
    : 'inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent'

const Programs = () => {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formStep, setFormStep] = useState(0)
  const [formData, setFormData] = useState<ProgramFormState>(defaultFormState)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [warnings, setWarnings] = useState<Record<string, string>>({})
  const navigate = useNavigate()

  useEffect(() => {
    fetchPrograms()
  }, [])

  useEffect(() => {
      if (!isModalOpen) {
    setTimeout(() => {
      setFormStep(0)
      setEditingProgram(null)
      setFormData(defaultFormState)
      setErrors({})
      setWarnings({})
    }, 200)
      }
  }, [isModalOpen])

  const fetchPrograms = async () => {
    try {
      const response = await axios.get<Program[]>('/api/v1/programs/')
      setPrograms(response.data)
    } catch (error) {
      console.error('Failed to fetch programs', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPrograms = useMemo(() => {
    if (!query) return programs
    return programs.filter((program) =>
      program.name.toLowerCase().includes(query.toLowerCase())
    )
  }, [programs, query])

  const openCreateModal = () => {
    setEditingProgram(null)
    setFormData(defaultFormState)
    setFormStep(0)
    setIsModalOpen(true)
  }

  const openEditModal = (program: Program) => {
    const earnRule = program.earn_rule ?? {}
    const redeemRule = program.redeem_rule ?? {}
    setEditingProgram(program)
    setFormData({
      name: program.name,
      description: program.description ?? '',
      logic_type: program.logic_type ?? 'punch_card',
      rewardThreshold:
        String(
          redeemRule.reward_threshold ??
            program.stamps_required ??
            earnRule.stamps_needed ??
            defaultFormState.rewardThreshold
        ),
      stampValue: String(earnRule.stamp_value ?? defaultFormState.stampValue),
      expiry:
        program.expires_at ??
        earnRule.expiry ??
        '',
      maxPerDay: String(earnRule.max_per_day ?? ''),
      maxRedemptionsPerDay: String(program.max_redemptions_per_day ?? ''),
      notes: program.terms ?? '',
      stampIcon: program.stamp_icon ?? '',
    })
    setFormStep(0)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setTimeout(() => {
      setFormStep(0)
      setEditingProgram(null)
      setFormData(defaultFormState)
      setErrors({})
      setWarnings({})
    }, 200)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return
    try {
      await axios.delete(`/api/v1/programs/${id}`)
      setPrograms((prev) => prev.filter((program) => program.id !== id))
    } catch (error) {
      console.error('Failed to delete program', error)
    }
  }

  const buildPayload = () => {
    const earnRule = {
      stamps_needed: Number(formData.rewardThreshold),
      stamp_value: Number(formData.stampValue),
      max_per_day: formData.maxPerDay ? Number(formData.maxPerDay) : undefined,
      expiry: formData.expiry || undefined,
      notes: formData.notes || undefined,
    }

    const redeemRule = {
      reward_threshold: Number(formData.rewardThreshold),
    }

    return {
      name: formData.name,
      description: formData.description,
      logic_type: formData.logic_type,
      stamps_required: Number(formData.rewardThreshold),
      earn_rule: earnRule,
      redeem_rule: redeemRule,
      terms: formData.notes,
      stamp_icon: formData.stampIcon,
      max_redemptions_per_day: formData.maxRedemptionsPerDay ? Number(formData.maxRedemptionsPerDay) : undefined,
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    const newWarnings: Record<string, string> = {}

    const threshold = Number(formData.rewardThreshold)
    const stampValue = Number(formData.stampValue)
    const maxPerDay = formData.maxPerDay ? Number(formData.maxPerDay) : null
    const maxRedemptions = formData.maxRedemptionsPerDay ? Number(formData.maxRedemptionsPerDay) : null
    const expiry = formData.expiry ? new Date(formData.expiry) : null

    if (!formData.name.trim()) newErrors.name = 'Program name is required'
    if (isNaN(threshold) || threshold < 1) newErrors.rewardThreshold = 'Must be an integer >= 1'
    if (isNaN(stampValue) || stampValue < 1) newErrors.stampValue = 'Must be an integer >= 1'
    if (maxPerDay !== null && (isNaN(maxPerDay) || maxPerDay < 1)) newErrors.maxPerDay = 'Must be an integer >= 1'
    if (maxRedemptions !== null && (isNaN(maxRedemptions) || maxRedemptions < 1)) newErrors.maxRedemptionsPerDay = 'Must be an integer >= 1'
    if (expiry && expiry <= new Date()) newErrors.expiry = 'Expiry must be in the future'

    if (threshold <= stampValue * 2) newWarnings.rewardThreshold = 'This threshold is very low compared to your per-visit limit and may make it easy for customers to farm rewards quickly.'
    if (!maxRedemptions || maxRedemptions > 5) newWarnings.maxRedemptionsPerDay = 'Without a daily limit on redemptions, heavy users might redeem rewards many times in one day.'

    setErrors(newErrors)
    setWarnings(newWarnings)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validateForm()) return
    const payload = buildPayload()

    try {
      if (editingProgram) {
        await axios.put(`/api/v1/programs/${editingProgram.id}`, payload)
      } else {
        await axios.post('/api/v1/programs/', payload)
      }
      closeModal()
      fetchPrograms()
    } catch (error) {
      console.error('Failed to save program', error)
      alert('Could not save the program. Please double-check your entries.')
    }
  }

  if (loading) {
    return <div className="py-10 text-sm text-muted-foreground">Loading programs…</div>
  }

  return (
    <div>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            Loyalty Programs
          </h1>
          <p className="text-sm text-muted-foreground">
            Tune your rewards and keep guests coming back for more.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search programs"
              className="h-11 rounded-full border-primary/15 bg-card px-4"
            />
          </div>
          <Button
            className="btn-primary h-11 rounded-2xl px-5 mb-4"
            type="button"
            onClick={openCreateModal}
          >
            + Create Program
          </Button>
        </div>
      </header>

      <section className="grid gap-5 lg:grid-cols-2">
        {filteredPrograms.map((program, index) => {
          const rewardThreshold =
            program.redeem_rule?.reward_threshold ??
            program.earn_rule?.stamps_needed ??
            formData.rewardThreshold
          const expires =
            program.expires_at ?? program.earn_rule?.expiry ?? 'No expiry'

          return (
            <article
              key={program.id}
              className="card-hover flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-lg animate-slide-up mt-4"
              style={{ animationDelay: `${index * 0.04}s` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-xl font-semibold text-foreground">
                    {program.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {program.description || 'Craft an irresistible reward story.'}
                  </p>
                </div>
                <span className={statusBadge(program.is_active)}>
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {program.is_active ? 'Active' : 'Paused'}
                </span>
              </div>

              <div className="grid gap-3 rounded-2xl border border-primary/15 bg-muted/60 p-4 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <StampIcon />
                  <span>{rewardThreshold} stamps per reward</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Expires {expires === 'No expiry' ? 'never' : new Date(expires).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>
                    {program.earn_rule?.max_per_day
                      ? `${program.earn_rule.max_per_day} scans per day`
                      : 'Unlimited daily scans'}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {program.terms || 'No special terms — keep it flexible.'}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  className="rounded-2xl border-primary/30 text-primary hover:bg-primary/10"
                  onClick={() => openEditModal(program)}
                >
                  <PenSquare className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  className="btn-secondary rounded-2xl px-4 py-2"
                  type="button"
                  onClick={() => navigate('/qr', { state: { programId: program.id } })}
                >
                  View QR
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-2xl px-3 py-2 text-accent hover:bg-accent/10"
                  onClick={() => handleDelete(program.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </article>
          )
        })}

        {!filteredPrograms.length && (
          <div className="rounded-3xl bg-card p-8 text-center shadow-lg">
            <h3 className="font-heading text-lg text-foreground">No programs yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Launch your first loyalty adventure — your customers are ready.
            </p>
            <Button onClick={openCreateModal} className="btn-primary mt-4">
              Create your first program
            </Button>
          </div>
        )}
      </section>

      <style>{`span[data-radix-select-item-indicator]{display:none!important;}`}</style>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-background/80 px-4 backdrop-blur-md sm:px-6" onClick={closeModal}>
          <div className="relative mx-auto w-full max-w-xl max-h-[calc(100vh-4rem)] overflow-y-auto rounded-3xl border border-border bg-background p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="border-b border-border pb-4 mb-4">
              <h2 className="font-heading text-xl text-foreground">
                {editingProgram ? 'Edit Loyalty Program' : 'Create Loyalty Program'}
              </h2>
              <p className="text-sm text-muted-foreground">
                Step {formStep + 1} of 2 - keep your experience magical.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {formStep === 0 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                      Program name
                    </Label>
                     <Input
                       id="name"
                       value={formData.name}
                       onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                       required
                       className="h-11 rounded-xl border-border bg-background"
                     />
                     {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold text-foreground">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(event) =>
                        setFormData({ ...formData, description: event.target.value })
                      }
                      placeholder="What heartwarming reward awaits loyal guests?"
                       className="rounded-xl border-border bg-background"
                    />
                  </div>
                   <div className="space-y-2">
                     <Label htmlFor="logic_type" className="text-sm font-semibold text-foreground">
                       Program type
                     </Label>
                     <Select
                       value={formData.logic_type}
                       onValueChange={(value) => setFormData({ ...formData, logic_type: value })}
                     >
                       <SelectTrigger id="logic_type" className="h-11 rounded-xl border-[#EADCC7] bg-[#FFF9F0]">
                         <SelectValue placeholder="Select program type" />
                       </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="punch_card">Punch Card</SelectItem>
                          <SelectItem value="points">Points</SelectItem>
                        </SelectContent>
                     </Select>
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="stampIcon" className="text-sm font-semibold text-foreground">
                       Stamp icon
                     </Label>
                      <Select
                        value={formData.stampIcon}
                        onValueChange={(value) => setFormData({ ...formData, stampIcon: value })}
                      >
                        <SelectTrigger id="stampIcon" className="h-11 rounded-xl border-[#EADCC7] bg-white">
                          <SelectValue placeholder="Select stamp icon" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default" className={formData.stampIcon === "default" ? "bg-blue-100" : ""}>Default (dots)</SelectItem>
                          <SelectItem value="star" className={formData.stampIcon === "star" ? "bg-blue-100" : ""}>⭐ Star</SelectItem>
                          <SelectItem value="heart" className={formData.stampIcon === "heart" ? "bg-blue-100" : ""}>❤️ Heart</SelectItem>
                          <SelectItem value="coffee" className={formData.stampIcon === "coffee" ? "bg-blue-100" : ""}>☕ Coffee</SelectItem>
                          <SelectItem value="pizza" className={formData.stampIcon === "pizza" ? "bg-blue-100" : ""}>🍕 Pizza</SelectItem>
                          <SelectItem value="burger" className={formData.stampIcon === "burger" ? "bg-blue-100" : ""}>🍔 Burger</SelectItem>
                          <SelectItem value="icecream" className={formData.stampIcon === "icecream" ? "bg-blue-100" : ""}>🍦 Ice Cream</SelectItem>
                          <SelectItem value="cake" className={formData.stampIcon === "cake" ? "bg-blue-100" : ""}>🍰 Cake</SelectItem>
                          <SelectItem value="beer" className={formData.stampIcon === "beer" ? "bg-blue-100" : ""}>🍺 Beer</SelectItem>
                          <SelectItem value="donut" className={formData.stampIcon === "donut" ? "bg-blue-100" : ""}>🍩 Donut</SelectItem>
                        </SelectContent>
                     </Select>
                   </div>
                </div>
              )}

              {formStep === 1 && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                     <div className="space-y-2">
                       <Label htmlFor="rewardThreshold">Stamps needed for a reward</Label>
                       <Input
                         id="rewardThreshold"
                         type="number"
                         min={1}
                         value={formData.rewardThreshold}
                         onChange={(event) =>
                           setFormData({ ...formData, rewardThreshold: event.target.value })
                         }
                         required
                         className="h-11 rounded-xl border-border bg-background"
                       />
                       {errors.rewardThreshold && <p className="text-sm text-red-500">{errors.rewardThreshold}</p>}
                       {warnings.rewardThreshold && (
                         <div className="flex items-start gap-2 rounded-md bg-yellow-50 p-2 text-sm text-yellow-800">
                           <AlertTriangle className="h-4 w-4 text-yellow-600" />
                           <span>{warnings.rewardThreshold}</span>
                         </div>
                       )}
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor="stampValue">Maximum stamps per visit</Label>
                       <Input
                         id="stampValue"
                         type="number"
                         min={1}
                         value={formData.stampValue}
                         onChange={(event) =>
                           setFormData({ ...formData, stampValue: event.target.value })
                         }
                         required
                         className="h-11 rounded-xl border-border bg-background"
                       />
                       {errors.stampValue && <p className="text-sm text-red-500">{errors.stampValue}</p>}
                     </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                     <div className="space-y-2">
                       <Label htmlFor="expiry">Expiry date</Label>
                       <Input
                         id="expiry"
                         type="date"
                         value={formData.expiry}
                         onChange={(event) => setFormData({ ...formData, expiry: event.target.value })}
                         className="h-11 rounded-xl border-border bg-background"
                       />
                       {errors.expiry && <p className="text-sm text-red-500">{errors.expiry}</p>}
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor="maxPerDay">Max scans per day</Label>
                       <Input
                         id="maxPerDay"
                         type="number"
                         min={0}
                         value={formData.maxPerDay}
                         onChange={(event) =>
                           setFormData({ ...formData, maxPerDay: event.target.value })
                         }
                         className="h-11 rounded-xl border-border bg-background"
                       />
                       {errors.maxPerDay && <p className="text-sm text-red-500">{errors.maxPerDay}</p>}
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor="maxRedemptionsPerDay">Max redemptions per day per customer</Label>
                       <Input
                         id="maxRedemptionsPerDay"
                         type="number"
                         min={0}
                         value={formData.maxRedemptionsPerDay}
                         onChange={(event) =>
                           setFormData({ ...formData, maxRedemptionsPerDay: event.target.value })
                         }
                         className="h-11 rounded-xl border-border bg-background"
                       />
                       {errors.maxRedemptionsPerDay && <p className="text-sm text-red-500">{errors.maxRedemptionsPerDay}</p>}
                       {warnings.maxRedemptionsPerDay && (
                         <div className="flex items-start gap-2 rounded-md bg-yellow-50 p-2 text-sm text-yellow-800">
                           <AlertTriangle className="h-4 w-4 text-yellow-600" />
                           <span>{warnings.maxRedemptionsPerDay}</span>
                         </div>
                       )}
                     </div>
                  </div>

                   <div className="space-y-2">
                     <Label htmlFor="notes">Notes / Terms</Label>
                     <Textarea
                       id="notes"
                       value={formData.notes}
                       onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                       placeholder="Add any friendly reminders or terms for your guests."
                        className="rounded-xl border-border bg-background"
                     />
                   </div>

                   <div className="rounded-lg bg-muted p-4">
                     <h3 className="text-sm font-semibold text-foreground">Program rules & limits</h3>
                     <p className="text-xs text-muted-foreground mt-1">
                       Configure how customers earn and redeem stamps in your loyalty program.
                     </p>
                   </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <div className="text-xs text-muted-foreground">
                  {formStep === 0
                    ? 'Step 1: Set the tone for your experience.'
                    : 'Step 2: Final tweaks before liftoff.'}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-2xl px-4 py-2 text-foreground hover:bg-muted"
                    onClick={closeModal}
                  >
                    Cancel
                  </Button>
                  {formStep > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="rounded-2xl px-4 py-2 text-foreground hover:bg-muted"
                      onClick={() => setFormStep((step) => Math.max(step - 1, 0))}
                    >
                      Back
                    </Button>
                  )}
                  {formStep < 1 && (
                    <Button
                      type="button"
                      className="btn-primary"
                      onClick={() => setFormStep((step) => Math.min(step + 1, 1))}
                    >
                      Next
                    </Button>
                  )}
                  {formStep === 1 && (
                    <Button type="submit" className="btn-primary px-4">
                      {editingProgram ? 'Save changes' : 'Save program'}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const StampIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="1.5"
    stroke="currentColor"
    className="h-4 w-4 text-primary"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 7h10l1 5-6 3-6-3 1-5zM5 20h14"
    />
  </svg>
)

export default Programs
