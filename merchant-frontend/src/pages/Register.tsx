import { Button, TextInput } from '@mantine/core';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formState, setFormState] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (formState.password !== formState.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setSubmitting(true);
      await register(formState.email, formState.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-start">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </button>
        </div>
        <div className="text-center">
          <img
            src="/logo-1.png"
            alt="Rudi"
            className="mx-auto mb-6 h-16 w-auto transform scale-75"
          />
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Join Rudi
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your merchant account to start rewarding loyalty
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <TextInput
              label="Email"
              type="email"
              value={formState.email}
              onChange={(event) =>
                setFormState({ ...formState, email: event.target.value })
              }
              required
              autoComplete="email"
              placeholder="merchant@business.com"
            />
            <TextInput
              label="Password"
              type="password"
              value={formState.password}
              onChange={(event) =>
                setFormState({ ...formState, password: event.target.value })
              }
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Create a secure password"
            />
            <TextInput
              label="Confirm Password"
              type="password"
              value={formState.confirmPassword}
              onChange={(event) =>
                setFormState({
                  ...formState,
                  confirmPassword: event.target.value,
                })
              }
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Confirm your password"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-accent/10 p-4 text-sm text-accent">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            size="md"
            color="teal"
            disabled={submitting}
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary hover:text-primary/80"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
