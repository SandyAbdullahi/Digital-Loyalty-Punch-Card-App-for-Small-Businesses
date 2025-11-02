import { FormEvent, useState } from 'react';
import axios from 'axios';
import FormField from '../components/FormField';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setStatus('saving');
    setMessage('');
    try {
      await axios.put('/api/v1/customer/profile', {
        name,
        email: user.email,
      });
      setStatus('success');
      setMessage('Profile updated successfully.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.response?.data?.detail ?? 'We could not save changes right now.');
    }
  };

  return (
    <main className="min-h-screen bg-rudi-sand text-rudi-maroon pb-16">
      <header className="px-4 pt-10 pb-6 space-y-2">
        <h1 className="font-heading text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-rudi-maroon/70">Manage how you appear to merchants.</p>
      </header>
      <section className="px-4 space-y-6">
        <form className="rudi-card p-6 space-y-4" onSubmit={handleSubmit}>
          <FormField
            id="profile-name"
            label="Preferred name"
            placeholder="Add how you’d like to be greeted"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <FormField
            id="profile-email"
            label="Email"
            type="email"
            value={user?.email ?? ''}
            disabled
          />
          {status !== 'idle' && (
            <p
              className={`text-sm ${
                status === 'success' ? 'text-rudi-teal' : 'text-rudi-coral'
              }`}
              role="status"
            >
              {message}
            </p>
          )}
          <button
            type="submit"
            className="rudi-btn rudi-btn--primary w-full"
            disabled={status === 'saving'}
          >
            {status === 'saving' ? 'Saving…' : 'Save changes'}
          </button>
        </form>
        <button
          type="button"
          onClick={logout}
          className="rudi-btn w-full border border-rudi-coral text-rudi-coral bg-transparent"
        >
          Log out
        </button>
      </section>
    </main>
  );
};

export default Profile;
