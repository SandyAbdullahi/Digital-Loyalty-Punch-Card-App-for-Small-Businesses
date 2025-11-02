import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@rudi/ui'

interface Program {
  id: string
  name: string
  description?: string
  logic_type: string
  earn_rule: any
  redeem_rule: any
  terms?: string
  is_active: boolean
}

export default function Programs() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logic_type: 'punch_card',
    earn_rule: '{}',
    redeem_rule: '{}',
    terms: '',
  })

  useEffect(() => {
    fetchPrograms()
  }, [])

  const fetchPrograms = async () => {
    try {
      const response = await axios.get('/api/v1/programs')
      setPrograms(response.data)
    } catch (error) {
      console.error('Failed to fetch programs', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingProgram(null)
    setFormData({
      name: '',
      description: '',
      logic_type: 'punch_card',
      earn_rule: '{"stamps_needed": 10}',
      redeem_rule: '{"points_required": 10}',
      terms: '',
    })
    setIsModalOpen(true)
  }

  const handleEdit = (program: Program) => {
    setEditingProgram(program)
    setFormData({
      name: program.name,
      description: program.description || '',
      logic_type: program.logic_type,
      earn_rule: JSON.stringify(program.earn_rule),
      redeem_rule: JSON.stringify(program.redeem_rule),
      terms: program.terms || '',
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        earn_rule: JSON.parse(formData.earn_rule),
        redeem_rule: JSON.parse(formData.redeem_rule),
      }

      if (editingProgram) {
        await axios.put(`/api/v1/programs/${editingProgram.id}`, data)
      } else {
        await axios.post('/api/v1/programs', data)
      }
      setIsModalOpen(false)
      fetchPrograms()
    } catch (error) {
      console.error('Failed to save program', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this program?')) {
      try {
        await axios.delete(`/api/v1/programs/${id}`)
        fetchPrograms()
      } catch (error) {
        console.error('Failed to delete program', error)
      }
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Loyalty Programs</h1>
        <Button onClick={handleCreate}>Create Program</Button>
      </div>

      <div className="grid gap-4">
        {programs.map((program) => (
          <Card key={program.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {program.name}
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(program)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(program.id)}>Delete</Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{program.description}</p>
              <p>Type: {program.logic_type}</p>
              <p>Active: {program.is_active ? 'Yes' : 'No'}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProgram ? 'Edit Program' : 'Create Program'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="logic_type">Type</Label>
              <Select value={formData.logic_type} onValueChange={(value) => setFormData({ ...formData, logic_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="punch_card">Punch Card</SelectItem>
                  <SelectItem value="points">Points</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="earn_rule">Earn Rule (JSON)</Label>
              <Textarea
                id="earn_rule"
                value={formData.earn_rule}
                onChange={(e) => setFormData({ ...formData, earn_rule: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="redeem_rule">Redeem Rule (JSON)</Label>
              <Textarea
                id="redeem_rule"
                value={formData.redeem_rule}
                onChange={(e) => setFormData({ ...formData, redeem_rule: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="terms">Terms</Label>
              <Textarea
                id="terms"
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              />
            </div>
            <Button type="submit">{editingProgram ? 'Update' : 'Create'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}