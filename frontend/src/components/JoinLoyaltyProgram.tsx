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
      // Assuming the programIdentifier can be either a program ID or a full link
      // The backend should be able to parse this.
      await axios.post(`/api/customers/join-program`, { customerId, programIdentifier });
      setSuccess('Successfully joined loyalty program!');
      setProgramIdentifier('');
      onProgramJoined?.();
    } catch (err) {
      setError('Failed to join loyalty program. Please check the link/ID.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Join a Loyalty Program</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <div>
        <label htmlFor="programIdentifier">Enter Program Link or ID:</label>
        <input
          type="text"
          id="programIdentifier"
          value={programIdentifier}
          onChange={(e) => setProgramIdentifier(e.target.value)}
          placeholder="e.g., program-id-123 or full-program-link"
        />
      </div>
      <button onClick={handleJoinProgram} disabled={loading}>
        {loading ? 'Joining...' : 'Join Program'}
      </button>
    </div>
  );
};

export default JoinLoyaltyProgram;
