import React from 'react';
import { AppShell, Group, Burger, Button, Text, Container, Title, Space } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ColorSchemeToggle } from './ColorSchemeToggle';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

function LandingPage({ onLoginClick, onRegisterClick }: LandingPageProps) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Text size="xl" fw={700}>LoyaltyApp</Text>
          <Group h="100%" gap={0} visibleFrom="sm">
            <Button variant="subtle">About</Button>
            <Button variant="subtle">Contact</Button>
            <Button variant="subtle">Pricing</Button>
          </Group>
          <Group ml="auto">
            <Button variant="default" onClick={onLoginClick}>Login</Button>
            <ColorSchemeToggle />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg" style={{ textAlign: 'center', paddingTop: '100px', paddingBottom: '100px' }}>
          <Title order={1} size={50} fw={700}>
            Digital Loyalty for Small Businesses
          </Title>
          <Space h="md" />
          <Text size="lg" c="dimmed">
            Boost customer retention and engagement with our easy-to-use digital punch-card app.
          </Text>
          <Space h="xl" />
          <Button size="lg" onClick={onRegisterClick}>Get Started - It's Free!</Button>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default LandingPage;
