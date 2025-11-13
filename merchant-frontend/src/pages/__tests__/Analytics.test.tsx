import { render, screen, waitFor } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import axios from 'axios'
import Analytics from '../Analytics'
import { describe, it, beforeEach, vi, expect } from 'vitest'

vi.mock('axios')

vi.mock('react-apexcharts', () => ({
  default: () => <div data-testid="apex-chart" />
}))

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
    merchant: { id: 'merchant-123' }
  })
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn()
  }
})

const mockedAxios = axios as vi.Mocked<typeof axios>

const renderWithProviders = () =>
  render(
    <MantineProvider>
      <Analytics />
    </MantineProvider>
  )

const baseAnalyticsResponse = {
  merchantId: 'merchant-123',
  period: {
    label: 'This Month',
    start: '2024-01-01T00:00:00.000Z',
    end: '2024-01-31T23:59:59.999Z'
  },
  kpis: {
    totalCustomersEnrolled: 42,
    stampsIssued: 47,
    rewardsRedeemed: 13,
    repeatVisitRate: 0.75,
    avgVisitsPerActiveCustomer: 3.25
  },
  revenueEstimation: {
    baselineVisits: 20,
    estimatedExtraVisits: 27,
    estimatedExtraRevenueKES: 13500,
    totalRewardCostKES: 2600,
    netIncrementalRevenueKES: 10900,
    missingAssumptions: false
  },
  engagement: {
    activeCustomers: 16,
    avgVisitsPerActive: 2.9
  },
  warnings: [],
  programs: [
    {
      programId: 'program-1',
      name: 'Coffee Club',
      customersActive: 10,
      visits: 30,
      redemptions: 5,
      baselineVisits: 12,
      estimatedExtraVisits: 18,
      estimatedExtraRevenueKES: 9000,
      netIncrementalRevenueKES: 6500
    }
  ]
}

const baseTopCustomers = [
  {
    customerId: 'cust-1',
    name: 'Ada',
    visits: 4,
    baselineVisitsEstimate: 2,
    extraVisits: 2,
    estimatedRevenueKES: 1000
  }
]

const mockApiResponses = (
  analyticsOverrides: Partial<typeof baseAnalyticsResponse> = {},
  customerOverrides = baseTopCustomers
) => {
  const analyticsPayload = {
    ...baseAnalyticsResponse,
    ...analyticsOverrides,
    period: { ...baseAnalyticsResponse.period, ...analyticsOverrides.period },
    kpis: { ...baseAnalyticsResponse.kpis, ...analyticsOverrides.kpis },
    revenueEstimation: {
      ...baseAnalyticsResponse.revenueEstimation,
      ...analyticsOverrides.revenueEstimation
    },
    engagement: { ...baseAnalyticsResponse.engagement, ...analyticsOverrides.engagement },
    programs: analyticsOverrides.programs ?? baseAnalyticsResponse.programs
  }

  mockedAxios.get.mockImplementation((url: string) => {
    if (url.includes('/analytics/customers')) {
      return Promise.resolve({ data: { customers: customerOverrides } })
    }

    return Promise.resolve({ data: analyticsPayload })
  })

  return analyticsPayload
}

describe('Analytics page', () => {
  beforeEach(() => {
    mockedAxios.get.mockReset()
  })

  it('renders KPI and revenue metrics from API response', async () => {
    mockApiResponses()

    renderWithProviders()

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(2)
    })

    expect(screen.getByText('Analytics Dashboard - This Month')).toBeInTheDocument()
    expect(screen.getByText('Total Customers Enrolled')).toBeInTheDocument()
    expect(screen.getByText('47')).toBeInTheDocument()
    expect(screen.getByText('13')).toBeInTheDocument()
    expect(screen.getByText('75.00%')).toBeInTheDocument()

    expect(screen.getByText('Baseline Visits')).toBeInTheDocument()
    expect(screen.getByText('20.0')).toBeInTheDocument()
    expect(screen.getByText('13500.00')).toBeInTheDocument()
    expect(screen.getByText('10900.00')).toBeInTheDocument()
  })

  it('shows warning banners when estimates are uncertain', async () => {
    mockApiResponses({
      revenueEstimation: {
        ...baseAnalyticsResponse.revenueEstimation,
        baselineVisits: 0,
        missingAssumptions: true
      },
      warnings: ['missing_settings', 'small_sample_size']
    })

    renderWithProviders()

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(2)
    })

    expect(
      screen.getByText('Revenue estimates require Average Spend, Baseline Visits, and Reward Cost. Update these in Settings.')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Set Average Spend, Baseline Visits, and Reward Cost to improve estimates.')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Low sample size; estimates have higher uncertainty.')
    ).toBeInTheDocument()
  })
})
