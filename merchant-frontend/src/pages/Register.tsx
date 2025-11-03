import { Button, TextInput } from '@mantine/core';
import { AlertTriangle } from 'lucide-react';
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
    <div className="flex min-h-screen items-center justify-center bg-[#FDF6EC] p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img
            src="/logo-1.png"
            alt="Rudi"
            className="mx-auto mb-6 h-16 w-auto transform scale-75"
          />
          <h1 className="font-heading text-3xl font-bold text-rudi-maroon">
            Join Rudi
          </h1>
          <p className="mt-2 text-sm text-rudi-maroon/70">
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
            <div className="flex items-center gap-2 rounded-2xl bg-rudi-coral/10 p-4 text-sm text-rudi-coral">
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
          <p className="text-sm text-rudi-maroon/70">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-rudi-teal hover:text-rudi-teal/80"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
