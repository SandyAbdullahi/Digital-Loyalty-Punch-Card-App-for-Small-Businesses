import React from 'react';
import { Container, Title, Text, Space, Button, SimpleGrid, Card, Image, Badge, Group } from '@mantine/core';

interface CustomerHomeContentProps {
  // Add any props needed for fetching merchant data, e.g., customerLocation
}

function CustomerHomeContent(props: CustomerHomeContentProps) {
  // Placeholder for fetching merchants near the customer
  const merchants = [
    { id: '1', name: 'Coffee Corner', type: 'Cafe', location: 'Downtown', imageUrl: 'https://via.placeholder.com/150/00A3E8/FFFFFF?text=Coffee' },
    { id: '2', name: 'Beauty Salon Deluxe', type: 'Salon', location: 'Uptown', imageUrl: 'https://via.placeholder.com/150/3EDC9D/FFFFFF?text=Salon' },
    { id: '3', name: 'Book Nook', type: 'Bookstore', location: 'City Center', imageUrl: 'https://via.placeholder.com/150/2D2D2D/FFFFFF?text=Books' },
  ];

  return (
    <Container size="md" py="md">
      <Title order={2} ta="center" mt="md">Participating Merchants Near You</Title>
      <Text ta="center" c="dimmed" mt="sm">Discover local businesses offering exciting loyalty programs.</Text>
      <Space h="xl" />

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
        {merchants.map((merchant) => (
          <Card key={merchant.id} shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
              <Image
                src={merchant.imageUrl}
                h={160}
                alt={merchant.name}
              />
            </Card.Section>

            <Group justify="space-between" mt="md" mb="xs">
              <Text fw={700}>{merchant.name}</Text>
              <Badge color="primary" variant="light">{merchant.type}</Badge>
            </Group>

            <Text size="sm" c="dimmed">
              {merchant.location}
            </Text>

            <Button variant="light" color="primary" fullWidth mt="md" radius="md">
              View Loyalty Program
            </Button>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}

export default CustomerHomeContent;
