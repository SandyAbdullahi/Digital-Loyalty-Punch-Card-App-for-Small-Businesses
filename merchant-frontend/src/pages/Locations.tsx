import { useEffect, useState } from 'react'
import axios from 'axios'
import { Button } from '@rudi/ui'
import { MapPin, PenSquare, Trash2 } from 'lucide-react'

interface Location {
  id: string
  name: string
  address: string
  lat: number
  lng: number
}

export default function Locations() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const response = await axios.get('/api/v1/merchants/locations')
      setLocations(response.data)
    } catch (error) {
      console.error('Failed to fetch locations', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteLocation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return
    try {
      await axios.delete(`/api/v1/merchants/locations/${id}`)
      setLocations(locations.filter(loc => loc.id !== id))
    } catch (error) {
      console.error('Failed to delete location', error)
    }
  }

  if (loading) {
    return <div className="py-10 text-sm text-rudi-maroon/70">Loading locations…</div>
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-rudi-maroon">Locations</h1>
          <p className="text-sm text-rudi-maroon/70">
            Manage your business locations and keep track of where loyalty happens.
          </p>
        </div>
        <Button className="btn-primary rounded-2xl px-5">
          + Add Location
        </Button>
      </header>

      <section className="grid gap-5 lg:grid-cols-2">
        {locations.map((location, index) => (
          <article
            key={location.id}
            className="card-hover flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-rudi-card animate-slide-up"
            style={{ animationDelay: `${index * 0.04}s` }}
          >
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-rudi-teal" />
              <div className="flex-1">
                <h2 className="font-heading text-xl font-semibold text-rudi-maroon">
                  {location.name}
                </h2>
                <p className="text-sm text-rudi-maroon/70">{location.address}</p>
                <p className="text-xs text-rudi-maroon/60 mt-1">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                className="rounded-2xl border-rudi-teal/30 text-rudi-teal hover:bg-rudi-teal/10"
              >
                <PenSquare className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="ghost"
                className="rounded-2xl px-3 py-2 text-rudi-coral hover:bg-rudi-coral/10"
                onClick={() => deleteLocation(location.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </article>
        ))}

        {!locations.length && (
          <div className="rounded-3xl bg-white p-8 text-center shadow-rudi-card">
            <h3 className="font-heading text-lg text-rudi-maroon">No locations yet</h3>
            <p className="mt-2 text-sm text-rudi-maroon/70">
              Add your first location to start tracking loyalty across your business.
            </p>
            <Button className="btn-primary mt-4">
              Add your first location
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}