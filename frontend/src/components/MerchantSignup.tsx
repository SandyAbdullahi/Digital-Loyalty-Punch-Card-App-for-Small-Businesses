
import React, { useState } from 'react';
import axios from 'axios';
import { AppShell, Container, Title, Paper, TextInput, PasswordInput, Button, Group, Anchor, Space } from '@mantine/core';
import AppNavbar from './AppNavbar';

interface MerchantSignupProps {
  onAuthSuccess: (merchant: { id: string; email: string }) => void;
  onLoginClick: () => void; // Added prop for navigation to login
  onRegisterClick: () => void; // Added prop for navigation to register
  onHomeClick: () => void; // New prop for Home button
}

const MerchantSignup: React.FC<MerchantSignupProps> = ({ onAuthSuccess, onLoginClick, onRegisterClick, onHomeClick }) => {
  const [isRegistering, setIsRegistering] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (isRegistering) {
        response = await axios.post('/api/merchants', {
          name,
          email,
          password,
          businessName,
          businessType,
          location,
          contact,
        });
        console.log('Merchant created:', response.data);
        alert('Registration successful! Please log in.');
        setIsRegistering(false); // Switch to login after successful registration
      } else {
        response = await axios.post('/api/merchants/login', { email, password });
        onAuthSuccess(response.data.merchant);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || 'Authentication failed');
      } else {
        setError('An unexpected error occurred');
      }
      console.error('Failed to authenticate merchant:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <AppNavbar
          isLoggedIn={false}
          isMerchant={true} // Treat as merchant context for navbar display
          onLoginClick={onLoginClick}
          onRegisterClick={onRegisterClick}
          onLogoutClick={() => { /* Not applicable here */ }}
          onHomeClick={onHomeClick}
        />
      </AppShell.Header>
      <AppShell.Main>
        <Container size={420} my={40}>
          <Title ta="center">{isRegistering ? 'Merchant Signup' : 'Merchant Login'}</Title>
          <Paper withBorder shadow="md" p={30} mt={30} radius="md">
            {error && <Text c="red" size="sm" mb="md">{error}</Text>}
            <form onSubmit={handleSubmit}>
              {isRegistering && (
                <>
                  <TextInput label="Name" placeholder="Your name" value={name} onChange={(event) => setName(event.currentTarget.value)} required />
                  <TextInput label="Business Name" placeholder="Your business name" value={businessName} onChange={(event) => setBusinessName(event.currentTarget.value)} required mt="md" />
                  <TextInput label="Business Type" placeholder="e.g., Cafe, Salon" value={businessType} onChange={(event) => setBusinessType(event.currentTarget.value)} required mt="md" />
                  <TextInput label="Location" placeholder="Your business location" value={location} onChange={(event) => setLocation(event.currentTarget.value)} mt="md" />
                  <TextInput label="Contact" placeholder="Your contact number" value={contact} onChange={(event) => setContact(event.currentTarget.value)} mt="md" />
                </>
              )}
              <TextInput label="Email" placeholder="you@mantine.dev" value={email} onChange={(event) => setEmail(event.currentTarget.value)} required mt={isRegistering ? "md" : undefined} />
              <PasswordInput label="Password" placeholder="Your password" value={password} onChange={(event) => setPassword(event.currentTarget.value)} required mt="md" />
              <Button fullWidth mt="xl" type="submit" loading={loading}>
                {isRegistering ? 'Sign up' : 'Login'}
              </Button>
            </form>
            <Group justify="space-between" mt="md">
              <Anchor component="button" type="button" c="dimmed" size="xs" onClick={() => setIsRegistering(!isRegistering)}>
                {isRegistering ? 'Already have an account? Login' : 'Don\'t have an account? Register'}
              </Anchor>
              <Anchor component="button" type="button" c="dimmed" size="xs" onClick={onLoginClick}>
                Are you a customer? Login here
              </Anchor>
            </Group>
          </Paper>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};

export default MerchantSignup;
