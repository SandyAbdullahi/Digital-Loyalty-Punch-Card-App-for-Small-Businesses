import React from 'react';
import { AppShell, Container, Title, Space, Button, Text } from '@mantine/core';
import AppNavbar from './AppNavbar';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

function LandingPage({ onLoginClick, onRegisterClick }: LandingPageProps) {
  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <AppNavbar
          isLoggedIn={false}
          isMerchant={false}
          onLoginClick={onLoginClick}
          onRegisterClick={onRegisterClick}
          onLogoutClick={() => { /* Not applicable for landing page */ }}
        />
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
