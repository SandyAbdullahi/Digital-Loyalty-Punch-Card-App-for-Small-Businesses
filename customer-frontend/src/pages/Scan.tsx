import { useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import axios from 'axios'

export default function Scan() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scanned, setScanned] = useState<string | null>(null)
  const [scanner, setScanner] = useState<QrScanner | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const getLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000 }
      )
    })
  }

  const handleScan = async (token: string) => {
    setLoading(true)
    setMessage('')
    try {
      const location = await getLocation()
      // Determine scan type from token (simple check)
      let endpoint = '/api/v1/qr/scan-join' // default
      if (token.includes('stamp')) endpoint = '/api/v1/qr/scan-stamp'
      else if (token.includes('redeem')) endpoint = '/api/v1/qr/scan-redeem'

      const response = await axios.post(endpoint, {
        token,
        lat: location.lat,
        lng: location.lng,
      })
      setMessage(response.data.message || 'Success')
    } catch (error: any) {
      setMessage(error.response?.data?.detail || error.message || 'Scan failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (videoRef.current) {
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          setScanned(result.data)
          handleScan(result.data)
          qrScanner.stop()
        },
        {
          onDecodeError: (err) => console.log(err),
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      )
      setScanner(qrScanner)
      qrScanner.start().catch((err) => console.error(err))
    }

    return () => {
      if (scanner) {
        scanner.stop()
        scanner.destroy()
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4">Scan QR Code</h2>
      <div className="relative">
        <video ref={videoRef} className="w-full max-w-md border rounded" />
      </div>
      {loading && <p className="mt-4">Processing...</p>}
      {message && (
        <div className="mt-4 p-4 bg-blue-100 border rounded">
          <p>{message}</p>
        </div>
      )}
      {scanned && !loading && (
        <div className="mt-4 p-4 bg-green-100 border rounded">
          <p>Scanned: {scanned}</p>
        </div>
      )}
    </div>
  )
}