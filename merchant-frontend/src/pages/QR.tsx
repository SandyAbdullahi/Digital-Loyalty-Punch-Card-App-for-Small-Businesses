import { useState, useEffect } from 'react'
import axios from 'axios'
import QRCode from 'qrcode'
import { Button, Card, CardContent, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Input, Label } from '@rudi/ui'

interface Location {
  id: string
  name: string
}

export default function QR() {
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [qrType, setQrType] = useState<'join' | 'stamp' | 'redeem'>('join')
  const [amount, setAmount] = useState('')
  const [qrData, setQrData] = useState('')
  const [qrImage, setQrImage] = useState('')

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const response = await axios.get('/api/v1/merchants/locations')
      setLocations(response.data)
    } catch (error) {
      console.error('Failed to fetch locations', error)
    }
  }

  const generateQR = async () => {
    if (!selectedLocation) return

    try {
      let endpoint = '/api/v1/qr/issue-join'
      let payload: any = { location_id: selectedLocation }

      if (qrType === 'stamp') {
        endpoint = '/api/v1/qr/issue-stamp'
      } else if (qrType === 'redeem') {
        endpoint = '/api/v1/qr/issue-redeem'
        payload.amount = parseInt(amount)
      }

      const response = await axios.post(endpoint, payload)
      const token = response.data.token
      setQrData(token)

      // Generate QR code image
      const qrImageUrl = await QRCode.toDataURL(token)
      setQrImage(qrImageUrl)
    } catch (error) {
      console.error('Failed to generate QR', error)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Generate QR Codes</h1>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>QR Code Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="location">Location</Label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="type">QR Type</Label>
            <Select value={qrType} onValueChange={(value: 'join' | 'stamp' | 'redeem') => setQrType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="join">Join Program</SelectItem>
                <SelectItem value="stamp">Earn Stamp</SelectItem>
                <SelectItem value="redeem">Redeem Points</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {qrType === 'redeem' && (
            <div>
              <Label htmlFor="amount">Amount to Redeem</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
          )}

          <Button onClick={generateQR} disabled={!selectedLocation}>
            Generate QR Code
          </Button>

          {qrImage && (
            <div className="mt-4">
              <img src={qrImage} alt="QR Code" className="mx-auto" />
              <p className="text-sm text-gray-500 mt-2 break-all">{qrData}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}