import React, { useState } from 'react';
import axios from 'axios';

interface IssueStampFormProps {
  merchantId: string;
  onStampIssued?: () => void;
}

const IssueStampForm: React.FC<IssueStampFormProps> = ({ merchantId, onStampIssued }) => {
  const [customerId, setCustomerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post(`/api/merchants/${merchantId}/issue-stamp`, { customerId });
      setSuccess('Stamp issued successfully!');
      setCustomerId('');
      onStampIssued?.();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.details || 'Failed to issue stamp.');
      } else {
        setError('An unexpected error occurred.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Issue Stamp to Customer</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <div>
        <label>Customer ID:</label>
        <input 
          type="text" 
          value={customerId} 
          onChange={(e) => setCustomerId(e.target.value)} 
          required 
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Issuing...' : 'Issue Stamp'}
      </button>
    </form>
  );
};

export default IssueStampForm;