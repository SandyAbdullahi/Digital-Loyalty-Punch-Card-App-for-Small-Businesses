import React, { useState } from 'react';
import axios from 'axios';
import { AppShell, Container, Title, Paper, TextInput, PasswordInput, Button, Group, Anchor, Space } from '@mantine/core';
import AppNavbar from './AppNavbar';

interface CustomerAuthProps {
  onAuthSuccess: (customer: { id: string; email: string }) => void;
  onLoginClick: () => void; // Added prop for navigation to login
  onRegisterClick: () => void; // Added prop for navigation to register
  onHomeClick: () => void; // New prop for Home button
  initialIsRegistering?: boolean; // New prop to control initial state
}

const CustomerAuth: React.FC<CustomerAuthProps> = ({ onAuthSuccess, onLoginClick, onRegisterClick, onHomeClick, initialIsRegistering = true }) => {
  const [isRegistering, setIsRegistering] = useState(initialIsRegistering);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (isRegistering) {
        response = await axios.post('/api/customers/register', { email, password });
        alert('Registration successful! Please log in.');
        setIsRegistering(false); // Switch to login after successful registration
      } else {
        response = await axios.post('/api/customers/login', { email, password });
        onAuthSuccess(response.data.customer);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || 'Authentication failed');
      } else {
        setError('An unexpected error occurred');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <AppNavbar
          isLoggedIn={false}
          isMerchant={false} // Treat as customer context for navbar display
          onLoginClick={onLoginClick}
          onRegisterClick={onRegisterClick}
          onLogoutClick={() => { /* Not applicable here */ }}
          onHomeClick={onHomeClick}
        />
      </AppShell.Header>
      <AppShell.Main>
        <Container size={420} my={40}>
          <Title ta="center">{isRegistering ? 'Customer Register' : 'Customer Login'}</Title>
          <Paper withBorder shadow="md" p={30} mt={30} radius="md">
            {error && <Text c="red" size="sm" mb="md">{error}</Text>}
            <form onSubmit={handleSubmit}>
              <TextInput label="Email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.currentTarget.value)} required />
              <PasswordInput label="Password" placeholder="Your password" value={password} onChange={(event) => setPassword(event.currentTarget.value)} required mt="md" />
              <Button fullWidth mt="xl" type="submit" loading={loading}>
                {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
              </Button>
            </form>
            <Group justify="space-between" mt="md">
              <Anchor component="button" type="button" c="dimmed" size="xs" onClick={() => setIsRegistering(!isRegistering)}>
                {isRegistering ? 'Already have an account? Login' : 'Don\'t have an account? Register'}
              </Anchor>
              <Anchor component="button" type="button" c="dimmed" size="xs" onClick={onRegisterClick}>
                Are you a merchant? Login here
              </Anchor>
            </Group>
          </Paper>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};

export default CustomerAuth;