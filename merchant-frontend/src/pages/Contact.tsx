import { Container, Title, Text, Stack, TextInput, Textarea, Button, Group, Card } from '@mantine/core';
import { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-rudi-sand py-xl">
      <Container size="md">
        <Stack gap="xl">
          <Title order={1} size="3rem" align="center" className="font-heading text-rudi-maroon">
            Contact Us
          </Title>
          <Text size="lg" align="center" className="text-rudi-maroon/80">
            Have questions? We'd love to hear from you.
          </Text>
          <Card shadow="sm" padding="lg" radius="md" className="bg-white">
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label="Name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <TextInput
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Textarea
                  label="Message"
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  minRows={4}
                />
                <Group justify="center">
                  <Button type="submit" size="lg" className="bg-rudi-teal hover:bg-teal-600">
                    Send Message
                  </Button>
                </Group>
              </Stack>
            </form>
          </Card>
          <Card shadow="sm" padding="lg" radius="md" className="bg-white">
            <Title order={3} className="text-rudi-maroon mb-md">
              Other Ways to Reach Us
            </Title>
            <Stack gap="sm">
              <Text className="text-rudi-maroon/80">
                <strong>Email:</strong> support@rudi.com
              </Text>
              <Text className="text-rudi-maroon/80">
                <strong>Phone:</strong> +1 (555) 123-4567
              </Text>
              <Text className="text-rudi-maroon/80">
                <strong>Address:</strong> 123 Business St, City, State 12345
              </Text>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </div>
  );
};

export default Contact;