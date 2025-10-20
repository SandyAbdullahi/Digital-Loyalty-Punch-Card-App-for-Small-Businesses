import React, { useState } from 'react';
import { AppShell, Group, Text, ActionIcon, useMantineColorScheme, useMantineTheme, Tabs } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconHome, IconCreditCard, IconGift, IconUser, IconArrowLeft, IconSun, IconMoonStars } from '@tabler/icons-react';
import { ColorSchemeToggle } from './ColorSchemeToggle';

interface CustomerAppLayoutProps {
  customerId: string;
  children: React.ReactNode;
}

function CustomerAppLayout({ customerId, children }: CustomerAppLayoutProps) {
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
        <Group h="100%" px="md">
          <ActionIcon variant="transparent" aria-label="Go back">
            <IconArrowLeft style={{ width: '70%', height: '70%' }} stroke={1.5} />
          </ActionIcon>
          <Text fw={600}>Page Title</Text>
          <Group ml="auto">
            <ColorSchemeToggle />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        {children}
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
