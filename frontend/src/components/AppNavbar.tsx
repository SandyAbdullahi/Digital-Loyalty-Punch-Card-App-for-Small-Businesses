import React from 'react';
import { Group, Button, Text, Burger, ActionIcon, Menu, Avatar, rem, useMantineColorScheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBellRinging, IconSettings, IconLogout, IconSun, IconMoonStars } from '@tabler/icons-react';
import { ColorSchemeToggle } from './ColorSchemeToggle';

interface AppNavbarProps {
  isLoggedIn: boolean;
  isMerchant: boolean;
  userName?: string;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onLogoutClick: () => void;
}

function AppNavbar({ isLoggedIn, isMerchant, userName, onLoginClick, onRegisterClick, onLogoutClick }: AppNavbarProps) {
  const [opened, { toggle }] = useDisclosure();
  const { colorScheme } = useMantineColorScheme();

  return (
    <Group h="100%" px="md">
      <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
      <Text size="xl" fw={700}>LoyaltyApp</Text>

      <Group h="100%" gap={0} visibleFrom="sm">
        <Button variant="subtle">About</Button>
        <Button variant="subtle">Contact</Button>
        <Button variant="subtle">Pricing</Button>
      </Group>

      <Group ml="auto">
        {isLoggedIn ? (
          <>
            {isMerchant && (
              <ActionIcon variant="default" size="lg" aria-label="Notifications">
                <IconBellRinging style={{ width: rem(22), height: rem(22) }} stroke={1.5} />
              </ActionIcon>
            )}
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Avatar radius="xl" style={{ cursor: 'pointer' }}>
                  {userName ? userName.substring(0, 2).toUpperCase() : 'U'}
                </Avatar>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}>
                  Settings
                </Menu.Item>
                <Menu.Item leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />} onClick={onLogoutClick}>
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </>
        ) : (
          <Button variant="default" onClick={onLoginClick}>Login</Button>
        )}
        <ColorSchemeToggle />
      </Group>
    </Group>
  );
}

export default AppNavbar;
