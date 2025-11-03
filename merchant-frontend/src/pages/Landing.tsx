import { Button, Container, Grid, Group, Stack, Text, Title, Image, Card, Badge, Header, Anchor } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-rudi-sand">
      {/* Navigation */}
      <Header height={60} className="bg-white shadow-sm">
        <Container size="xl" className="h-full flex items-center justify-between">
          <Title order={3} className="font-heading text-rudi-maroon cursor-pointer" onClick={() => navigate('/')}>
            Rudi
          </Title>
          <Group gap="lg">
            <Anchor className="text-rudi-maroon hover:text-rudi-teal" onClick={() => navigate('/about')}>
              About
            </Anchor>
            <Anchor className="text-rudi-maroon hover:text-rudi-teal" onClick={() => navigate('/pricing')}>
              Pricing
            </Anchor>
            <Anchor className="text-rudi-maroon hover:text-rudi-teal" onClick={() => navigate('/contact')}>
              Contact
            </Anchor>
            <Button variant="subtle" className="text-rudi-teal" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button className="bg-rudi-teal hover:bg-teal-600" onClick={() => navigate('/register')}>
              Sign Up
            </Button>
          </Group>
        </Container>
      </Header>

      {/* Hero Section */}
      <Container size="xl" py="xl">
        <Grid gutter="xl" align="center">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="lg">
              <Title order={1} size="3rem" className="font-heading text-rudi-maroon">
                Boost Your Business with Loyalty Programs
              </Title>
              <Text size="lg" className="text-rudi-maroon/80">
                Create engaging loyalty programs, manage customers, and grow your revenue with Rudi's easy-to-use platform.
              </Text>
              <Group>
                <Button size="lg" className="bg-rudi-teal hover:bg-teal-600" onClick={() => navigate('/register')}>
                  Get Started
                </Button>
                <Button size="lg" variant="outline" className="border-rudi-teal text-rudi-teal hover:bg-rudi-teal hover:text-white" onClick={() => navigate('/login')}>
                  Login
                </Button>
              </Group>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Image
              src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
              alt="People ordering food"
              radius="lg"
              className="shadow-lg"
            />
          </Grid.Col>
        </Grid>
      </Container>

      {/* Features Section */}
      <Container size="xl" py="xl">
        <Title order={2} size="2.5rem" align="center" className="font-heading text-rudi-maroon mb-xl">
          Why Choose Rudi?
        </Title>
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" className="bg-white">
              <Card.Section>
                <Image
                  src="https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg"
                  height={160}
                  alt="Loyalty programs"
                />
              </Card.Section>
              <Group justify="space-between" mt="md" mb="xs">
                <Text fw={500} className="text-rudi-maroon">Easy Setup</Text>
                <Badge color="teal" variant="light">
                  Popular
                </Badge>
              </Group>
              <Text size="sm" className="text-rudi-maroon/70">
                Create and customize loyalty programs in minutes with our intuitive interface.
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" className="bg-white">
              <Card.Section>
                <Image
                  src="https://images.pexels.com/photos/3184195/pexels-photo-3184195.jpeg"
                  height={160}
                  alt="Customer management"
                />
              </Card.Section>
              <Group justify="space-between" mt="md" mb="xs">
                <Text fw={500} className="text-rudi-maroon">Customer Insights</Text>
                <Badge color="yellow" variant="light">
                  Analytics
                </Badge>
              </Group>
              <Text size="sm" className="text-rudi-maroon/70">
                Track customer behavior and optimize your programs with detailed analytics.
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" className="bg-white">
              <Card.Section>
                <Image
                  src="https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg"
                  height={160}
                  alt="QR codes"
                />
              </Card.Section>
              <Group justify="space-between" mt="md" mb="xs">
                <Text fw={500} className="text-rudi-maroon">QR Integration</Text>
                <Badge color="coral" variant="light">
                  Seamless
                </Badge>
              </Group>
              <Text size="sm" className="text-rudi-maroon/70">
                Generate QR codes for easy customer scanning and stamp collection.
              </Text>
            </Card>
          </Grid.Col>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Container size="xl" py="xl" className="bg-rudi-maroon text-white rounded-lg">
        <Stack align="center" gap="md">
          <Title order={2} size="2rem" align="center" className="font-heading">
            Ready to Grow Your Business?
          </Title>
          <Text size="lg" align="center">
            Join thousands of merchants using Rudi to increase customer loyalty and sales.
          </Text>
          <Button size="lg" className="bg-rudi-yellow text-rudi-maroon hover:bg-yellow-400" onClick={() => navigate('/register')}>
            Start Your Free Trial
          </Button>
        </Stack>
      </Container>
    </div>
  );
};

export default Landing;