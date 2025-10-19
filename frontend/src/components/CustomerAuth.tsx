import React, { useState } from 'react';
import axios from 'axios';

interface CustomerAuthProps {
  onAuthSuccess: (customer: { id: string; email: string }) => void;
}

const CustomerAuth: React.FC<CustomerAuthProps> = ({ onAuthSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (isRegistering) {
        response = await axios.post('/api/customers/register', { email, password });
        alert('Registration successful! Please log in.');
        setIsRegistering(false); // Switch to login after successful registration
      } else {
        response = await axios.post('/api/customers/login', { email, password });
        onAuthSuccess(response.data.customer);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || 'Authentication failed');
      } else {
        setError('An unexpected error occurred');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{isRegistering ? 'Customer Register' : 'Customer Login'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
        </button>
      </form>
      <p>
        {isRegistering ? 'Already have an account?' : 'Don't have an account?'}{' '}
        <button type="button" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'Login' : 'Register'}
        </button>
      </p>
    </div>
  );
};

export default CustomerAuth;