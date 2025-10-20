import React, { useState } from 'react';
import axios from 'axios';

interface JoinLoyaltyProgramProps {
  customerId: string;
  onProgramJoined?: () => void;
}

const JoinLoyaltyProgram: React.FC<JoinLoyaltyProgramProps> = ({ customerId, onProgramJoined }) => {
  const [programIdentifier, setProgramIdentifier] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleJoinProgram = async () => {
    if (!programIdentifier) {
      setError('Please enter a program link or ID.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('[JoinLoyaltyProgram] sending join request', {
        customerId,
        programIdentifier,
      });
      await axios.post(`/api/customers/join-program`, { customerId, programIdentifier });
      console.log('[JoinLoyaltyProgram] join request succeeded');
      setSuccess('Successfully joined loyalty program!');
      setProgramIdentifier('');
      onProgramJoined?.();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        console.log('[JoinLoyaltyProgram] join request failed', {
          status: err.response.status,
          data: err.response.data,
        });
        setError(err.response.data.error || err.response.data.details || 'Failed to join loyalty program. Please check the link/ID.');
      } else {
        console.log('[JoinLoyaltyProgram] join request failed with unknown error', err);
        setError('Failed to join loyalty program. Please check the link/ID.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Join a Loyalty Program</h3>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        Paste the shareable join link or loyalty program ID provided by the merchant. Links look like
        <code style={{ marginLeft: '4px' }}>https://your-app.com/join/PROGRAM_ID</code>.
      </p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <div>
        <label htmlFor="programIdentifier">Program Link or ID:</label>
        <input
          type="text"
          id="programIdentifier"
          value={programIdentifier}
          onChange={(e) => setProgramIdentifier(e.target.value)}
          placeholder="e.g., https://app.com/join/abc123"
        />
      </div>
      <button onClick={handleJoinProgram} disabled={loading}>
        {loading ? 'Joining...' : 'Join Program'}
      </button>
    </div>
  );
};

export default JoinLoyaltyProgram;
