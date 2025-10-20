import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface RewardRedemptionProps {
  customerId: string;
  loyaltyProgramId: string;
  // Potentially pass reward details directly or fetch them
}

interface RewardDetails {
  id: string;
  name: string;
  description: string;
  redemptionCode?: string; // Code to show in-store
  status: 'redeemable' | 'redeemed' | 'expired';
}

const RewardRedemption: React.FC<RewardRedemptionProps> = ({ customerId, loyaltyProgramId }) => {
  const [reward, setReward] = useState<RewardDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [redemptionStatus, setRedemptionStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchRewardDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        // Assuming an endpoint to get redeemable reward for a customer in a program
        const response = await axios.get(`/api/customers/${customerId}/loyalty-programs/${loyaltyProgramId}/redeemable-reward`);
        setReward(response.data);
      } catch (err) {
        setError('Failed to fetch reward details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (customerId && loyaltyProgramId) {
      fetchRewardDetails();
    }
  }, [customerId, loyaltyProgramId]);

  const handleRedeemReward = async () => {
    if (!reward || reward.status !== 'redeemable') {
      setError('Reward is not redeemable.');
      return;
    }

    setLoading(true);
    setError(null);
    setRedemptionStatus(null);

    try {
      await axios.post(`/api/customers/${customerId}/rewards/${reward.id}/redeem`);
      setRedemptionStatus('Reward successfully redeemed!');
      setReward(prev => prev ? { ...prev, status: 'redeemed' } : null); // Update status locally
    } catch (err) {
      setError('Failed to redeem reward.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading reward details...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (!reward) {
    return <div>No redeemable reward found for this program.</div>;
  }

  return (
    <div>
      <h3>Redeem Your Reward: {reward.name}</h3>
      <p>{reward.description}</p>
      {reward.status === 'redeemable' ? (
        <>
          {redemptionStatus && <p style={{ color: 'green' }}>{redemptionStatus}</p>}
          <button onClick={handleRedeemReward} disabled={loading}>
            {loading ? 'Redeeming...' : 'Redeem Reward'}
          </button>
        </>
      ) : (
        <p>Status: <strong>{reward.status}</strong></p>
      )}
      {reward.status === 'redeemed' && reward.redemptionCode && (
        <p>Show this code in-store: <strong>{reward.redemptionCode}</strong></p>
      )}
    </div>
  );
};

export default RewardRedemption;
