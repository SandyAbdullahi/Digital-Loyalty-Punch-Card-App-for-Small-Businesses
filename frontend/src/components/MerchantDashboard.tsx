import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Group, ActionIcon, Text, Avatar, UnstyledButton, Menu, Tabs, Card, Box, Stack, rem, useMantineTheme, useMantineColorScheme, useComputedColorScheme, Button, Alert } from '@mantine/core';
import { IconBellRinging, IconSettings, IconLogout, IconGauge, IconPuzzle, IconGift, IconUsers, IconQrcode, IconBuildingStore, IconCreditCard, IconPalette } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';

import LoyaltyProgramForm from './LoyaltyProgramForm';
import IssueStampForm from './IssueStampForm';
import QrCodeGenerator from './QrCodeGenerator';
import SubscriptionManager from './SubscriptionManager';
import CustomerListView from './CustomerListView';
import AnalyticsDashboard from './AnalyticsDashboard';
import MerchantBrandingSettings from './MerchantBrandingSettings';
import MerchantCustomerList from './MerchantCustomerList';

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
  const [deleteProgramLoading, setDeleteProgramLoading] = useState<string | null>(null);
  const [deleteProgramError, setDeleteProgramError] = useState<string | null>(null);

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

  const handleDeleteLoyaltyProgram = async (programId: string) => {
    if (!window.confirm('Are you sure you want to delete this loyalty program? All associated stamps will also be deleted.')) {
      return;
    }

    setDeleteProgramLoading(programId);
    setDeleteProgramError(null);
    try {
      await axios.delete(`/api/loyalty-programs/${programId}`);
      setDeleteProgramLoading(null);
      fetchMerchantData(); // Refresh the list
    } catch (err) {
      setDeleteProgramError('Failed to delete loyalty program.');
      console.error(err);
      setDeleteProgramLoading(null);
    }
  };

  useEffect(() => {
    fetchMerchantData();
  }, [merchantId]);

  const handleProgramChange = (newProgramId?: string) => {
    setEditingProgram(null);
    fetchMerchantData();
    if (newProgramId) {
      setActiveTab('qrCode'); // Optionally switch to QR code tab after creating a new program
    }
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
            {deleteProgramError && <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red" mb="md">{deleteProgramError}</Alert>}
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
                        <Button
                          variant="outline"
                          color="red"
                          size="xs"
                          onClick={() => handleDeleteLoyaltyProgram(program.id)}
                          loading={deleteProgramLoading === program.id}
                        >
                          Delete
                        </Button>
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
            <MerchantCustomerList merchantId={merchant.id} />
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
  );
};

export default MerchantDashboard;
