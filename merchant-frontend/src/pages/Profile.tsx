import { FormEvent, useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Input, Label, Textarea } from '@rudi/ui';

type Merchant = {
  id: string;
  name: string;
  description?: string;
  website?: string;
  logo_url?: string;
};

const Profile = () => {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchMerchant = async () => {
      try {
        const response = await axios.get('/api/v1/merchants/');
        if (response.data.length > 0) {
          const m = response.data[0];
          setMerchant(m);
          setName(m.name || '');
          setDescription(m.description || '');
          setWebsite(m.website || '');
        }
      } catch (error) {
        console.error('Failed to fetch merchant', error);
      }
    };
    fetchMerchant();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!merchant) return;
    setStatus('saving');
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('website', website);
      if (logo) {
        formData.append('logo', logo);
      }
      const response = await axios.put('/api/v1/merchants/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMerchant(response.data);
      setStatus('success');
      setMessage('Profile updated successfully.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.response?.data?.detail ?? 'We could not save changes right now.');
    }
  };

  if (!merchant) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <header>
        <h1 className="font-heading text-2xl font-bold text-foreground">Merchant Profile</h1>
        <p className="text-sm text-muted-foreground">Update your business information</p>
      </header>
      <section className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Business Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Tell customers about your business"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo">Logo</Label>
            <img
              src={merchant.logo_url || `https://ui-avatars.com/api/?name=${merchant.name}`}
              alt="Logo"
              className="w-16 h-16 rounded-full mb-2 object-cover"
            />
            <input
              id="logo"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setLogo(file);
              }}
              className="block w-full text-sm"
            />
          </div>
          {status !== 'idle' && (
            <p className={`text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
          <Button type="submit" disabled={status === 'saving'}>
            {status === 'saving' ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </section>
    </div>
  );
};

export default Profile;