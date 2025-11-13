import { Card, Text, Group } from '@mantine/core';
import { TrendingUp, TrendingDown } from 'lucide-react';

type StatsCardProps = {
  title: string;
  value: string | number;
  diff?: number;
  icon?: React.ReactNode;
};

const StatsCard = ({ title, value, diff, icon }: StatsCardProps) => {
  return (
    <Card withBorder padding="lg" radius="md">
      <Group justify="space-between">
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            {title}
          </Text>
          <Text size="xl" fw={700} mt="xs">
            {value}
          </Text>
          {diff !== undefined && (
            <Group gap="xs" mt="xs">
              <Text size="sm" c={diff >= 0 ? 'green' : 'red'} fw={500}>
                {diff > 0 ? '+' : ''}{diff}%
              </Text>
              {diff >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            </Group>
          )}
        </div>
        {icon && (
          <div style={{ color: 'var(--mantine-color-blue-6)' }}>
            {icon}
          </div>
        )}
      </Group>
    </Card>
  );
};

export default StatsCard;