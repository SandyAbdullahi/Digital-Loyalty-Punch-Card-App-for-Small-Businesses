import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface LoyaltyProgramFormProps {
  merchantId: string;
  onProgramCreated?: () => void;
  onProgramUpdated?: () => void;
  existingProgram?: LoyaltyProgram;
}

interface LoyaltyProgram {
  id?: string;
  merchantId: string;
  rewardName: string;
  threshold: number;
  expiryDate?: string;
}

const LoyaltyProgramForm: React.FC<LoyaltyProgramFormProps> = ({ 
  merchantId, 
  onProgramCreated, 
  onProgramUpdated, 
  existingProgram 
}) => {
  const [rewardName, setRewardName] = useState(existingProgram?.rewardName || '');
  const [threshold, setThreshold] = useState(existingProgram?.threshold || 0);
  const [expiryDate, setExpiryDate] = useState(existingProgram?.expiryDate ? existingProgram.expiryDate.split('T')[0] : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (existingProgram) {
      setRewardName(existingProgram.rewardName);
      setThreshold(existingProgram.threshold);
      setExpiryDate(existingProgram.expiryDate ? existingProgram.expiryDate.split('T')[0] : '');
    }
  }, [existingProgram]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const programData: LoyaltyProgram = {
      merchantId,
      rewardName,
      threshold,
      ...(expiryDate && { expiryDate: new Date(expiryDate).toISOString() }),
    };

    try {
      if (existingProgram) {
        await axios.put(`/api/loyalty-programs/${existingProgram.id}`, programData);
        setSuccess('Loyalty program updated successfully!');
        onProgramUpdated?.();
      } else {
        await axios.post('/api/loyalty-programs', programData);
        setSuccess('Loyalty program created successfully!');
        onProgramCreated?.();
        // Clear form after creation
        setRewardName('');
        setThreshold(0);
        setExpiryDate('');
      }
    } catch (err) {
      setError('Failed to save loyalty program.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{existingProgram ? 'Edit Loyalty Program' : 'Create New Loyalty Program'}</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <div>
        <label>Reward Name:</label>
        <input 
          type="text" 
          value={rewardName} 
          onChange={(e) => setRewardName(e.target.value)} 
          required 
        />
      </div>
      <div>
        <label>Threshold (Stamps needed):</label>
        <input 
          type="number" 
          value={threshold} 
          onChange={(e) => setThreshold(parseInt(e.target.value))} 
          required 
          min="1"
        />
      </div>
      <div>
        <label>Expiry Date (Optional):</label>
        <input 
          type="date" 
          value={expiryDate} 
          onChange={(e) => setExpiryDate(e.target.value)} 
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : (existingProgram ? 'Update Program' : 'Create Program')}
      </button>
    </form>
  );
};

export default LoyaltyProgramForm;