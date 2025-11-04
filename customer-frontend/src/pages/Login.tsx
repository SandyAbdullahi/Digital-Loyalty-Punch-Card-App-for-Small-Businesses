import { Alert, Anchor, Button, Paper, Stack, TextInput } from '@mantine/core';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ?? 'Unable to log in. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--rudi-background)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '28rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Logo
          size="xl"
          style={{ transform: 'scale(4.8)', transformOrigin: 'center', marginTop: '4rem', marginBottom: '2rem' }}
        />
        <h2
          style={{
            fontFamily: 'var(--mantine-font-family-headings)',
            fontWeight: 'bold',
            fontSize: 'clamp(3rem, 4.8vw, 3.6rem)',
            marginTop: '0',
            marginBottom: '1.5rem',
            color: 'var(--rudi-text)',
          }}
        >
          rudi
        </h2>
        <Paper
          shadow="md"
          radius="xl"
          p={{ base: 'md', md: 'lg' }}
          style={{
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '1rem',
          }}
        >
          <h3
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'var(--rudi-text)',
              textAlign: 'center',
              marginBottom: '1rem',
            }}
          >
            Login in
          </h3>
          <form onSubmit={handleSubmit} noValidate>
            <Stack gap="md">
               <TextInput
                 placeholder="Email"
                 type="email"
                 value={email}
                 onChange={(event) => setEmail(event.target.value)}
                 autoComplete="email"
                 required
                 styles={{
                   input: {
                     height: '3rem',
                     borderRadius: '0.75rem',
                     backgroundColor: 'var(--rudi-input-bg)',
                     borderColor: 'var(--rudi-input-border)',
                     color: 'var(--rudi-text)',
                     fontWeight: 600,
                     paddingLeft: '1rem',
                     paddingRight: '1rem',
                     transition: 'all 200ms ease',
                     '&:focus': {
                       outline: 'none',
                       ring: '2px solid var(--rudi-primary)',
                     },
                   },
                 }}
               />
               <TextInput
                 placeholder="Password"
                 type="password"
                 value={password}
                 onChange={(event) => setPassword(event.target.value)}
                 autoComplete="current-password"
                 required
                 styles={{
                   input: {
                     height: '3rem',
                     borderRadius: '0.75rem',
                     backgroundColor: 'var(--rudi-input-bg)',
                     borderColor: 'var(--rudi-input-border)',
                     color: 'var(--rudi-text)',
                     fontWeight: 600,
                     paddingLeft: '1rem',
                     paddingRight: '1rem',
                     transition: 'all 200ms ease',
                     '&:focus': {
                       outline: 'none',
                       ring: '2px solid var(--rudi-primary)',
                     },
                   },
                 }}
               />
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Anchor
                  href="#"
                  size="sm"
                  style={{
                    color: 'var(--rudi-primary)',
                    textDecoration: 'none',
                    transition: 'all 200ms ease',
                    fontWeight: 'bold',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.textDecoration = 'underline')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.textDecoration = 'none')
                  }
                >
                  Forgot password?
                </Anchor>
              </div>
              {error && (
                <Alert color="red" variant="light">
                  {error}
                </Alert>
              )}
              <Stack gap="xs">
                <Button
                  type="submit"
                  loading={isSubmitting}
                  fullWidth
                  size="md"
                  style={{
                    height: '3rem',
                    borderRadius: '0.75rem',
                    backgroundColor: 'var(--rudi-primary)',
                    transition: 'all 200ms ease',
                    '&:hover': {
                      backgroundColor: '#00B386',
                    },
                    '&:focus': {
                      outline: 'none',
                      boxShadow: '2px solid var(--rudi-primary)',
                    },
                  }}
                >
                  {isSubmitting ? 'Logging in…' : 'Log in'}
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate('/register')}
                  variant="filled"
                  fullWidth
                  size="md"
                  style={{
                    height: '3rem',
                    borderRadius: '0.75rem',
                    backgroundColor: 'var(--rudi-secondary)',
                    color: 'white',
                    transition: 'all 200ms ease',
                    '&:hover': {
                      backgroundColor: '#1976D2',
                    },
                    '&:focus': {
                      outline: 'none',
                      boxShadow: '2px solid var(--rudi-secondary)',
                    },
                  }}
                >
                  Sign up
                </Button>
              </Stack>
            </Stack>
          </form>
        </Paper>
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link
            to="/how-it-works"
            style={{
              fontSize: '0.875rem',
              color: 'var(--rudi-text)',
              textDecoration: 'none',
              transition: 'all 200ms ease',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.textDecoration = 'underline')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.textDecoration = 'none')
            }
          >
            <span
              style={{
                backgroundColor: 'var(--rudi-accent)',
                borderRadius: '50%',
                width: '1rem',
                height: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              !
            </span>
            How it works
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
