import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface CustomerDashboardProps {
  customerId: string;
}

interface Merchant {
  id: string;
  businessName: string;
}

interface Stamp {
  id: string;
  merchantId: string;
  customerId: string;
  createdAt: string;
}

interface LoyaltyProgram {
  id: string;
  rewardName: string;
  threshold: number;
  expiryDate?: string;
}

interface CustomerLoyaltyCard {
  merchant: Merchant;
  stamps: Stamp[];
  loyaltyProgram: LoyaltyProgram | null;
  currentStamps: number;
  rewardReady: boolean;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ customerId }) => {
  const [merchantIdInput, setMerchantIdInput] = useState('');
  const [loyaltyCards, setLoyaltyCards] = useState<CustomerLoyaltyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchLoyaltyCards = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, this would be an API call to get all loyalty cards for the customer
      // For now, we'll simulate by fetching all merchants and checking if the customer has stamps with them
      // This is a placeholder and needs proper backend implementation for customer-specific loyalty cards
      const allMerchantsResponse = await axios.get('/api/merchants'); // Assuming an endpoint to get all merchants
      const allMerchants: Merchant[] = allMerchantsResponse.data;

      const customerStampsResponse = await axios.get(`/api/customers/${customerId}/stamps`); // Assuming this endpoint exists
      const customerStamps: Stamp[] = customerStampsResponse.data;

      const cards: CustomerLoyaltyCard[] = [];

      for (const merchant of allMerchants) {
        const stampsForMerchant = customerStamps.filter(stamp => stamp.merchantId === merchant.id);
        const loyaltyProgramsResponse = await axios.get(`/api/loyalty-programs/merchant/${merchant.id}`);
        const merchantLoyaltyPrograms: LoyaltyProgram[] = loyaltyProgramsResponse.data;

        // For MVP, assume one loyalty program per merchant
        const loyaltyProgram = merchantLoyaltyPrograms.length > 0 ? merchantLoyaltyPrograms[0] : null;

        if (stampsForMerchant.length > 0) { // Only show if customer has joined (has at least one stamp)
          cards.push({
            merchant,
            stamps: stampsForMerchant,
            loyaltyProgram,
            currentStamps: stampsForMerchant.length,
            rewardReady: loyaltyProgram ? stampsForMerchant.length >= loyaltyProgram.threshold : false,
          });
        }
      }
      setLoyaltyCards(cards);
    } catch (err) {
      setError('Failed to fetch loyalty cards.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyaltyCards();
  }, [customerId]);

  const handleJoinProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Assuming merchantIdInput is the merchant's ID from the QR code link
      await axios.post('/api/customers/join-program', { customerId, merchantId: merchantIdInput });
      setSuccess('Successfully joined loyalty program!');
      setMerchantIdInput('');
      fetchLoyaltyCards(); // Re-fetch cards after joining
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.details || 'Failed to join loyalty program.');
      } else {
        setError('An unexpected error occurred.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading customer dashboard...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Your Loyalty Cards</h2>
      {loyaltyCards.length === 0 ? (
        <p>You haven't joined any loyalty programs yet.</p>
      ) : (
        <div>
          {loyaltyCards.map(card => (
            <div key={card.merchant.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
              <h3>{card.merchant.businessName}</h3>
              {card.loyaltyProgram ? (
                <p>
                  Stamps: {card.currentStamps} / {card.loyaltyProgram.threshold} ({card.loyaltyProgram.rewardName})
                  {card.rewardReady && <strong> - Reward Ready!</strong>}
                </p>
              ) : (
                <p>No loyalty program configured by this merchant.</p>
              )}
            </div>
          ))}
        </div>
      )}

      <h3>Join a New Loyalty Program</h3>
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleJoinProgram}>
        <label>Merchant ID (from QR code link):</label>
        <input 
          type="text" 
          value={merchantIdInput} 
          onChange={(e) => setMerchantIdInput(e.target.value)} 
          required 
        />
        <button type="submit" disabled={loading}>Join Program</button>
      </form>
    </div>
  );
};

export default CustomerDashboard;