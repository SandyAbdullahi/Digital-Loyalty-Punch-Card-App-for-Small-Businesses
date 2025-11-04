import { FormEvent, useState, useEffect } from 'react';
import axios from 'axios';
import FormField from '../components/FormField';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setStatus('saving');
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', user.email);
      if (avatar) {
        formData.append('avatar', avatar);
      }
      const response = await axios.put('/api/v1/customer/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      updateUser(response.data);
      setStatus('success');
      setMessage('Profile updated successfully.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.response?.data?.detail ?? 'We could not save changes right now.');
    }
  };

  return (
    <main className="min-h-screen bg-[var(--rudi-background)] text-[var(--rudi-text)] pb-16">
      <header className="px-4 pt-10 pb-6 space-y-2">
        <h1 className="font-heading text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-[var(--rudi-text)]/70">Manage how you appear to merchants.</p>
      </header>
      <section className="px-4 space-y-6">
          <form className="rudi-card p-6 space-y-4" onSubmit={handleSubmit}>
             <div className="space-y-2">
               <label htmlFor="profile-avatar" className="block text-sm font-semibold text-[var(--rudi-text)]">
                 Avatar
               </label>
                <img
                  src={user?.avatar_url ? `${user.avatar_url}?t=${Date.now()}` : `https://ui-avatars.com/api/?name=${user?.name || user?.email}`}
                  alt="Current avatar"
                  className="w-16 h-16 rounded-full mb-2 object-cover"
                />
                <input
                  id="profile-avatar"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setAvatar(file);
                  }}
                  className="block w-full text-sm text-[var(--rudi-text)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--rudi-primary)] file:text-white hover:file:bg-[var(--rudi-primary)]/80"
                />
             </div>
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
                 status === 'success' ? 'text-[var(--rudi-primary)]' : 'text-[var(--rudi-accent)]'
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
           className="rudi-btn w-full border border-[var(--rudi-accent)] text-[var(--rudi-accent)] bg-transparent"
         >
           Log out
         </button>
      </section>
      <BottomNav />
    </main>
  );
};

export default Profile;
