import { useEffect, useState } from 'react'
import { Button } from '@rudi/ui'
import { Download, Loader2 } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

type AnalyticsData = {
  merchantId: string
  totalCustomersEnrolled: number
  stampsIssuedThisMonth: number
  rewardsRedeemedThisMonth: number
  visitsByEnrolledCustomers: number
  baselineVisitsEstimate: number
  averageSpendPerVisit: number
  rewardCostEstimate: number
  estimatedExtraVisits: number
  estimatedExtraRevenue: number
  netIncrementalRevenue: number
}

type TopCustomer = {
  name: string
  visits: number
  extraVisits: number
  estimatedRevenue: number
}

const Analytics = () => {
  const { user } = useAuth()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([])
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    try {
      const [analyticsResponse, topCustomersResponse] = await Promise.all([
        axios.get(`/api/v1/merchants/${user.id}/analytics?period=${period}`),
        axios.get(`/api/v1/merchants/${user.id}/top-customers?period=${period}`)
      ])
      setAnalyticsData(analyticsResponse.data)
      setTopCustomers(topCustomersResponse.data)
    } catch (err) {
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = () => {
    if (!analyticsData) return
    const csv = `Metric,Value\nTotal Customers Enrolled,${analyticsData.totalCustomersEnrolled}\nStamps Issued,${analyticsData.stampsIssuedThisMonth}\nRewards Redeemed,${analyticsData.rewardsRedeemedThisMonth}\nEstimated Extra Revenue,${analyticsData.estimatedExtraRevenue}\nNet Incremental Revenue,${analyticsData.netIncrementalRevenue}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'analytics.csv'
    a.click()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !analyticsData) {
    return (
      <div className="text-center text-red-500">
        {error || 'No data available'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Analytics Overview</h1>
        <div className="flex gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="month">This Month</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last 12 Months</option>
          </select>
          <Button onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-primary">Total Customers Enrolled</h3>
          <p className="text-3xl font-bold text-accent">{analyticsData.totalCustomersEnrolled}</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-primary">Stamps Issued</h3>
          <p className="text-3xl font-bold text-accent">{analyticsData.stampsIssuedThisMonth}</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-primary">Rewards Redeemed</h3>
          <p className="text-3xl font-bold text-accent">{analyticsData.rewardsRedeemedThisMonth}</p>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-primary mb-4">Revenue Estimation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Estimated Extra Visits</p>
            <p className="text-2xl font-bold text-accent">{analyticsData.estimatedExtraVisits}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Estimated Extra Revenue</p>
            <p className="text-2xl font-bold text-accent">KES {analyticsData.estimatedExtraRevenue.toLocaleString()}</p>
          </div>
          <div>
            <p className={`text-sm text-muted-foreground ${analyticsData.netIncrementalRevenue < 0 ? 'text-red-500' : 'text-accent'}`}>
              Net Incremental Revenue
            </p>
            <p className={`text-2xl font-bold ${analyticsData.netIncrementalRevenue < 0 ? 'text-red-500' : 'text-accent'}`}>
              KES {analyticsData.netIncrementalRevenue.toLocaleString()}
            </p>
            {analyticsData.netIncrementalRevenue < 0 && (
              <p className="text-xs text-red-500">Your reward cost exceeded estimated uplift</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-primary mb-4">Top 10 Enrolled Customers</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Customer Name</th>
                <th className="text-left p-2">Visits</th>
                <th className="text-left p-2">Extra Visits</th>
                <th className="text-left p-2">Estimated Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((customer, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{customer.name}</td>
                  <td className="p-2">{customer.visits}</td>
                  <td className="p-2">{customer.extraVisits}</td>
                  <td className="p-2">KES {customer.estimatedRevenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Analytics
