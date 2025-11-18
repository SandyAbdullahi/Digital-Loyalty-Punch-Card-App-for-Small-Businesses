import { Card, Text, Group } from '@mantine/core';
import { TrendingUp, TrendingDown } from 'lucide-react';

type StatsCardProps = {
  title: string;
  value: string | number;
  diff?: number;
  icon?: React.ReactNode;
  accent?: 'primary' | 'secondary' | 'accent';
};

const accentStyles: Record<NonNullable<StatsCardProps['accent']>, { bg: string; text: string }> = {
  primary: { bg: 'bg-primary/10', text: 'text-primary' },
  secondary: { bg: 'bg-secondary/10', text: 'text-secondary' },
  accent: { bg: 'bg-accent/10', text: 'text-accent' },
};

const StatsCard = ({ title, value, diff, icon, accent }: StatsCardProps) => {
  const accentStyle = accent ? accentStyles[accent] : null;

  return (
    <Card
      withBorder
      padding="lg"
      radius="md"
      className={accentStyle ? `${accentStyle.bg} border-l-4 border-l-current` : ''}
      style={accentStyle ? { borderLeftColor: `var(--${accent})` } : undefined}
    >
      <Group justify="space-between">
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            {title}
          </Text>
          <Text size="xl" fw={700} mt="xs" className={accentStyle ? accentStyle.text : ''}>
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