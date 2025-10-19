
import React, { useState } from 'react';
import axios from 'axios';

interface MerchantSignupProps {
  onSignupSuccess: (merchantId: string) => void;
}

const MerchantSignup: React.FC<MerchantSignupProps> = ({ onSignupSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/merchants', { 
        name, 
        email, 
        password, 
        businessName, 
        businessType, 
        location, 
        contact 
      });
      console.log('Merchant created:', response.data);
      onSignupSuccess(response.data.id); // Pass merchant ID to onSignupSuccess
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
      <button type="submit">Signup</button>
    </form>
  );
};

export default MerchantSignup;
