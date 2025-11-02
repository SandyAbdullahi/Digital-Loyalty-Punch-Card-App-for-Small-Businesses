import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import FormField from '../components/FormField';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      const message = err?.response?.data?.detail ?? 'Unable to log in. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1E90FF] text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <Logo size="xl" />
        <h2 className="font-heading font-bold text-2xl md:text-3xl mt-4 mb-6 text-white">rudi</h2>
        <div className="w-full bg-white rounded-2xl shadow-md p-6 md:p-7 space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="w-full h-12 rounded-xl bg-[#FFF9F0] border border-[#EADCC7] text-[#3B1F1E] px-4 focus:outline-none focus:ring-2 focus:ring-[#009688] transition duration-200"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                className="w-full h-12 rounded-xl bg-[#FFF9F0] border border-[#EADCC7] text-[#3B1F1E] px-4 focus:outline-none focus:ring-2 focus:ring-[#009688] transition duration-200"
              />
            </div>
            <div className="flex justify-end">
              <a href="#" className="text-sm text-white hover:underline transition duration-200">Forgot password?</a>
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full h-12 bg-[#009688] text-white rounded-xl font-medium hover:bg-[#00796b] focus:outline-none focus:ring-2 focus:ring-[#009688] transition duration-200 flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in…' : 'Log in'}
            </button>
          </form>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="w-full h-12 bg-yellow-400 text-[#3B1F1E] rounded-xl font-medium hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-[#009688] transition duration-200"
          >
            Sign up
          </button>
        </div>
        <div className="text-center mt-6">
          <Link to="/how-it-works" className="text-sm text-white hover:underline transition duration-200">
            How it works
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Login;
