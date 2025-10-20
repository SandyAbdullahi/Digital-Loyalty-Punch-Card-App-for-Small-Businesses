import React, { useState } from 'react';
import { AppShell, Burger, Group, NavLink, Stack, Text, ActionIcon, Menu, Avatar, useMantineColorScheme, useMantineTheme, Tabs, Card } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconGauge, IconUsers, IconGift, IconAward, IconBellRinging, IconChevronRight, IconSettings, IconLogout, IconSun, IconMoonStars } from '@tabler/icons-react';
import { ColorSchemeToggle } from './ColorSchemeToggle';

interface MerchantDashboardLayoutProps {
  merchantId: string;
  children: React.ReactNode;
}

function MerchantDashboardLayout({ merchantId, children }: MerchantDashboardLayoutProps) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !mobileOpened, desktop: !desktopOpened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
          <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
          {/* Merchant Logo */}
          <Group>
            <img src="/vite.svg" alt="Merchant Logo" style={{ height: rem(30) }} />
            <Text fw={700}>My Business</Text>
          </Group>
          <Group ml="auto" gap="md">
            {/* Notifications Icon */}
            <ActionIcon variant="default" size="lg" aria-label="Notifications">
              <IconBellRinging style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
            </ActionIcon>
            {/* Profile Menu */}
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Avatar radius="xl" style={{ cursor: 'pointer' }}>
                  {merchantId.substring(0, 2).toUpperCase()}
                </Avatar>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}>
                  Settings
                </Menu.Item>
                <Menu.Item leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}>
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <ColorSchemeToggle />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack>
          <NavLink label="Overview" leftSection={<IconGauge size="1rem" stroke={1.5} />} active />
          <NavLink label="Stamps" leftSection={<IconAward size="1rem" stroke={1.5} />} />
          <NavLink label="Rewards" leftSection={<IconGift size="1rem" stroke={1.5} />} />
          <NavLink label="Customers" leftSection={<IconUsers size="1rem" stroke={1.5} />} />
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Tabs defaultValue="overview">
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="stamps">Stamps</Tabs.Tab>
            <Tabs.Tab value="rewards">Rewards</Tabs.Tab>
            <Tabs.Tab value="customers">Customers</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="xs">
            <Card shadow="md" radius="md" p="xl">
              {children}
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="stamps" pt="xs">
            <Card shadow="md" radius="md" p="xl">
              <Text size="lg" fw={600}>Stamps Content</Text>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="rewards" pt="xs">
            <Card shadow="md" radius="md" p="xl">
              <Text size="lg" fw={600}>Rewards Content</Text>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="customers" pt="xs">
            <Card shadow="md" radius="md" p="xl">
              <Text size="lg" fw={600}>Customers Content</Text>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </AppShell.Main>
    </AppShell>
  );
}

export default MerchantDashboardLayout;
