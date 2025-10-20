import React, { useState } from 'react';
import { AppShell, Group, Text, ActionIcon, useMantineColorScheme, useMantineTheme, Tabs } from '@mantine/core';
import { IconHome, IconCreditCard, IconGift, IconUser, IconArrowLeft } from '@tabler/icons-react';
import AppNavbar from './AppNavbar';
import CustomerHomeContent from './CustomerHomeContent';

interface CustomerAppLayoutProps {
  customerId: string;
  children: React.ReactNode;
  onLogoutClick: () => void;
}

function CustomerAppLayout({ customerId, children, onLogoutClick }: CustomerAppLayoutProps) {
  const [activeTab, setActiveTab] = useState<string | null>('home');
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  return (
    <AppShell
      header={{ height: 60 }}
      footer={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <AppNavbar
          isLoggedIn={true}
          isMerchant={false}
          userName={customerId} // Use customerId as a placeholder for userName
          onLoginClick={() => { /* Not applicable here */ }}
          onRegisterClick={() => { /* Not applicable here */ }}
          onLogoutClick={onLogoutClick}
        />
      </AppShell.Header>

      <AppShell.Main>
        <Tabs value={activeTab}>
          <Tabs.Panel value="home">
            <CustomerHomeContent />
          </Tabs.Panel>
          <Tabs.Panel value="card">
            {children}
          </Tabs.Panel>
          <Tabs.Panel value="rewards">
            <Text size="lg" fw={600}>Rewards Content</Text>
          </Tabs.Panel>
          <Tabs.Panel value="profile">
            <Text size="lg" fw={600}>Profile Content</Text>
          </Tabs.Panel>
        </Tabs>
      </AppShell.Main>

      <AppShell.Footer>
        <Tabs value={activeTab} onChange={setActiveTab} grow variant="unstyled">
          <Tabs.List>
            <Tabs.Tab value="home" leftSection={<IconHome style={{ width: '70%', height: '70%' }} stroke={1.5} />}>
              Home
            </Tabs.Tab>
            <Tabs.Tab value="card" leftSection={<IconCreditCard style={{ width: '70%', height: '70%' }} stroke={1.5} />}>
              Card
            </Tabs.Tab>
            <Tabs.Tab value="rewards" leftSection={<IconGift style={{ width: '70%', height: '70%' }} stroke={1.5} />}>
              Rewards
            </Tabs.Tab>
            <Tabs.Tab value="profile" leftSection={<IconUser style={{ width: '70%', height: '70%' }} stroke={1.5} />}>
              Profile
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </AppShell.Footer>
    </AppShell>
  );
}

export default CustomerAppLayout;
