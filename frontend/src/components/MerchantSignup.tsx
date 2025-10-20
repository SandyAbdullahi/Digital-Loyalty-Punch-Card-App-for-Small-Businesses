
import React, { useState } from 'react';
import axios from 'axios';

interface MerchantSignupProps {
  onAuthSuccess: (merchant: { id: string; email: string }) => void;
}

const MerchantSignup: React.FC<MerchantSignupProps> = ({ onAuthSuccess }) => {
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
    <div>
      <h2>{isRegistering ? 'Merchant Signup' : 'Merchant Login'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        {isRegistering && (
          <>
            <div>
              <label>Name:</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label>Business Name:</label>
              <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
            </div>
            <div>
              <label>Business Type:</label>
              <input type="text" value={businessType} onChange={(e) => setBusinessType(e.target.value)} required />
            </div>
            <div>
              <label>Location:</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <label>Contact:</label>
              <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} />
            </div>
          </>
        )}
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : (isRegistering ? 'Signup' : 'Login')}
        </button>
      </form>
      <p>
        {isRegistering ? 'Already have an account?' : 'Don\'t have an account?'}{' '}
        <button type="button" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'Login' : 'Signup'}
        </button>
      </p>
    </div>
  );
};

export default MerchantSignup;
