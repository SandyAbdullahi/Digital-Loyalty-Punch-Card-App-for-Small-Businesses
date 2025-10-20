import React from 'react';
import { Card, Group, Avatar, Text, Grid, Box, Button, Badge, rem, useMantineTheme } from '@mantine/core';
import { IconCircleFilled, IconCircle } from '@tabler/icons-react';

interface Merchant {
  id: string;
  businessName: string;
  logo?: string;
}

interface Stamp {
  id: string;
  merchantId: string;
  customerId: string;
  createdAt: string;
}

interface LoyaltyProgram {
  id: string;
  rewardName: string;
  threshold: number;
  expiryDate?: string;
}

interface CustomerLoyaltyCard {
  merchant: Merchant;
  stamps: Stamp[];
  loyaltyProgram: LoyaltyProgram | null;
  currentStamps: number;
  rewardReady: boolean;
}

interface LoyaltyCardViewProps {
  loyaltyCard: CustomerLoyaltyCard;
}

const LoyaltyCardView: React.FC<LoyaltyCardViewProps> = ({ loyaltyCard }) => {
  const theme = useMantineTheme();
  const { merchant, loyaltyProgram, currentStamps, rewardReady } = loyaltyCard;

  if (!loyaltyProgram) {
    return (
      <Card withBorder radius="md" p="lg">
        <Text>No active loyalty program for {merchant.businessName}.</Text>
      </Card>
    );
  }

  const stampsToDisplay = Array.from({ length: loyaltyProgram.threshold }, (_, i) => i < currentStamps);

  return (
    <Card withBorder radius="md" p="lg" shadow="md">
      <Group justify="space-between" align="center" mb="md">
        <Group>
          {merchant.logo ? (
            <Avatar src={merchant.logo} alt="Merchant Logo" size="lg" radius="md" />
          ) : (
            <Avatar color="primaryTeal" size="lg" radius="md">{merchant.businessName.charAt(0)}</Avatar>
          )}
          <Text fw={700} size="xl">{merchant.businessName}</Text>
        </Group>
        {rewardReady && <Badge color="accentMint" variant="filled" size="lg">Reward Ready!</Badge>}
      </Group>

      <Text size="md" mb="sm">{loyaltyProgram.rewardName} ({currentStamps} / {loyaltyProgram.threshold} stamps)</Text>

      <Grid gutter="xs" mb="lg">
        {stampsToDisplay.map((filled, index) => (
          <Grid.Col span={2} key={index} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {filled ? (
              <IconCircleFilled style={{ width: rem(30), height: rem(30), color: theme.colors.accentMint[5] }} />
            ) : (
              <IconCircle style={{ width: rem(30), height: rem(30), color: theme.colors.gray[3] }} />
            )}
          </Grid.Col>
        ))}
      </Grid>

      <Button
        fullWidth
        size="lg"
        color="accentMint"
        disabled={!rewardReady}
        // onClick={() => handleRedeem() } // Placeholder for redemption logic
      >
        {rewardReady ? 'Redeem Reward' : `Earn ${loyaltyProgram.threshold - currentStamps} more stamps`}
      </Button>
    </Card>
  );
};

export default LoyaltyCardView;