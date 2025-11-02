import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import FormField from '../components/FormField';
import { useAuth } from '../contexts/AuthContext';

const AUTO_PASSWORD = 'rudi-autogen';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await register(email, AUTO_PASSWORD, 'customer');
      navigate('/dashboard');
    } catch (err: any) {
      const message = err?.response?.data?.detail ?? 'We could not create your account. Try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-rudi-sand text-rudi-maroon flex flex-col items-center px-4 py-10">
      <header className="w-full max-w-md flex flex-col items-center gap-4 mb-8">
        <Logo />
        <div className="text-center space-y-2">
          <h1 className="font-heading text-2xl font-semibold">Create your account</h1>
          <p className="text-sm text-rudi-maroon/80">If your email already exists we’ll log you in automatically.</p>
        </div>
      </header>
      <section className="w-full max-w-md rudi-card p-6 space-y-6">
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <FormField
            id="register-email"
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="you@email.com"
            required
            helperText="We’ll send you updates about your rewards."
          />
          {error && (
            <p className="text-sm text-rudi-coral rounded-md bg-rudi-coral/10 px-3 py-2" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="rudi-btn rudi-btn--secondary w-full flex items-center justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rudi-btn rudi-btn--primary w-full"
        >
          Back to login
        </button>
      </section>
      <div className="mt-6">
        <Link to="/how-it-works" className="rudi-link text-sm">
          How it works
        </Link>
      </div>
    </main>
  );
};

export default Register;
