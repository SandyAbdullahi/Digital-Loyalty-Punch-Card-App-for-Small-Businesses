import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AppShell, Navbar, Header, Group, ActionIcon, Text, Avatar, UnstyledButton, Menu, Tabs, Card, Box, Stack, rem, useMantineTheme, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { IconBellRinging, IconSettings, IconLogout, IconGauge, IconPuzzle, IconGift, IconUsers, IconQrcode, IconBuildingStore, IconCreditCard, IconPalette } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { ColorSchemeToggle } from './ColorSchemeToggle';

import LoyaltyProgramForm from './LoyaltyProgramForm';
import IssueStampForm from './IssueStampForm';
import QrCodeGenerator from './QrCodeGenerator';
import SubscriptionManager from './SubscriptionManager';
import CustomerListView from './CustomerListView';
import AnalyticsDashboard from './AnalyticsDashboard';
import MerchantBrandingSettings from './MerchantBrandingSettings';

interface MerchantDashboardProps {
  merchantId: string;
}

interface Merchant {
  id: string;
  name: string;
  email: string;
  businessName: string;
  businessType: string;
  location?: string;
  contact?: string;
  qrCodeLink?: string;
  subscriptionPlan: string;
  logo?: string;
  theme?: string;
}

interface LoyaltyProgram {
  id: string;
  merchantId: string;
  rewardName: string;
  threshold: number;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface AnalyticsData {
  customersJoined: number;
  stampsIssued: number;
  rewardsRedeemed: number;
}

const MerchantDashboard: React.FC<MerchantDashboardProps> = ({ merchantId }) => {
  const theme = useMantineTheme();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<LoyaltyProgram[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProgram, setEditingProgram] = useState<LoyaltyProgram | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('overview');

  const handleLogout = () => {
    localStorage.removeItem('merchantId');
    window.location.reload();
  };

  const fetchMerchantData = async () => {
    if (!merchantId) {
      setLoading(false);
      setError('Merchant ID not available. Please sign up or log in.');
      return;
    }

    try {
      const merchantResponse = await axios.get(`/api/merchants/${merchantId}`);
      setMerchant(merchantResponse.data);

      const programsResponse = await axios.get(`/api/loyalty-programs/merchant/${merchantId}`);
      setLoyaltyPrograms(programsResponse.data);

      const analyticsResponse = await axios.get(`/api/analytics/merchant/${merchantId}`);
      setAnalytics(analyticsResponse.data);

    } catch (err) {
      setError('Failed to fetch merchant data or loyalty programs.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchantData();
  }, [merchantId]);

  const handleProgramChange = () => {
    setEditingProgram(null);
    fetchMerchantData();
  };

  const handleStampIssued = () => {
    fetchMerchantData();
  };

  if (loading) {
    return <div>Loading merchant data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!merchant) {
    return <div>No merchant data found.</div>;
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: isMobile ? 0 : 200, breakpoint: 'sm', collapsed: { mobile: true } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            {/* Merchant Logo */}
            {merchant.logo ? (
              <img src={merchant.logo} alt="Merchant Logo" style={{ height: rem(40) }} />
            ) : (
              <Text fw={700} size="lg">{merchant.businessName || 'Merchant Dashboard'}</Text>
            )}
          </Group>
          <Group>
            <ActionIcon variant="default" size="lg" aria-label="Notifications">
              <IconBellRinging style={{ width: rem(22), height: rem(22) }} stroke={1.5} />
            </ActionIcon>
            <ColorSchemeToggle />
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="xs">
                    <Avatar color="primaryTeal" radius="xl">{merchant.name.charAt(0)}</Avatar>
                    <Text size="sm" fw={500}>{merchant.name}</Text>
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
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack>
          <UnstyledButton onClick={() => setActiveTab('overview')}>
            <Group>
              <IconGauge style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
              <Text size="sm">Overview</Text>
            </Group>
          </UnstyledButton>
          <UnstyledButton onClick={() => setActiveTab('loyaltyPrograms')}>
            <Group>
              <IconPuzzle style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
              <Text size="sm">Loyalty Programs</Text>
            </Group>
          </UnstyledButton>
          <UnstyledButton onClick={() => setActiveTab('issueStamps')}>
            <Group>
              <IconGift style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
              <Text size="sm">Issue Stamps</Text>
            </Group>
          </UnstyledButton>
          <UnstyledButton onClick={() => setActiveTab('customers')}>
            <Group>
              <IconUsers style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
              <Text size="sm">Customers</Text>
            </Group>
          </UnstyledButton>
          <UnstyledButton onClick={() => setActiveTab('qrCode')}>
            <Group>
              <IconQrcode style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
              <Text size="sm">QR Code</Text>
            </Group>
          </UnstyledButton>
          <UnstyledButton onClick={() => setActiveTab('branding')}>
            <Group>
              <IconPalette style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
              <Text size="sm">Branding</Text>
            </Group>
          </UnstyledButton>
          <UnstyledButton onClick={() => setActiveTab('subscription')}>
            <Group>
              <IconCreditCard style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
              <Text size="sm">Subscription</Text>
            </Group>
          </UnstyledButton>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Tabs value={activeTab} onChange={setActiveTab} keepMounted={false}>
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="loyaltyPrograms">Loyalty Programs</Tabs.Tab>
            <Tabs.Tab value="issueStamps">Issue Stamps</Tabs.Tab>
            <Tabs.Tab value="customers">Customers</Tabs.Tab>
            <Tabs.Tab value="qrCode">QR Code</Tabs.Tab>
            <Tabs.Tab value="branding">Branding</Tabs.Tab>
            <Tabs.Tab value="subscription">Subscription</Tabs.Tab>
          </Tabs.List>

          <Box mt="md">
            <Tabs.Panel value="overview">
              <Card withBorder radius="md" p="lg">
                <AnalyticsDashboard merchantId={merchant.id} />
              </Card>
            </Tabs.Panel>

            <Tabs.Panel value="loyaltyPrograms">
              <Card withBorder radius="md" p="lg">
                <Text size="lg" fw={600} mb="md">Loyalty Programs</Text>
                {loyaltyPrograms.length === 0 ? (
                  <Text>No loyalty programs configured yet.</Text>
                ) : (
                  <Stack>
                    {loyaltyPrograms.map((program) => (
                      <Card key={program.id} withBorder radius="md" p="md">
                        <Group justify="space-between">
                          <Text>{program.rewardName} ({program.threshold} stamps)</Text>
                          <Group>
                            {program.expiryDate && <Text size="sm" c="dimmed">Expires: {new Date(program.expiryDate).toLocaleDateString()}</Text>}
                            <ActionIcon variant="default" onClick={() => setEditingProgram(program)}>
                              <IconSettings style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                            </ActionIcon>
                          </Group>
                        </Group>
                        <QrCodeGenerator loyaltyProgramId={program.id} />
                      </Card>
                    ))}
                  </Stack>
                )}
                <Box mt="md">
                  {editingProgram ? (
                    <LoyaltyProgramForm
                      merchantId={merchant.id}
                      existingProgram={editingProgram}
                      onProgramUpdated={handleProgramChange}
                    />
                  ) : (
                    <LoyaltyProgramForm
                      merchantId={merchant.id}
                      onProgramCreated={handleProgramChange}
                    />
                  )}
                </Box>
              </Card>
            </Tabs.Panel>

            <Tabs.Panel value="issueStamps">
              <Card withBorder radius="md" p="lg">
                <IssueStampForm merchantId={merchant.id} onStampIssued={handleStampIssued} />
              </Card>
            </Tabs.Panel>

            <Tabs.Panel value="customers">
              <Card withBorder radius="md" p="lg">
                <CustomerListView merchantId={merchant.id} />
              </Card>
            </Tabs.Panel>

            <Tabs.Panel value="qrCode">
              <Card withBorder radius="md" p="lg">
                <Text size="lg" fw={600} mb="md">Generate QR Code</Text>
                {loyaltyPrograms.length > 0 ? (
                  <QrCodeGenerator loyaltyProgramId={loyaltyPrograms[0].id} /> // Assuming the first program for now
                ) : (
                  <Text>Please create a loyalty program first to generate a QR code.</Text>
                )}
              </Card>
            </Tabs.Panel>

            <Tabs.Panel value="branding">
              <Card withBorder radius="md" p="lg">
                <MerchantBrandingSettings
                  merchantId={merchant.id}
                  currentLogo={merchant.logo}
                  currentTheme={merchant.theme}
                  onSettingsSaved={fetchMerchantData}
                />
              </Card>
            </Tabs.Panel>

            <Tabs.Panel value="subscription">
              <Card withBorder radius="md" p="lg">
                <SubscriptionManager merchantId={merchant.id} currentPlan={merchant.subscriptionPlan} />
              </Card>
            </Tabs.Panel>
          </Box>
        </Tabs>
      </AppShell.Main>
    </AppShell>
  );
};

export default MerchantDashboard;