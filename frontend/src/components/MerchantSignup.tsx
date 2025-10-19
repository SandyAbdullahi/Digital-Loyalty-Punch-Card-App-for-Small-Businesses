
import React, { useState } from 'react';
import axios from 'axios';

const MerchantSignup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/merchants', { name, email, password });
      console.log('Merchant created:', response.data);
    } catch (error) {
      console.error('Failed to create merchant:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Merchant Signup</h2>
      <div>
        <label>Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <button type="submit">Signup</button>
    </form>
  );
};

export default MerchantSignup;
