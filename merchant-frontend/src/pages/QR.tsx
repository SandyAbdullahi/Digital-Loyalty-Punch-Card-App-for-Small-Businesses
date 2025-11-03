import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
// @ts-ignore
import QRCode from 'qrcode'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@rudi/ui'
import { Copy, Download, Loader2 } from 'lucide-react'

type Location = {
  id: string
  name: string
}

type QrType = 'join' | 'stamp' | 'redeem'

const QR = () => {
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [qrType, setQrType] = useState<QrType>('join')
  const [amount, setAmount] = useState<string>('')
  const [qrData, setQrData] = useState<string>('')
  const [qrImage, setQrImage] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [feedback, setFeedback] = useState<string>('')
  const downloadRef = useRef<HTMLAnchorElement | null>(null)

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get('/api/v1/merchants/locations')
        setLocations(response.data)
        if (response.data.length) {
          setSelectedLocation(response.data[0].id)
        }
      } catch (error) {
        console.error('Failed to fetch locations', error)
      }
    }
    fetchLocations()
  }, [])

  const showFeedback = (message: string) => {
    setFeedback(message)
    setTimeout(() => setFeedback(''), 2200)
  }

  const generateQR = async () => {
    if (!selectedLocation) return
    setIsGenerating(true)
    try {
      let endpoint = '/api/v1/qr/issue-join'
      const payload: Record<string, unknown> = { location_id: selectedLocation }

      if (qrType === 'stamp') {
        endpoint = '/api/v1/qr/issue-stamp'
      } else if (qrType === 'redeem') {
        endpoint = '/api/v1/qr/issue-redeem'
        payload.amount = Number(amount || 1)
      }

      const response = await axios.post(endpoint, payload)
      const token = response.data.token
      setQrData(token)
      const dataUrl = await QRCode.toDataURL(token)
      setQrImage(dataUrl)
      showFeedback('Fresh QR ready to share!')
    } catch (error) {
      console.error('Failed to generate QR', error)
      showFeedback('We could not create that QR. Try again?')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyLink = async () => {
    if (!qrData) return
    try {
      await navigator.clipboard.writeText(qrData)
      showFeedback('Link copied — ready to paste!')
    } catch (error) {
      console.error('Failed to copy link', error)
    }
  }

  const downloadQR = () => {
    if (!qrImage || !downloadRef.current) return
    downloadRef.current.href = qrImage
    downloadRef.current.download = `rudi-qr-${qrType}.png`
    downloadRef.current.click()
    showFeedback('QR saved — share the joy offline!')
  }

  return (
    <div className="flex justify-center">
      <div className="flex w-full max-w-3xl flex-col items-center gap-6 rounded-3xl bg-white/90 p-8 text-center shadow-rudi-card lg:p-12">
        <div className="space-y-2 animate-slide-up">
          <h1 className="font-heading text-3xl font-semibold text-rudi-maroon">
            Scan or display this QR to award a stamp.
          </h1>
          <p className="text-sm text-rudi-maroon/70">
            QRs last 60 seconds — keeping every reward secure for your guests.
          </p>
        </div>

        <div className="grid w-full gap-4 text-left md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-rudi-maroon">Location</Label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="h-12 rounded-2xl border-[#EADCC7] bg-[#FFF9F0] px-4">
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-rudi-maroon">QR purpose</Label>
            <Select value={qrType} onValueChange={(value: QrType) => setQrType(value)}>
              <SelectTrigger className="h-12 rounded-2xl border-[#EADCC7] bg-[#FFF9F0] px-4">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="join">Join program</SelectItem>
                <SelectItem value="stamp">Award stamp</SelectItem>
                <SelectItem value="redeem">Redeem reward</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {qrType === 'redeem' && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-rudi-maroon">
                Reward amount
              </Label>
              <Input
                type="number"
                min={1}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="h-12 rounded-2xl border-[#EADCC7] bg-[#FFF9F0]"
                placeholder="e.g. 2 coffees"
              />
            </div>
          )}
        </div>

        <Button
          className="btn-primary mt-2 h-11 px-6"
          onClick={generateQR}
          disabled={!selectedLocation || (qrType === 'redeem' && !amount) || isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            'Generate QR'
          )}
        </Button>

        <div
          className={`relative mt-4 flex min-h-[280px] w-full max-w-sm flex-col items-center justify-center rounded-3xl border-2 border-dashed border-rudi-teal/30 bg-rudi-sand/40 p-6 ${
            qrImage ? 'animate-pulse-soft' : ''
          }`}
        >
          {qrImage ? (
            <img
              key={qrImage}
              src={qrImage}
              alt="Merchant QR Code"
              className="h-48 w-48 rounded-2xl border border-rudi-teal/20 bg-white p-3 shadow-md"
            />
          ) : (
            <div className="space-y-3 text-sm text-rudi-maroon/60">
              <p>No QR yet.</p>
              <p>Choose a location and generate a fresh link.</p>
            </div>
          )}
          <span className="mt-4 text-xs text-rudi-maroon/60">
            Each QR expires after 60 seconds for security.
          </span>
        </div>

        {qrImage && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button className="btn-primary h-10 px-4" type="button" onClick={copyLink}>
              <Copy className="mr-2 h-4 w-4" />
              Copy link
            </Button>
            <Button className="btn-secondary h-10 px-4" type="button" onClick={downloadQR}>
              <Download className="mr-2 h-4 w-4" />
              Download QR
            </Button>
            <a ref={downloadRef} className="hidden" aria-hidden="true" />
          </div>
        )}

        {feedback && (
          <div className="rounded-full bg-rudi-teal/10 px-4 py-2 text-xs font-semibold text-rudi-teal shadow-sm">
            {feedback}
          </div>
        )}
      </div>
    </div>
  )
}

export default QR
