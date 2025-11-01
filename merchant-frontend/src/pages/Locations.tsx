import { useEffect, useState } from 'react'
import axios from 'axios'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@rudi/ui'

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
    try {
      await axios.delete(`/api/v1/merchants/locations/${id}`)
      setLocations(locations.filter(loc => loc.id !== id))
    } catch (error) {
      console.error('Failed to delete location', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Locations</h1>
        <Button>Add Location</Button>
      </div>
      <div className="grid gap-4">
        {locations.map((location) => (
          <Card key={location.id}>
            <CardHeader>
              <CardTitle>{location.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{location.address}</p>
              <p>Lat: {location.lat}, Lng: {location.lng}</p>
              <div className="mt-2 space-x-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => deleteLocation(location.id)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}