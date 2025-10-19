import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LoyaltyProgramForm from './LoyaltyProgramForm';
import IssueStampForm from './IssueStampForm';

interface Merchant {
  id: string;
  name: string;
  email: string;
  businessName: string;
  businessType: string;
  location?: string;
  contact?: string;
  qrCodeLink?: string;
}

interface LoyaltyProgram {
  id: string;
  merchantId: string;
  rewardName: string;
  threshold: number;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface AnalyticsData {
  customersJoined: number;
  stampsIssued: number;
  rewardsRedeemed: number;
}

const MerchantDashboard: React.FC = () => {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<LoyaltyProgram[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProgram, setEditingProgram] = useState<LoyaltyProgram | null>(null);

  // In a real application, the merchant ID would come from authentication context
  // For now, we'll assume a hardcoded ID or fetch the last created merchant
  const merchantId = 'REPLACE_WITH_ACTUAL_MERCHANT_ID'; 

  const fetchMerchantData = async () => {
    if (merchantId === 'REPLACE_WITH_ACTUAL_MERCHANT_ID') {
      setLoading(false);
      setError('Merchant ID not available. Please sign up or log in.');
      return;
    }

    try {
      const merchantResponse = await axios.get(`/api/merchants/${merchantId}`); 
      setMerchant(merchantResponse.data);

      const programsResponse = await axios.get(`/api/loyalty-programs/merchant/${merchantId}`);
      setLoyaltyPrograms(programsResponse.data);

      const analyticsResponse = await axios.get(`/api/analytics/merchant/${merchantId}`);
      setAnalytics(analyticsResponse.data);

    } catch (err) {
      setError('Failed to fetch merchant data or loyalty programs.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchantData();
  }, [merchantId]);

  const handleProgramChange = () => {
    setEditingProgram(null);
    fetchMerchantData(); // Re-fetch data after creation/update
  };

  const handleStampIssued = () => {
    fetchMerchantData(); // Re-fetch data to update analytics and loyalty programs
  };

  if (loading) {
    return <div>Loading merchant data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!merchant) {
    return <div>No merchant data found.</div>;
  }

  return (
    <div>
      <h2>Merchant Dashboard</h2>
      <p><strong>Name:</strong> {merchant.name}</p>
      <p><strong>Email:</strong> {merchant.email}</p>
      <p><strong>Business Name:</strong> {merchant.businessName}</p>
      <p><strong>Business Type:</strong> {merchant.businessType}</p>
      {merchant.location && <p><strong>Location:</strong> {merchant.location}</p>}
      {merchant.contact && <p><strong>Contact:</strong> {merchant.contact}</p>}
      {merchant.qrCodeLink && (
        <p><strong>QR Code Link:</strong> <a href={merchant.qrCodeLink}>{merchant.qrCodeLink}</a></p>
      )}

      <h3>Analytics</h3>
      {analytics ? (
        <div>
          <p>Customers Joined: {analytics.customersJoined}</p>
          <p>Stamps Issued: {analytics.stampsIssued}</p>
          <p>Rewards Redeemed: {analytics.rewardsRedeemed}</p>
        </div>
      ) : (
        <p>Loading analytics...</p>
      )}

      <h3>Loyalty Programs</h3>
      {loyaltyPrograms.length === 0 ? (
        <p>No loyalty programs configured yet.</p>
      ) : (
        <ul>
          {loyaltyPrograms.map((program) => (
            <li key={program.id}>
              {program.rewardName} ({program.threshold} stamps) 
              {program.expiryDate && ` - Expires: ${new Date(program.expiryDate).toLocaleDateString()}`}
              <button onClick={() => setEditingProgram(program)}>Edit</button>
            </li>
          ))}
        </ul>
      )}

      {editingProgram ? (
        <LoyaltyProgramForm 
          merchantId={merchant.id} 
          existingProgram={editingProgram} 
          onProgramUpdated={handleProgramChange} 
        />
      ) : (
        <LoyaltyProgramForm 
          merchantId={merchant.id} 
          onProgramCreated={handleProgramChange} 
        />
      )}

      <IssueStampForm merchantId={merchant.id} onStampIssued={handleStampIssued} />
    </div>
  );
};

export default MerchantDashboard;