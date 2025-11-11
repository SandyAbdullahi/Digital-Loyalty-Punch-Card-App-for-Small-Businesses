import { useEffect, useState } from 'react'
import { Card, Text, Group, Stack, Select, Table, Badge, Alert, Button, Loader } from '@mantine/core'
import { TrendingUp, Users, Ticket, Gift, AlertTriangle } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

type Period = {
  start: string
  end: string
  label: string
}

type Totals = {
  totalCustomersEnrolled: number
  stampsIssued: number
  rewardsRedeemed: number
  repeatVisitRate?: number
}

type RevenueEstimation = {
  baselineVisits: number
  estimatedExtraVisits: number
  estimatedExtraRevenueKES: number
  conservativeLowerKES?: number
  conservativeUpperKES?: number
  totalRewardCostKES: number
  netIncrementalRevenueKES: number
}



type Program = {
  programId: string
  name: string
  stampsRequired: number
  customersEnrolled: number
  visits: number
  redemptions: number
  baselineVisits: number
  estimatedExtraVisits: number
  estimatedExtraRevenueKES: number
  netIncrementalRevenueKES: number
}

type AnalyticsData = {
  merchantId: string
  period: Period
  totals: Totals
  revenueEstimation: RevenueEstimation
  anomalyFlags?: string[]
  programs: Program[]
}

type TopCustomer = {
  customerId: string
  name: string
  visits: number
  baselineVisitsEstimate: number
  extraVisits: number
  estimatedRevenueKES: number
}

const Analytics = () => {
  const { user, merchant } = useAuth()
  const navigate = useNavigate()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([])
  const [period, setPeriod] = useState('this_month')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    if (!merchant?.id) return
    setLoading(true)
    setError(null)
    try {
      const [analyticsResponse, topCustomersResponse] = await Promise.all([
        axios.get(`/api/v1/merchants/${merchant.id}/analytics?period=${period}`),
        axios.get(`/api/v1/merchants/${merchant.id}/analytics/customers?period=${period}`)
      ])
      setAnalyticsData(analyticsResponse.data)
      setTopCustomers(topCustomersResponse.data.customers || [])
    } catch (err) {
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    )
  }

  if (error || !analyticsData) {
    return (
      <Alert color="red" title="Error">
        {error || 'No data available'}
      </Alert>
    )
  }

  const hasSettings = analyticsData.revenueEstimation.baselineVisits > 0 // Assuming if baseline > 0, settings are configured

  return (
    <Stack spacing="lg">
      <Group justify="space-between">
        <Text size="xl" fw={700}>Analytics Overview - {analyticsData.period.label}</Text>
        <Group>
          <Select
            value={period}
            onChange={(value) => setPeriod(value || 'this_month')}
            data={[
              { value: 'this_month', label: 'This Month' },
              { value: 'last_3_months', label: 'Last 3 Months' },
              { value: 'last_12_months', label: 'Last 12 Months' },
            ]}
          />
        </Group>
      </Group>

      {!hasSettings && (
        <Alert icon={<AlertTriangle size={16} />} title="Settings Required" color="orange">
          Estimates require Avg Spend/Baseline/Reward Cost. Configure now.
          <Button variant="light" size="xs" ml="md" onClick={() => navigate('/settings')}>Go to Settings</Button>
        </Alert>
      )}

      <Group grow>
        <Card withBorder>
          <Group>
            <Users size={24} />
            <div>
              <Text size="sm" c="dimmed">Total Customers Enrolled</Text>
              <Text size="xl" fw={700}>{analyticsData.totals.totalCustomersEnrolled}</Text>
            </div>
          </Group>
        </Card>
        <Card withBorder>
          <Group>
            <Ticket size={24} />
            <div>
              <Text size="sm" c="dimmed">Stamps Issued</Text>
              <Text size="xl" fw={700}>{analyticsData.totals.stampsIssued}</Text>
            </div>
          </Group>
        </Card>
        <Card withBorder>
          <Group>
            <Gift size={24} />
            <div>
              <Text size="sm" c="dimmed">Rewards Redeemed</Text>
              <Text size="xl" fw={700}>{analyticsData.totals.rewardsRedeemed}</Text>
            </div>
          </Group>
        </Card>
        {analyticsData.totals.repeatVisitRate !== undefined && (
          <Card withBorder>
            <Group>
              <TrendingUp size={24} />
              <div>
                <Text size="sm" c="dimmed">Repeat Visit Rate</Text>
                <Text size="xl" fw={700}>{analyticsData.totals.repeatVisitRate.toFixed(2)}</Text>
              </div>
            </Group>
          </Card>
        )}
      </Group>

      <Card withBorder>
        <Text size="lg" fw={600} mb="md">Revenue Estimation</Text>
        <Group grow>
          <div>
            <Text size="sm" c="dimmed">Baseline Visits</Text>
            <Text size="lg" fw={500}>{analyticsData.revenueEstimation.baselineVisits.toFixed(1)}</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed">Estimated Extra Visits</Text>
            <Text size="lg" fw={500} c="green">{analyticsData.revenueEstimation.estimatedExtraVisits.toFixed(1)}</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed">Estimated Extra Revenue (KES)</Text>
            <Text size="lg" fw={500} c="green">{analyticsData.revenueEstimation.estimatedExtraRevenueKES.toFixed(2)}</Text>
            {analyticsData.revenueEstimation.conservativeLowerKES && (
              <Text size="xs" c="dimmed">
                Range: {analyticsData.revenueEstimation.conservativeLowerKES.toFixed(2)} - {analyticsData.revenueEstimation.conservativeUpperKES?.toFixed(2)}
              </Text>
            )}
          </div>
          <div>
            <Text size="sm" c="dimmed">Total Reward Cost (KES)</Text>
            <Text size="lg" fw={500} c="red">{analyticsData.revenueEstimation.totalRewardCostKES.toFixed(2)}</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed">Net Incremental Revenue (KES)</Text>
            <Text size="lg" fw={500} c={analyticsData.revenueEstimation.netIncrementalRevenueKES >= 0 ? 'green' : 'red'}>
              {analyticsData.revenueEstimation.netIncrementalRevenueKES.toFixed(2)}
            </Text>
          </div>
        </Group>
      </Card>

      {analyticsData.anomalyFlags && analyticsData.anomalyFlags.length > 0 && (
        <Alert icon={<AlertTriangle size={16} />} title="Anomalies Detected" color="orange">
          {analyticsData.anomalyFlags.map(flag => (
            <Text key={flag} size="sm">
              {flag === 'negative_net_revenue' ? 'Net incremental revenue is negative' : flag}
            </Text>
          ))}
        </Alert>
      )}

      <Card withBorder>
        <Text size="lg" fw={600} mb="md">Top Customers by Extra Visits</Text>
        <Table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Visits</th>
              <th>Baseline</th>
              <th>Extra Visits</th>
              <th>Est. Revenue (KES)</th>
            </tr>
          </thead>
          <tbody>
            {topCustomers.slice(0, 10).map((customer) => (
              <tr key={customer.customerId}>
                <td>{customer.name}</td>
                <td>{customer.visits}</td>
                <td>{customer.baselineVisitsEstimate.toFixed(1)}</td>
                <td>{customer.extraVisits.toFixed(1)}</td>
                <td>{customer.estimatedRevenueKES.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card withBorder>
        <Text size="lg" fw={600} mb="md">Program Breakdown</Text>
        <Table>
          <thead>
            <tr>
              <th>Program</th>
              <th>Customers</th>
              <th>Visits</th>
              <th>Redemptions</th>
              <th>Extra Visits</th>
              <th>Est. Revenue (KES)</th>
              <th>Net Revenue (KES)</th>
            </tr>
          </thead>
          <tbody>
            {analyticsData.programs.map((program) => (
              <tr key={program.programId}>
                <td>{program.name}</td>
                <td>{program.customersEnrolled}</td>
                <td>{program.visits}</td>
                <td>{program.redemptions}</td>
                <td>{program.estimatedExtraVisits.toFixed(1)}</td>
                <td>{program.estimatedExtraRevenueKES.toFixed(2)}</td>
                <td className={program.netIncrementalRevenueKES >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {program.netIncrementalRevenueKES.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Stack>
  )
}

export default Analytics
