import React from 'react';
import { AppShell, Container, Title, Space, Button, Text, SimpleGrid, Card, Image, Group, List, ThemeIcon, rem } from '@mantine/core';
import { IconCircleCheck } from '@tabler/icons-react';
import AppNavbar from './AppNavbar';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onHomeClick: () => void; // New prop for Home button
}

function LandingPage({ onLoginClick, onRegisterClick, onHomeClick }: LandingPageProps) {
  return (
    <AppShell
      header={{ height: 60 }}
      footer={{ height: 60 }} // Add footer height
      padding="md"
    >
      <AppShell.Header>
        <AppNavbar
          isLoggedIn={false}
          isMerchant={false}
          onLoginClick={onLoginClick}
          onRegisterClick={onRegisterClick}
          onLogoutClick={() => { /* Not applicable for landing page */ }}
          onHomeClick={onHomeClick}
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
          <Group justify="center">
            <Button size="lg" onClick={onRegisterClick}>Merchant Sign Up</Button>
            <Button size="lg" variant="outline" onClick={onLoginClick}>Customer Registration</Button>
          </Group>
        </Container>

        <Container size="lg" py="xl">
          <Title order={2} ta="center" mt="xl">Why Choose LoyaltyApp?</Title>
          <Space h="xl" />
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section>
                <Image
                  src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  h={160}
                  alt="Business Growth"
                />
              </Card.Section>
              <Text fw={700} mt="md">Increase Customer Retention</Text>
              <Text size="sm" c="dimmed">Keep your customers coming back with engaging loyalty programs.</Text>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section>
                <Image
                  src="https://images.pexels.com/photos/3184433/pexels-photo-3184433.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  h={160}
                  alt="Easy Setup"
                />
              </Card.Section>
              <Text fw={700} mt="md">Easy Setup & Management</Text>
              <Text size="sm" c="dimmed">Launch your digital loyalty program in minutes, no technical skills required.</Text>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section>
                <Image
                  src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  h={160}
                  alt="Customer Engagement"
                />
              </Card.Section>
              <Text fw={700} mt="md">Boost Customer Engagement</Text>
              <Text size="sm" c="dimmed">Engage your customers with personalized rewards and notifications.</Text>
            </Card>
          </SimpleGrid>
        </Container>

        <Container size="lg" py="xl">
          <Title order={2} ta="center" mt="xl">How It Works</Title>
          <Space h="xl" />
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <div>
              <Title order={3}>For Merchants</Title>
              <List
                spacing="xs"
                size="sm"
                center
                icon={
                  <ThemeIcon color="primary" size={24} radius="xl">
                    <IconCircleCheck style={{ width: rem(16), height: rem(16) }} />
                  </ThemeIcon>
                }
              >
                <List.Item>Sign up and customize your loyalty program in minutes.</List.Item>
                <List.Item>Generate unique QR codes for customers to join and earn stamps.</List.Item>
                <List.Item>Track customer activity and reward redemption from your dashboard.</List.Item>
                <List.Item>Increase repeat business and customer loyalty effortlessly.</List.Item>
              </List>
            </div>
            <div>
              <Title order={3}>For Customers</Title>
              <List
                spacing="xs"
                size="sm"
                center
                icon={
                  <ThemeIcon color="accent" size={24} radius="xl">
                    <IconCircleCheck style={{ width: rem(16), height: rem(16) }} />
                  </ThemeIcon>
                }
              >
                <List.Item>Join your favorite local businesses' loyalty programs via QR code.</List.Item>
                <List.Item>Collect digital stamps with every purchase.</List.Item>
                <List.Item>Redeem exciting rewards directly from your phone.</List.Item>
                <List.Item>Receive notifications about new stamps and available rewards.</List.Item>
              </List>
            </div>
          </SimpleGrid>
        </Container>
      </AppShell.Main>

      <AppShell.Footer p="md">
        <Text ta="center" c="dimmed" size="sm">
          © {new Date().getFullYear()} LoyaltyApp. All rights reserved.
        </Text>
      </AppShell.Footer>
    </AppShell>
  );
}

export default LandingPage;
