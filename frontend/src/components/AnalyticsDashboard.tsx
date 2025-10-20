import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SimpleGrid, Paper, Group, ThemeIcon, Text, rem } from '@mantine/core';
import { IconUsers, IconAward, IconGift } from '@tabler/icons-react';

interface AnalyticsDashboardProps {
  merchantId: string;
}

interface AnalyticsData {
  customersJoined: number;
  stampsIssued: number;
  rewardsRedeemed: number;
  // Add more detailed analytics data as needed
  loyaltyProgramStats?: {
    programId: string;
    programName: string;
    stampsIssued: number;
    rewardsRedeemed: number;
  }[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ merchantId }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/analytics/merchant/${merchantId}`);
        setAnalytics(response.data);
      } catch (err) {
        setError('Failed to fetch analytics data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (merchantId) {
      fetchAnalytics();
    }
  }, [merchantId]);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (!analytics) {
    return <div>No analytics data available.</div>;
  }

  return (
    <>
      <Text size="lg" fw={600} mb="md">Key Metrics</Text>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        <Paper withBorder radius="md" p="md">
          <Group justify="space-between">
            <Text size="xs" c="dimmed" fw={700}>
              CUSTOMERS JOINED
            </Text>
            <ThemeIcon color="blue" variant="light" size="lg" radius="md">
              <IconUsers style={{ width: rem(22), height: rem(22) }} />
            </ThemeIcon>
          </Group>
          <Group align="flex-end" gap="xs" mt="sm">
            <Text size="xl" fw={700}>
              {analytics.customersJoined}
            </Text>
          </Group>
        </Paper>

        <Paper withBorder radius="md" p="md">
          <Group justify="space-between">
            <Text size="xs" c="dimmed" fw={700}>
              STAMPS ISSUED
            </Text>
            <ThemeIcon color="teal" variant="light" size="lg" radius="md">
              <IconAward style={{ width: rem(22), height: rem(22) }} />
            </ThemeIcon>
          </Group>
          <Group align="flex-end" gap="xs" mt="sm">
            <Text size="xl" fw={700}>
              {analytics.stampsIssued}
            </Text>
          </Group>
        </Paper>

        <Paper withBorder radius="md" p="md">
          <Group justify="space-between">
            <Text size="xs" c="dimmed" fw={700}>
              REWARDS REDEEMED
            </Text>
            <ThemeIcon color="grape" variant="light" size="lg" radius="md">
              <IconGift style={{ width: rem(22), height: rem(22) }} />
            </ThemeIcon>
          </Group>
          <Group align="flex-end" gap="xs" mt="sm">
            <Text size="xl" fw={700}>
              {analytics.rewardsRedeemed}
            </Text>
          </Group>
        </Paper>
      </SimpleGrid>

      {analytics.loyaltyProgramStats && analytics.loyaltyProgramStats.length > 0 && (
        <>
          <Text size="lg" fw={600} mb="md" mt="xl">Loyalty Program Breakdown</Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {analytics.loyaltyProgramStats.map((program) => (
              <Paper key={program.programId} withBorder radius="md" p="md">
                <Text fw={700}>{program.programName}</Text>
                <Text size="sm" c="dimmed">Stamps Issued: {program.stampsIssued}</Text>
                <Text size="sm" c="dimmed">Rewards Redeemed: {program.rewardsRedeemed}</Text>
              </Paper>
            ))}
          </SimpleGrid>
        </>
      )}
    </>
  );
};

export default AnalyticsDashboard;
