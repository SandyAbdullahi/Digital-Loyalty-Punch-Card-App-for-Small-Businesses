import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Stack, SimpleGrid, Card, Text, Group, Button, Loader, Alert, Title, Paper, Progress, List, ThemeIcon, Badge, DatePicker } from '@mantine/dates';
import { useAuth } from '../contexts/AuthContext';
import StatsCard from '../components/StatsCard';
import RevenueChart from '../components/RevenueChart';
import { IconUsers, IconActivity, IconMessage, IconUserPlus, IconClock, IconGlobe, IconDeviceDesktop, IconDeviceMobile, IconDeviceTablet } from '@tabler/icons-react';

type SummaryMetric = {
  label: string;
  value: string;
  accent: 'primary' | 'secondary' | 'accent';
  helper: string;
};

type ActivityItem = {
  id: string;
  type: 'stamp' | 'reward' | 'join' | 'manual_issue' | 'manual_revoke';
  message: string;
  timestamp: string;
  customer_name?: string | null;
  customer_email?: string | null;
  program_name?: string | null;
  amount?: number;
};

const accentStyles: Record<SummaryMetric['accent'], string> = {
  primary: 'bg-primary/15 text-primary',
  secondary: 'bg-secondary/15 text-secondary',
  accent: 'bg-accent/15 text-accent',
};

const activityAccent: Record<ActivityItem['type'], string> = {
  stamp: 'bg-primary',
  reward: 'bg-secondary',
  join: 'bg-accent',
  manual_issue: 'bg-primary',
  manual_revoke: 'bg-[#FF6F61]',
};

type RevenueEstimation = {
  baselineVisits: number;
  estimatedExtraVisits: number;
  estimatedExtraRevenueKES: number;
  totalRewardCostKES: number;
  netIncrementalRevenueKES: number;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { merchant } = useAuth();
  const [summary, setSummary] = useState<SummaryMetric[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [revenueData, setRevenueData] = useState<RevenueEstimation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const barPalette = ['#009688', '#FFB300', '#FF6F61', '#3B1F1E', '#7C3AED', '#0EA5E9', '#F97316'];

  // Mock data for Neura theme
  const topCountries = [
    { country: 'Bangladesh', users: 5 },
    { country: 'India', users: 6 },
    { country: 'Pakistan', users: 6 },
    { country: 'Australia', users: 10 },
  ];

  const deviceBreakdown = [
    { device: 'Desktop', percentage: 60, icon: IconDeviceDesktop },
    { device: 'Mobile', percentage: 30, icon: IconDeviceMobile },
    { device: 'Tablet', percentage: 10, icon: IconDeviceTablet },
  ];

  useEffect(() => {
    const fetchSnapshot = async () => {
      setLoadingError(null);
      try {
        const [programsResponse, activityResponse, chartResponse, analyticsResponse] =
          await Promise.allSettled([
            axios.get('/api/v1/programs/'),
            axios.get('/api/v1/analytics/recent-activity'),
            axios.get('/api/v1/analytics/scans-last-7-days'),
            merchant?.id ? axios.get(`/api/v1/merchants/${merchant.id}/analytics?period=this_month`) : Promise.reject('No merchant'),
          ]);

        const activePrograms =
          programsResponse.status === 'fulfilled'
            ? programsResponse.value.data.length
            : 0;

        const todayScans =
          activityResponse.status === 'fulfilled'
            ? Number(activityResponse.value.data.today_scans ?? 0)
            : 0;

        const rewardsRedeemed =
          activityResponse.status === 'fulfilled'
            ? Number(activityResponse.value.data.rewards_redeemed ?? 0)
            : 0;

        const totalCustomers =
          activityResponse.status === 'fulfilled'
            ? Number(activityResponse.value.data.unique_customers ?? 0)
            : 0;

        const derivedSummary: SummaryMetric[] = [
          {
            label: 'All Users',
            value: totalCustomers.toString(),
            accent: 'primary',
            helper: 'Total registered customers',
          },
          {
            label: 'Event Count',
            value: todayScans.toString(),
            accent: 'secondary',
            helper: 'Scans today',
          },
          {
            label: 'Conversations',
            value: rewardsRedeemed.toString(),
            accent: 'accent',
            helper: 'Rewards redeemed',
          },
          {
            label: 'New Users',
            value: Math.floor(totalCustomers * 0.1).toString(), // Mock new users
            accent: 'primary',
            helper: 'New customers this month',
          },
          {
            label: 'Users in Last 30 Minutes',
            value: '63', // Mock
            accent: 'secondary',
            helper: 'Active users recently',
          },
        ];

        setSummary(derivedSummary);

        if (analyticsResponse.status === 'fulfilled') {
          setRevenueData(analyticsResponse.value.data.revenueEstimation);
        } else {
          setRevenueData(null);
        }

        if (chartResponse.status === 'fulfilled') {
          const rawScans = chartResponse.value?.data?.scans;
          const scans = Array.isArray(rawScans)
            ? rawScans.map((value: unknown) => {
                const numeric = Number(value ?? 0);
                return Number.isFinite(numeric) && numeric >= 0 ? numeric : 0;
              })
            : [0, 0, 0, 0, 0, 0, 0];
          setChartData(scans);
          const labels = Array.isArray(chartResponse.value?.data?.labels)
            ? chartResponse.value.data.labels.map((label: unknown) =>
                typeof label === 'string' && label.trim().length > 0 ? label : ''
              )
            : [];
          if (labels.length === scans.length && labels.length > 0) {
            setChartLabels(labels);
          } else {
            setChartLabels(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
          }
        } else {
          setChartData([0, 0, 0, 0, 0, 0, 0]);
          setChartLabels(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
        }

        if (activityResponse.status === 'fulfilled') {
          const records = activityResponse.value.data.items ?? [];
          setActivity(
            records.map((item: any, index: number) => {
              const type = (item.type as ActivityItem['type']) ?? 'stamp';
              const customerName: string | undefined =
                typeof item.customer_name === 'string' && item.customer_name.trim().length > 0
                  ? item.customer_name.trim()
                  : undefined;
              const customerEmail: string | undefined =
                typeof item.customer_email === 'string' && item.customer_email.trim().length > 0
                  ? item.customer_email.trim()
                  : undefined;
              const programName: string | undefined =
                typeof item.program_name === 'string' && item.program_name.trim().length > 0
                  ? item.program_name.trim()
                  : undefined;
              const rawAmount = Number(item.amount ?? 0);
              const amount = type === 'manual_revoke' ? Math.abs(rawAmount) : rawAmount;
              const displayName = customerName ?? customerEmail ?? 'Customer';
              const resolvedProgram = programName ?? 'Programme';
              let computedMessage = 'Activity recorded';

              if (type === 'manual_issue') {
                if (typeof item.message === 'string' && item.message.trim().length > 0) {
                  computedMessage = item.message;
                } else {
                  const stampWord = amount === 1 ? 'stamp' : 'stamps';
                  computedMessage = `${resolvedProgram} manually added ${amount} ${stampWord} for ${displayName}.`;
                }
              } else if (type === 'manual_revoke') {
                if (typeof item.message === 'string' && item.message.trim().length > 0) {
                  computedMessage = item.message;
                } else {
                  const stampWord = amount === 1 ? 'stamp' : 'stamps';
                  computedMessage = `${amount} ${stampWord} were manually revoked for ${displayName} in ${resolvedProgram}.`;
                }
              } else if (type === 'reward') {
                const stampWord = amount === 1 ? 'stamp' : 'stamps';
                computedMessage = `${amount} ${stampWord} redeemed by ${displayName}.`;
              } else if (type === 'stamp') {
                const stampWord = amount === 1 ? 'stamp' : 'stamps';
                computedMessage = `${resolvedProgram} added ${amount} ${stampWord} for ${displayName}.`;
              } else if (typeof item.message === 'string') {
                computedMessage = item.message;
              }

              return {
                id: item.id ?? `activity-${index}`,
                type,
                message: computedMessage,
                timestamp: item.timestamp
                  ? new Date(item.timestamp).toLocaleString()
                  : new Date().toLocaleString(),
                customer_name: customerName,
                customer_email: customerEmail,
                program_name: programName,
                amount: amount,
              };
            })
          );
        } else {
          setActivity([]);
        }
      } catch (error) {
        setLoadingError('Unable to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshot();
  }, []);

  return (
    <Container fluid>
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Analytics Dashboard</Title>
            <Text size="sm" c="dimmed">Monitor your loyalty programs and customer engagement</Text>
          </div>
          <Group>
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder="Pick a date"
              size="sm"
            />
            <Button onClick={() => navigate('/programs')} size="md">
              Create Program
            </Button>
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
        {summary.map((metric, index) => (
          <StatsCard
            key={metric.label}
            title={metric.label}
            value={metric.value}
            icon={<div className="w-6 h-6 bg-blue-500 rounded"></div>} // Placeholder icon
          />
        ))}

        {loading && (
          <>
            {[...Array(4)].map((_, index) => (
              <Card key={index} withBorder padding="lg" radius="md">
                <Loader size="sm" />
              </Card>
            ))}
          </>
        )}

        {!loading && summary.length === 0 && (
          <Card withBorder padding="lg" radius="md" style={{ gridColumn: '1 / -1' }}>
            <Text size="lg" fw={600} ta="center">
              Welcome to Your Dashboard
            </Text>
            <Text size="sm" c="dimmed" ta="center" mt="xs">
              No metrics yet - your first happy customer is just a scan away!
            </Text>
            <Button onClick={() => navigate('/programs')} mt="md" fullWidth>
              Create Your First Program
            </Button>
          </Card>
        )}

        {loadingError && (
          <Alert color="red" style={{ gridColumn: '1 / -1' }}>
            {loadingError}
            <Button variant="light" size="xs" ml="md" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </Alert>
        )}
      </SimpleGrid>

      <Title order={3} mt="xl">Reports Snapshot</Title>
      <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="lg">
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed">Sessions</Text>
              <Text size="xl" fw={700}>6,132</Text>
              <Text size="sm" c="green">150% vs Previous 30 Days</Text>
            </div>
            <IconActivity size={40} color="blue" />
          </Group>
        </Card>
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed">Page Views</Text>
              <Text size="xl" fw={700}>11,236</Text>
              <Text size="sm" c="green">202% vs Previous 30 Days</Text>
            </div>
            <IconGlobe size={40} color="green" />
          </Group>
        </Card>
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed">Average</Text>
              <Text size="xl" fw={700}>46</Text>
              <Text size="sm" c="green">22% vs Previous 30 Days</Text>
            </div>
            <IconClock size={40} color="orange" />
          </Group>
        </Card>
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed">Bounce Rate</Text>
              <Text size="xl" fw={700}>6,132</Text>
              <Text size="sm" c="red">30% vs Previous 30 Days</Text>
            </div>
            <IconUsers size={40} color="red" />
          </Group>
        </Card>
      </SimpleGrid>

      <Title order={3} mt="xl">Demographic properties of your customer</Title>
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <Card withBorder padding="lg" radius="md">
          <Text size="lg" fw={600} mb="md">Top Countries</Text>
          <List spacing="sm">
            {topCountries.map((item) => (
              <List.Item
                key={item.country}
                icon={<ThemeIcon color="blue" size={24} radius="xl"><IconGlobe size={16} /></ThemeIcon>}
              >
                <Group justify="space-between">
                  <Text>{item.country}</Text>
                  <Badge color="blue">{item.users}</Badge>
                </Group>
              </List.Item>
            ))}
          </List>
        </Card>
        <Card withBorder padding="lg" radius="md">
          <Text size="lg" fw={600} mb="md">Device Breakdown</Text>
          <Stack spacing="md">
            {deviceBreakdown.map((item) => (
              <div key={item.device}>
                <Group justify="space-between" mb="xs">
                  <Group>
                    <item.icon size={20} />
                    <Text size="sm">{item.device}</Text>
                  </Group>
                  <Text size="sm">{item.percentage}%</Text>
                </Group>
                <Progress value={item.percentage} color="blue" size="sm" />
              </div>
            ))}
          </Stack>
        </Card>
      </SimpleGrid>

      <Title order={3} mt="xl">New vs Returning Visitors</Title>
      <Card withBorder padding="lg" radius="md">
        <Text size="sm" c="dimmed">Placeholder for visitor chart</Text>
        {/* Add chart here if available */}
      </Card>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        {revenueData ? (
          <RevenueChart data={revenueData} />
        ) : (
          <Card withBorder padding="lg" radius="md">
            <Text size="lg" fw={600} ta="center">Revenue Estimation</Text>
            <Text size="sm" c="dimmed" ta="center" mt="md">
              Configure settings to see revenue estimates
            </Text>
            <Button onClick={() => navigate('/settings')} mt="md" fullWidth>
              Go to Settings
            </Button>
          </Card>
        )}
        <Card withBorder padding="lg" radius="md">
          <Text size="lg" fw={600} mb="md">Recent Activity</Text>
          {activity.slice(0, 5).map((entry) => (
            <Group key={entry.id} mb="sm">
              <div className={`w-3 h-3 rounded-full ${activityAccent[entry.type]}`}></div>
              <div>
                <Text size="sm">{entry.message}</Text>
                <Text size="xs" c="dimmed">{entry.timestamp}</Text>
              </div>
            </Group>
          ))}
        </Card>
      </SimpleGrid>
    </Stack>
  </Container>
  );
};

export default Dashboard;
