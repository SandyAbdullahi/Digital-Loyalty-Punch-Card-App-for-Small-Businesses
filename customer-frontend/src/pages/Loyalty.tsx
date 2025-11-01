import { useEffect, useState } from 'react'
import axios from 'axios'

interface Membership {
  id: string
  program_id: string
  current_balance: number
}

export default function Loyalty() {
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await axios.get('/api/v1/customer/memberships')
        setMemberships(response.data)
      } catch (error) {
        console.error('Failed to fetch memberships', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMemberships()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <>
      <h2 className="text-xl font-bold mb-4">My Loyalty Programs</h2>
      {memberships.length === 0 ? (
        <p>No memberships yet. Scan a QR code to join a program!</p>
      ) : (
        <div className="grid gap-4">
          {memberships.map((membership) => (
            <div key={membership.id} className="border rounded p-4">
              <h3 className="text-lg font-semibold">Program {membership.program_id}</h3>
              <p>Points: {membership.current_balance}</p>
            </div>
          ))}
        </div>
      )}
    </>
  )
}