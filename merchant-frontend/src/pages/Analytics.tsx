import { useMemo, useState } from 'react'
import { Button, Input, Label } from '@rudi/ui'
import { Download } from 'lucide-react'

const lineChartConfig = {
  width: 360,
  height: 200,
  padding: 30,
}

type StampData = { day: string; stamps: number; redemptions: number }
type BarData = { day: string; customers: number }
type ProgramData = { name: string; value: number }

const stampsData: StampData[] = [
  { day: 'Mon', stamps: 42, redemptions: 12 },
  { day: 'Tue', stamps: 55, redemptions: 18 },
  { day: 'Wed', stamps: 60, redemptions: 20 },
  { day: 'Thu', stamps: 48, redemptions: 16 },
  { day: 'Fri', stamps: 75, redemptions: 28 },
  { day: 'Sat', stamps: 98, redemptions: 34 },
  { day: 'Sun', stamps: 65, redemptions: 21 },
]

const activeCustomersData: BarData[] = [
  { day: 'Mon', customers: 120 },
  { day: 'Tue', customers: 132 },
  { day: 'Wed', customers: 150 },
  { day: 'Thu', customers: 142 },
  { day: 'Fri', customers: 180 },
  { day: 'Sat', customers: 210 },
  { day: 'Sun', customers: 170 },
]

const programPerformance: ProgramData[] = [
  { name: 'Morning Brew', value: 34 },
  { name: 'Lunch Club', value: 26 },
  { name: 'Sweet Treats', value: 18 },
  { name: 'Weekend Vibes', value: 22 },
]

const chartColors = ['#00C896', '#2196F3', '#FF5252']

const buildLinePath = (data: StampData[], key: keyof StampData) => {
  const { width, height, padding } = lineChartConfig
  const max = Math.max(...data.map((item) => item[key] as number)) || 1
  const plotWidth = width - padding * 2
  const plotHeight = height - padding * 2

  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * plotWidth
    const value = (item[key] as number) ?? 0
    const y = padding + plotHeight - (value / max) * plotHeight
    return `${x},${y}`
  })

  return points.join(' ')
}

const generatePieGradient = (data: ProgramData[]) => {
  const total = data.reduce((acc, item) => acc + item.value, 0) || 1
  let current = 0
  return data
    .map((item, index) => {
      const start = (current / total) * 100
      current += item.value
      const end = (current / total) * 100
      const color = chartColors[index % chartColors.length]
      return `${color} ${start}% ${end}%`
    })
    .join(', ')
}

const Analytics = () => {
  const [dateRange, setDateRange] = useState({ from: '', to: '' })

  const pieGradient = useMemo(() => generatePieGradient(programPerformance), [])

  const handleExport = () => {
    const csv = [
      ['Day', 'Stamps', 'Redemptions'],
      ...stampsData.map((item) => [item.day, item.stamps, item.redemptions]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'rudi-analytics.csv')
    document.body.appendChild(link)
    link.click()
    link.parentNode?.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-3xl font-semibold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Track loyalty momentum and spotlight your top-performing programs.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-3xl bg-card/60 p-5 shadow-lg md:flex-row md:items-end md:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">From</Label>
            <Input
              type="date"
              value={dateRange.from}
              onChange={(event) => setDateRange((prev) => ({ ...prev, from: event.target.value }))}
              className="h-11 rounded-2xl border-border bg-background"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">To</Label>
            <Input
              type="date"
              value={dateRange.to}
              onChange={(event) => setDateRange((prev) => ({ ...prev, to: event.target.value }))}
              className="h-11 rounded-2xl border-border bg-background"
            />
          </div>
        </div>
        <Button type="button" className="btn-secondary h-11 px-5" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card-hover rounded-3xl bg-card p-6 shadow-lg animate-slide-up">
          <h2 className="font-heading text-lg text-foreground">Stamps vs. Redemptions</h2>
          <p className="text-xs text-muted-foreground">
            Monitor pace of stamps awarded against joyful redemptions.
          </p>
          <div className="mt-6 flex justify-center">
            <svg
              viewBox={`0 0 ${lineChartConfig.width} ${lineChartConfig.height}`}
              className="w-full max-w-lg text-muted-foreground/50"
            >
              <rect
                x={lineChartConfig.padding}
                y={lineChartConfig.padding}
                width={lineChartConfig.width - lineChartConfig.padding * 2}
                height={lineChartConfig.height - lineChartConfig.padding * 2}
                fill="none"
                stroke="var(--border)"
                strokeDasharray="6 6"
              />
               <polyline
                 points={buildLinePath(stampsData, 'stamps')}
                 fill="none"
                 stroke="#00C896"
                 strokeWidth={3}
                 strokeLinecap="round"
               />
               <polyline
                 points={buildLinePath(stampsData, 'redemptions')}
                 fill="none"
                 stroke="#2196F3"
                 strokeWidth={3}
                 strokeLinecap="round"
               />
              {stampsData.map((item, index) => {
                const x =
                  lineChartConfig.padding +
                  (index / (stampsData.length - 1)) *
                    (lineChartConfig.width - lineChartConfig.padding * 2)
                return (
                  <text
                    key={item.day}
                    x={x}
                    y={lineChartConfig.height - lineChartConfig.padding + 16}
                    fontSize="10"
                    textAnchor="middle"
                     fill="var(--muted-foreground)"
                  >
                    {item.day}
                  </text>
                )
              })}
            </svg>
          </div>
        </div>

        <div className="card-hover rounded-3xl bg-card p-6 shadow-lg animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <h2 className="font-heading text-lg text-foreground">Active customers per day</h2>
          <p className="text-xs text-muted-foreground">
            Keep an eye on the daily rhythm of your loyalty community.
          </p>
          <div className="mt-6 flex h-64 items-end gap-3">
            {activeCustomersData.map((item) => {
              const max = Math.max(...activeCustomersData.map((record) => record.customers)) || 1
              const height = Math.max((item.customers / max) * 100, 8)
              return (
                <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-2xl bg-secondary transition-all duration-200"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{item.day}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div
          className="card-hover rounded-3xl bg-card p-6 shadow-lg animate-slide-up md:col-span-2 lg:col-span-1"
          style={{ animationDelay: '0.1s' }}
        >
          <h2 className="font-heading text-lg text-foreground">Top performing programs</h2>
          <p className="text-xs text-muted-foreground">
            Celebrate the loyalty adventures that spark the most smiles.
          </p>
          <div className="mt-6 flex flex-col items-center gap-4 lg:flex-row">
            <div
              className="h-48 w-48 rounded-full"
              style={{ background: `conic-gradient(${pieGradient})` }}
            >
              <div className="relative h-full w-full rounded-full bg-card/0">
                <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-card/90 shadow-inner" />
              </div>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              {programPerformance.map((program, index) => (
                <div key={program.name} className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  />
                  <span>{program.name}</span>
                  <span className="ml-auto font-semibold text-foreground">{program.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
