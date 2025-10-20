import React, { useState } from 'react';
import { AppShell, Burger, Group, rem, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSun, IconMoonStars } from '@tabler/icons-react';
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
          <div>Merchant Logo</div>
          <ColorSchemeToggle />
          {/* Notifications Icon and Profile Menu */}
          <Group ml="auto" gap="md">
            {/* Notifications Icon */}
            <div>Notifications</div>
            {/* Profile Menu */}
            <div>Profile</div>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        Navbar
        {/* Navigation Links */}
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}

export default MerchantDashboardLayout;
