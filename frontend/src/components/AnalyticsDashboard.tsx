import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AnalyticsDashboardProps {
  merchantId: string;
}

interface AnalyticsData {
  customersJoined: number;
  stampsIssued: number;
  rewardsRedeemed: number;
  // Add more detailed analytics data as needed
  loyaltyProgramStats?: {
    programId: string;
    programName: string;
    stampsIssued: number;
    rewardsRedeemed: number;
  }[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ merchantId }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/analytics/merchant/${merchantId}/detailed`); // Assuming a more detailed analytics endpoint
        setAnalytics(response.data);
      } catch (err) {
        setError('Failed to fetch analytics data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (merchantId) {
      fetchAnalytics();
    }
  }, [merchantId]);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (!analytics) {
    return <div>No analytics data available.</div>;
  }

  return (
    <div>
      <h3>Detailed Analytics</h3>
      <p>Total Customers Joined: {analytics.customersJoined}</p>
      <p>Total Stamps Issued: {analytics.stampsIssued}</p>
      <p>Total Rewards Redeemed: {analytics.rewardsRedeemed}</p>

      {analytics.loyaltyProgramStats && analytics.loyaltyProgramStats.length > 0 && (
        <div>
          <h4>Loyalty Program Breakdown</h4>
          <ul>
            {analytics.loyaltyProgramStats.map((program) => (
              <li key={program.programId}>
                <strong>{program.programName}:</strong> Stamps Issued: {program.stampsIssued}, Rewards Redeemed: {program.rewardsRedeemed}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
