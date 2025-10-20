import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AppShell, Group, Text, ActionIcon, Avatar, UnstyledButton, Menu, Tabs, Card, Box, Stack, rem, useMantineTheme, useMantineColorScheme, useComputedColorScheme, Container, Title, Badge, Progress, Button } from '@mantine/core';
import { IconHome2, IconCreditCard, IconGift, IconUser, IconArrowLeft, IconBellRinging, IconSettings, IconLogout } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { ColorSchemeToggle } from './ColorSchemeToggle';
import { Notifications, notifications } from '@mantine/notifications';

import JoinLoyaltyProgram from './JoinLoyaltyProgram';
import RewardRedemption from './RewardRedemption';
import MerchantSearch from './MerchantSearch';
import LoyaltyCardView from './LoyaltyCardView'; // Will create this component

interface CustomerAppProps {
  customerId: string;
}

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

const CustomerApp: React.FC<CustomerAppProps> = ({ customerId }) => {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const [activeTab, setActiveTab] = useState<string | null>('home');
  const [loyaltyCards, setLoyaltyCards] = useState<CustomerLoyaltyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('customerId');
    window.location.reload();
  };

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    notifications.show({
      message,
      color: type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue',
    });
  };

  const fetchLoyaltyCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const allMerchantsResponse = await axios.get('/api/merchants');
      const allMerchants: Merchant[] = allMerchantsResponse.data;

      const customerStampsResponse = await axios.get(`/api/customers/${customerId}/stamps`);
      const customerStamps: Stamp[] = customerStampsResponse.data;

      const cards: CustomerLoyaltyCard[] = [];

      for (const merchant of allMerchants) {
        const stampsForMerchant = customerStamps.filter(stamp => stamp.merchantId === merchant.id);
        const loyaltyProgramsResponse = await axios.get(`/api/loyalty-programs/merchant/${merchant.id}`);
        const merchantLoyaltyPrograms: LoyaltyProgram[] = loyaltyProgramsResponse.data;

        const loyaltyProgram = merchantLoyaltyPrograms.length > 0 ? merchantLoyaltyPrograms[0] : null;

        if (stampsForMerchant.length > 0) {
          cards.push({
            merchant,
            stamps: stampsForMerchant,
            loyaltyProgram,
            currentStamps: stampsForMerchant.length,
            rewardReady: loyaltyProgram ? stampsForMerchant.length >= loyaltyProgram.threshold : false,
          });
        }
      }
      setLoyaltyCards(cards);
    } catch (err) {
      setError('Failed to fetch loyalty cards.');
      console.error(err);
      addNotification('Failed to fetch loyalty cards.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyaltyCards();
  }, [customerId]);

  const handleProgramJoined = () => {
    fetchLoyaltyCards();
    addNotification('Successfully joined loyalty program!', 'success');
  };

  if (loading) {
    return <Container>Loading customer dashboard...</Container>;
  }

  if (error) {
    return <Container>Error: {error}</Container>;
  }

  return (
    <AppShell
      header={{ height: 60 }}
      footer={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <ActionIcon variant="transparent" size="lg" aria-label="Back">
            <IconArrowLeft style={{ width: rem(22), height: rem(22) }} stroke={1.5} />
          </ActionIcon>
          <Title order={3}>Customer App</Title>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <UnstyledButton>
                <Group gap="xs">
                  <Avatar color="primaryTeal" radius="xl">{customerId.charAt(0)}</Avatar>
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}>
                Settings
              </Menu.Item>
              <Menu.Item leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />} onClick={handleLogout}>
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Notifications />
        <Tabs value={activeTab} onChange={setActiveTab} keepMounted={false}>
          <Tabs.Panel value="home">
            <Container>
              <Title order={2} mb="md">Welcome, Customer!</Title>
              <MerchantSearch />
              <Box mt="xl">
                <Title order={3} mb="md">Your Loyalty Programs</Title>
                {loyaltyCards.length === 0 ? (
                  <Text>You haven't joined any loyalty programs yet.</Text>
                ) : (
                  <Stack>
                    {loyaltyCards.map(card => (
                      <Card key={card.merchant.id} withBorder radius="md" p="md" mb="sm">
                        <Group justify="space-between" align="center">
                          <Group>
                            {card.merchant.logo && <Avatar src={card.merchant.logo} alt="Merchant Logo" radius="sm" />}
                            <Text fw={600}>{card.merchant.businessName}</Text>
                          </Group>
                          {card.rewardReady && <Badge color="accentMint" variant="filled">Reward Ready!</Badge>}
                        </Group>
                        {card.loyaltyProgram ? (
                          <Box mt="sm">
                            <Text size="sm">{card.loyaltyProgram.rewardName} ({card.currentStamps} / {card.loyaltyProgram.threshold} stamps)</Text>
                            <Progress value={(card.currentStamps / card.loyaltyProgram.threshold) * 100} color="primaryTeal" size="lg" radius="xl" mt="xs" />
                          </Box>
                        ) : (
                          <Text size="sm" c="dimmed" mt="sm">No loyalty program configured by this merchant.</Text>
                        )}
                        {card.rewardReady && card.loyaltyProgram && (
                          <Button mt="md" fullWidth color="accentMint" onClick={() => addNotification(`Redeeming reward for ${card.merchant.businessName}`, 'info')}>
                            Redeem Reward
                          </Button>
                        )}
                      </Card>
                    ))}
                  </Stack>
                )}
              </Box>
              <Box mt="xl">
                <JoinLoyaltyProgram customerId={customerId} onProgramJoined={handleProgramJoined} />
              </Box>
            </Container>
          </Tabs.Panel>

          <Tabs.Panel value="card">
            <Container>
              <Title order={2} mb="md">Your Loyalty Card</Title>
              {loyaltyCards.length > 0 ? (
                <LoyaltyCardView loyaltyCard={loyaltyCards[0]} /> // Assuming first card for now
              ) : (
                <Text>Join a loyalty program to see your card here.</Text>
              )}
            </Container>
          </Tabs.Panel>

          <Tabs.Panel value="rewards">
            <Container>
              <Title order={2} mb="md">Your Rewards</Title>
              {loyaltyCards.filter(card => card.rewardReady).length > 0 ? (
                <Stack>
                  {loyaltyCards.filter(card => card.rewardReady).map(card => (
                    <Card key={card.merchant.id} withBorder radius="md" p="md" mb="sm">
                      <Text fw={600}>{card.merchant.businessName}</Text>
                      <Text size="sm">Reward: {card.loyaltyProgram?.rewardName}</Text>
                      <RewardRedemption customerId={customerId} loyaltyProgramId={card.loyaltyProgram!.id} />
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Text>No rewards ready yet.</Text>
              )}
            </Container>
          </Tabs.Panel>

          <Tabs.Panel value="profile">
            <Container>
              <Title order={2} mb="md">Profile</Title>
              <Text>Customer ID: {customerId}</Text>
              <ColorSchemeToggle />
              <Button mt="md" color="red" onClick={handleLogout}>Logout</Button>
            </Container>
          </Tabs.Panel>
        </Tabs>
      </AppShell.Main>

      <AppShell.Footer>
        <Tabs value={activeTab} onChange={setActiveTab} variant="unstyled">
          <Tabs.List grow>
            <Tabs.Tab value="home" leftSection={<IconHome2 style={{ width: rem(20), height: rem(20) }} stroke={1.5} />}>Home</Tabs.Tab>
            <Tabs.Tab value="card" leftSection={<IconCreditCard style={{ width: rem(20), height: rem(20) }} stroke={1.5} />}>Card</Tabs.Tab>
            <Tabs.Tab value="rewards" leftSection={<IconGift style={{ width: rem(20), height: rem(20) }} stroke={1.5} />}>Rewards</Tabs.Tab>
            <Tabs.Tab value="profile" leftSection={<IconUser style={{ width: rem(20), height: rem(20) }} stroke={1.5} />}>Profile</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </AppShell.Footer>
    </AppShell>
  );
};

export default CustomerApp;
