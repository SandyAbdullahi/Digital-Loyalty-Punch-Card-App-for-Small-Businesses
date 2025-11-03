import { Container, Title, Text, Stack, Card, Button, Badge, Group, List } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Starter',
      price: '$0',
      period: 'month',
      description: 'Perfect for small businesses getting started',
      features: [
        'Up to 100 customers',
        '1 loyalty program',
        'Basic analytics',
        'Email support'
      ],
      popular: false
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'month',
      description: 'Ideal for growing businesses',
      features: [
        'Up to 1000 customers',
        'Unlimited programs',
        'Advanced analytics',
        'Priority support',
        'Custom branding'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: 'month',
      description: 'For large businesses with complex needs',
      features: [
        'Unlimited customers',
        'Unlimited programs',
        'Premium analytics',
        'Dedicated support',
        'API access',
        'White-label solution'
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-rudi-sand py-xl">
      <Container size="lg">
        <Stack gap="xl">
          <Title order={1} size="3rem" align="center" className="font-heading text-rudi-maroon">
            Choose Your Plan
          </Title>
          <Text size="lg" align="center" className="text-rudi-maroon/80">
            Start free and scale as you grow. All plans include a 14-day free trial.
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                shadow="sm"
                padding="lg"
                radius="md"
                className={`bg-white relative ${plan.popular ? 'border-2 border-rudi-teal' : ''}`}
              >
                {plan.popular && (
                  <Badge color="teal" className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <Stack gap="md" align="center">
                  <Title order={2} className="text-rudi-maroon">
                    {plan.name}
                  </Title>
                  <div className="text-center">
                    <Text size="3rem" fw={700} className="text-rudi-maroon">
                      {plan.price}
                    </Text>
                    <Text className="text-rudi-maroon/70">per {plan.period}</Text>
                  </div>
                  <Text size="sm" align="center" className="text-rudi-maroon/80">
                    {plan.description}
                  </Text>
                  <List size="sm" className="text-rudi-maroon/80">
                    {plan.features.map((feature) => (
                      <List.Item key={feature}>✓ {feature}</List.Item>
                    ))}
                  </List>
                  <Button
                    fullWidth
                    size="lg"
                    className={plan.popular ? 'bg-rudi-teal hover:bg-teal-600' : 'bg-rudi-yellow text-rudi-maroon hover:bg-yellow-400'}
                    onClick={() => navigate('/register')}
                  >
                    {plan.price === '$0' ? 'Get Started' : 'Start Trial'}
                  </Button>
                </Stack>
              </Card>
            ))}
          </div>
          <Card shadow="sm" padding="lg" radius="md" className="bg-rudi-maroon text-white">
            <Stack align="center" gap="md">
              <Title order={2} size="2rem" align="center" className="font-heading">
                Need a Custom Solution?
              </Title>
              <Text align="center">
                Contact our sales team for enterprise solutions tailored to your business needs.
              </Text>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-rudi-maroon" onClick={() => navigate('/contact')}>
                Contact Sales
              </Button>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </div>
  );
};

export default Pricing;