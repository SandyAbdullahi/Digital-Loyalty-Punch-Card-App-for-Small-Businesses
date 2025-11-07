import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
// @ts-ignore
import QRCode from 'qrcode'
import {
  Button,
  Input,
  Label,
} from '@rudi/ui'
import { Copy, Download, Loader2 } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'

type Program = {
  id: string
  name: string
}

type QrType = 'join' | 'stamp' | 'redeem'

const DemoQR = () => {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [programs, setPrograms] = useState<Program[]>([])
  const [selectedProgram, setSelectedProgram] = useState<string>('')
  const [qrType, setQrType] = useState<QrType>('join')
  const [amount, setAmount] = useState<string>('')
  const [qrData, setQrData] = useState<string>('')
  const [qrImage, setQrImage] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [feedback, setFeedback] = useState<string>('')
  const downloadRef = useRef<HTMLAnchorElement | null>(null)

  useEffect(() => {
    // Mock programs
    const mockPrograms: Program[] = [
      { id: '1', name: 'Coffee Rewards' },
      { id: '2', name: 'Bakery Loyalty' },
      { id: '3', name: 'Diner Perks' },
    ]
    setPrograms(mockPrograms)
    setSelectedProgram(mockPrograms[0].id)
  }, [])

  const showFeedback = (message: string) => {
    setFeedback(message)
    setTimeout(() => setFeedback(''), 2200)
  }

  const generateQR = async () => {
    if (!selectedProgram) return
    setIsGenerating(true)
    try {
      // Mock token generation
      const mockToken = `rudi-demo-${qrType}-${selectedProgram}-${Date.now()}`
      setQrData(mockToken)
      const dataUrl = await QRCode.toDataURL(mockToken)
      setQrImage(dataUrl)
      showFeedback('Demo QR ready to share!')
    } catch (error) {
      console.error('Failed to generate QR', error)
      showFeedback('Demo QR generation failed.')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyLink = async () => {
    if (!qrData) return
    try {
      await navigator.clipboard.writeText(qrData)
      showFeedback('Demo link copied!')
    } catch (error) {
      console.error('Failed to copy link', error)
    }
  }

  const downloadQR = () => {
    if (!qrImage || !downloadRef.current) return
    downloadRef.current.href = qrImage
    downloadRef.current.download = `rudi-demo-qr-${qrType}.png`
    downloadRef.current.click()
    showFeedback('Demo QR saved!')
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col lg:ml-60">
        <TopBar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto px-4 pb-10 pt-4 sm:px-6 lg:px-8">
          <div className="space-y-6 lg:space-y-8">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-heading text-2xl font-bold text-foreground">
                  QR Issuance
                </h1>
                <p className="text-sm text-muted-foreground">
                  Generate QR codes for joining, stamping, or redeeming rewards
                </p>
              </div>
            </header>

            <div className="flex justify-center">
              <div className="flex w-full max-w-3xl flex-col items-center gap-6 rounded-3xl bg-card p-8 text-center shadow-lg lg:p-12">
        <div className="space-y-2 animate-slide-up">
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            {qrType === 'join' ? 'Scan to join your loyalty program.' :
             qrType === 'stamp' ? 'Scan or display this QR to award a stamp.' :
             'Scan to redeem a reward.'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Demo QRs are for preview — real QRs expire in 60 seconds for security.
          </p>
        </div>

        <div className="grid w-full gap-4 text-left md:grid-cols-2">
           <div className="space-y-2">
             <Label className="text-sm font-semibold text-foreground">Program</Label>
             <select
               value={selectedProgram}
               onChange={(e) => setSelectedProgram(e.target.value)}
               className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm"
             >
               <option value="" disabled>Select a program</option>
               {programs.map((program) => (
                 <option key={program.id} value={program.id}>
                   {program.name}
                 </option>
               ))}
             </select>
           </div>

           <div className="space-y-2">
             <Label className="text-sm font-semibold text-foreground">QR purpose</Label>
             <select
               value={qrType}
               onChange={(e) => setQrType(e.target.value as QrType)}
               className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm"
             >
               <option value="join">Join program</option>
               <option value="stamp">Award stamp</option>
               <option value="redeem">Redeem reward</option>
             </select>
           </div>

          {qrType === 'redeem' && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">
                Reward amount
              </Label>
              <Input
                type="number"
                min={1}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="h-12 rounded-2xl border-border bg-background"
                placeholder="e.g. 2 coffees"
              />
            </div>
          )}
        </div>

        <Button
          className="btn-primary mt-2 h-11 px-6"
          onClick={generateQR}
          disabled={!selectedProgram || (qrType === 'redeem' && !amount) || isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            'Generate Demo QR'
          )}
        </Button>

        <div
          className={`relative mt-4 flex min-h-[280px] w-full max-w-sm flex-col items-center justify-center rounded-3xl border-2 border-dashed border-primary/30 bg-muted/40 p-6 ${
            qrImage ? 'animate-pulse-soft' : ''
          }`}
        >
          {qrImage ? (
            <img
              key={qrImage}
              src={qrImage}
              alt="Demo QR Code"
              className="h-48 w-48 rounded-2xl border border-primary/20 bg-card p-3 shadow-md"
            />
          ) : (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>No QR yet.</p>
              <p>Choose a program and generate a demo link.</p>
            </div>
          )}
          <span className="mt-4 text-xs text-muted-foreground">
            Demo QR for preview purposes.
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
          <div className="rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold text-primary shadow-sm">
            {feedback}
          </div>
            )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default DemoQR