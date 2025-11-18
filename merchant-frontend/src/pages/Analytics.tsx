import { useEffect, useState } from 'react'
import { Card, Text, Group, Stack, Select, Table, Badge, Alert, Button, Loader, SimpleGrid, Container } from '@mantine/core'
import { TrendingUp, Users, Ticket, Gift, AlertTriangle } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import StatsCard from '../components/StatsCard'
import RevenueChart from '../components/RevenueChart'

type Period = {
  start: string
  end: string
  label: string
}

type AnalyticsKpis = {
  totalCustomersEnrolled: number
  stampsIssued: number
  rewardsRedeemed: number
  repeatVisitRate: number
  avgVisitsPerActiveCustomer: number
}

type RevenueEstimation = {
  baselineVisits: number
  estimatedExtraVisits: number
  estimatedExtraRevenueKES: number
  conservativeLowerKES?: number
  conservativeUpperKES?: number
  totalRewardCostKES: number
  netIncrementalRevenueKES: number
  roiPercentage?: number
  confidenceInterval?: string
  missingAssumptions?: boolean
}



type Engagement = {
  activeCustomers: number
  avgVisitsPerActive: number
}

type Program = {
  programId: string
  name: string
  created_at?: string | null
  expires_at?: string | null
  expiresAt?: string | null
  reward_expiry_days?: number | null
  customersActive: number
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
  kpis: AnalyticsKpis
  revenueEstimation: RevenueEstimation
  engagement: Engagement
  warnings: string[]
  programs: Program[]
}

type TopCustomer = {
  customerId?: string
  email?: string
  name: string
  visits: number
  baselineVisitsEstimate: number
  extraVisits: number
  estimatedRevenueKES: number
}

const formatExpiry = (value?: string | null) => {
  if (!value) return 'Never'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
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
    <Container fluid>
      <Stack gap="lg">
        <Group justify="space-between">
          <Text size="xl" fw={700}>Analytics Dashboard - {analyticsData.period.label}</Text>
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

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          <StatsCard
            title="Total Customers Enrolled"
            value={analyticsData.kpis.totalCustomersEnrolled}
            icon={<Users size={24} />}
          />
          <StatsCard
            title="Stamps Issued"
            value={analyticsData.kpis.stampsIssued}
            icon={<Ticket size={24} />}
          />
          <StatsCard
            title="Rewards Redeemed"
            value={analyticsData.kpis.rewardsRedeemed}
            icon={<Gift size={24} />}
          />
          <StatsCard
            title="Repeat Visit Rate"
            value={`${(analyticsData.kpis.repeatVisitRate * 100).toFixed(2)}%`}
            icon={<TrendingUp size={24} />}
          />
        </SimpleGrid>

        <RevenueChart data={analyticsData.revenueEstimation} />

      <Card withBorder>
        <Text size="lg" fw={600} mb="md">Revenue Estimation</Text>
        {analyticsData.revenueEstimation.missingAssumptions && (
          <Alert color="yellow" mb="md">
            Revenue estimates require Average Spend, Baseline Visits, and Reward Cost. Update these in Settings.
          </Alert>
        )}
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
            {analyticsData.revenueEstimation.roiPercentage !== undefined && (
              <Text size="xs" c="dimmed">
                ROI: {analyticsData.revenueEstimation.roiPercentage.toFixed(1)}%
              </Text>
            )}
            {analyticsData.revenueEstimation.confidenceInterval && (
              <Text size="xs" c="dimmed">
                Confidence: ±{analyticsData.revenueEstimation.confidenceInterval}
              </Text>
            )}
          </div>
        </Group>
      </Card>

      {analyticsData.warnings && analyticsData.warnings.length > 0 && (
        <Alert icon={<AlertTriangle size={16} />} title="Insights" color="orange">
          {analyticsData.warnings.map((flag) => (
            <Text key={flag} size="sm">
              {flag === 'missing_settings'
                ? 'Set Average Spend, Baseline Visits, and Reward Cost to improve estimates.'
                : flag === 'small_sample_size'
                ? 'Low sample size; estimates have higher uncertainty.'
                : flag}
            </Text>
          ))}
        </Alert>
      )}

      <Card withBorder>
        <Text size="lg" fw={600} mb="md">Top Customers by Extra Visits</Text>
        <div className="overflow-x-auto">
          <Table
            striped
            withTableBorder
            withColumnBorders
            highlightOnHover
            horizontalSpacing="md"
            verticalSpacing="sm"
            className="text-sm [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wide [&_td]:text-center [&_th:first-child]:text-left [&_td:first-child]:text-left"
          >
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
                <tr key={customer.customerId ?? customer.email ?? customer.name}>
                  <td>
                    <div className="flex flex-col">
                      <Text fw={600}>{customer.name}</Text>
                      {customer.email && (
                        <Text size="xs" c="dimmed">{customer.email}</Text>
                      )}
                    </div>
                  </td>
                  <td>
                    <Text fw={600}>{customer.visits}</Text>
                  </td>
                  <td>
                    <Text fw={600}>{customer.baselineVisitsEstimate.toFixed(1)}</Text>
                  </td>
                  <td>
                    <Badge color="teal" variant="light">
                      {customer.extraVisits.toFixed(1)}
                    </Badge>
                  </td>
                  <td>
                    <Text fw={600}>{customer.estimatedRevenueKES.toFixed(2)}</Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>

      <Card withBorder>
        <Text size="lg" fw={600} mb="md">Program Breakdown</Text>
        <div className="overflow-x-auto">
          <Table
            striped
            withTableBorder
            withColumnBorders
            highlightOnHover
            horizontalSpacing="md"
            verticalSpacing="sm"
            className="text-sm [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wide [&_td]:text-center [&_th:first-child]:text-left [&_td:first-child]:text-left"
          >
            <thead>
              <tr>
                <th>Program</th>
                <th>Expires</th>
                <th>Customers Active</th>
                <th>Visits</th>
                <th>Redemptions</th>
                <th>Baseline</th>
                <th>Extra Visits</th>
                <th>Est. Revenue (KES)</th>
                <th>Net Revenue (KES)</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.programs.map((program) => (
                <tr key={program.programId}>
                  <td>
                    <div className="flex flex-col">
                      <Text fw={600}>{program.name}</Text>
                      <Text size="xs" c="dimmed">
                        ID: {program.programId}
                      </Text>
                      {program.created_at && (
                        <Text size="xs" c="dimmed">
                          Created: {new Date(program.created_at).toLocaleDateString()}
                        </Text>
                      )}
                    </div>
                  </td>
                  <td>
                    <Text fw={600}>{formatExpiry(program.expires_at ?? program.expiresAt)}</Text>
                  </td>
                  <td>
                    <Text fw={600}>{program.customersActive}</Text>
                  </td>
                  <td>
                    <Text fw={600}>{program.visits}</Text>
                  </td>
                  <td>
                    <Badge color="teal" variant="light">
                      {program.redemptions}
                    </Badge>
                  </td>
                  <td>
                    <Text fw={600}>{program.baselineVisits.toFixed(1)}</Text>
                  </td>
                  <td>
                    <Text fw={600}>{program.estimatedExtraVisits.toFixed(1)}</Text>
                  </td>
                  <td>
                    <Text fw={600}>{program.estimatedExtraRevenueKES.toFixed(2)}</Text>
                  </td>
                  <td>
                    <Text fw={600} c={program.netIncrementalRevenueKES >= 0 ? 'green' : 'red'}>
                      {program.netIncrementalRevenueKES.toFixed(2)}
                    </Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
      </Stack>
    </Container>
  )
}

export default Analytics
