import { Container, Title, Text, Stack, Image, Grid } from '@mantine/core';

const About = () => {
  return (
    <div className="min-h-screen bg-rudi-sand py-xl">
      <Container size="lg">
        <Stack gap="xl">
          <Title order={1} size="3rem" align="center" className="font-heading text-rudi-maroon">
            About Rudi
          </Title>
          <Grid gutter="xl" align="center">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Text size="lg" className="text-rudi-maroon/80">
                Rudi is a comprehensive loyalty program platform designed for merchants to engage customers, increase retention, and boost sales. Our mission is to make loyalty programs accessible and effective for businesses of all sizes.
              </Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Image
                src="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg"
                alt="Team working"
                radius="lg"
              />
            </Grid.Col>
          </Grid>
          <Title order={2} size="2rem" className="font-heading text-rudi-maroon">
            Our Story
          </Title>
          <Text size="md" className="text-rudi-maroon/80">
            Founded in 2023, Rudi was born from the idea that every business deserves powerful tools to build lasting customer relationships. We saw how complex and expensive loyalty systems were holding back small and medium businesses, so we created a simple, affordable solution.
          </Text>
          <Title order={2} size="2rem" className="font-heading text-rudi-maroon">
            Our Values
          </Title>
          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack align="center" gap="sm">
                <div className="w-16 h-16 bg-rudi-teal rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl">🎯</span>
                </div>
                <Text fw={500} className="text-rudi-maroon">Simplicity</Text>
                <Text size="sm" align="center" className="text-rudi-maroon/70">
                  We believe great tools should be easy to use.
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack align="center" gap="sm">
                <div className="w-16 h-16 bg-rudi-yellow rounded-full flex items-center justify-center">
                  <span className="text-rudi-maroon text-2xl">🤝</span>
                </div>
                <Text fw={500} className="text-rudi-maroon">Partnership</Text>
                <Text size="sm" align="center" className="text-rudi-maroon/70">
                  We're in this together with our merchants.
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack align="center" gap="sm">
                <div className="w-16 h-16 bg-rudi-coral rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl">🚀</span>
                </div>
                <Text fw={500} className="text-rudi-maroon">Innovation</Text>
                <Text size="sm" align="center" className="text-rudi-maroon/70">
                  Constantly improving to serve you better.
                </Text>
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>
    </div>
  );
};

export default About;