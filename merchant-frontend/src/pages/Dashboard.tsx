import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Stack, SimpleGrid, Card, Text, Group, Button, Loader, Alert } from '@mantine/core';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import StatsCard from '../components/StatsCard';
import RevenueChart from '../components/RevenueChart';

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
  const { lastMessage } = useWebSocket();
  const [summary, setSummary] = useState<SummaryMetric[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [revenueData, setRevenueData] = useState<RevenueEstimation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const barPalette = ['#009688', '#FFB300', '#FF6F61', '#3B1F1E', '#7C3AED', '#0EA5E9', '#F97316'];

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
            label: 'Total Customers',
            value: totalCustomers.toString(),
            accent: 'primary',
            helper: 'Registered customers',
          },
          {
            label: 'Active Programs',
            value: activePrograms.toString(),
            accent: 'secondary',
            helper: activePrograms > 0 ? 'Programs running' : 'Create your first program',
          },
          {
            label: 'Today\'s Scans',
            value: todayScans.toString(),
            accent: 'accent',
            helper: 'Scans recorded today',
          },
          {
            label: 'Rewards Redeemed',
            value: rewardsRedeemed.toString(),
            accent: 'primary',
            helper: 'Rewards claimed',
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
                const rewardWord = amount === 1 ? 'reward' : 'rewards';
                computedMessage = `${amount} ${rewardWord} redeemed by ${displayName}.`;
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

  // Handle WebSocket messages for real-time activity updates
  useEffect(() => {
    if (lastMessage && (lastMessage.type === 'customer_stamp_update' || lastMessage.type === 'reward_redeemed')) {
      // Refetch recent activity when stamp or reward updates occur
      const fetchActivity = async () => {
        try {
          const activityResponse = await axios.get('/api/v1/analytics/recent-activity');
          const records = activityResponse.data.items ?? [];
          setActivity(
            records.slice(0, 5).map((item: any, index: number) => {
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
                const rewardWord = amount === 1 ? 'reward' : 'rewards';
                computedMessage = `${amount} ${rewardWord} redeemed by ${displayName}.`;
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
        } catch (error) {
          console.error('Failed to refetch activity:', error);
        }
      };

      fetchActivity();
    }
  }, [lastMessage]);

  return (
    <Container fluid>
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <div>
            <Text size="xl" fw={700}>Dashboard</Text>
            <Text size="sm" c="dimmed">Monitor your loyalty programs and customer engagement</Text>
          </div>
          <Group>
          <Button variant="filled" color="blue" size="md" onClick={() => navigate('/programs')}>
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
            <Button variant="filled" color="blue" mt="md" fullWidth onClick={() => navigate('/programs')}>
              Create Your First Program
            </Button>
          </Card>
        )}

        {loadingError && (
          <Alert color="red" style={{ gridColumn: '1 / -1' }}>
            {loadingError}
            <Button variant="light" color="blue" size="xs" ml="md" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </Alert>
        )}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        {revenueData ? (
          <RevenueChart data={revenueData} />
        ) : (
          <Card withBorder padding="lg" radius="md">
            <Text size="lg" fw={600} ta="center">Revenue Estimation</Text>
            <Text size="sm" c="dimmed" ta="center" mt="md">
              Configure settings to see revenue estimates
            </Text>
            <Button variant="outline" color="blue" mt="md" fullWidth onClick={() => navigate('/settings')}>
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
