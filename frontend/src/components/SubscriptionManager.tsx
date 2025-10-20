import React from 'react';

interface SubscriptionManagerProps {
  merchantId: string;
  currentPlan: string;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ merchantId, currentPlan }) => {
  const handleUpgradeClick = () => {
    alert('Navigate to subscription upgrade page (not yet implemented)');
    // In a real application, this would redirect to a payment/subscription management portal
  };

  return (
    <div>
      <h3>Subscription Plan</h3>
      <p>Your current plan: <strong>{currentPlan}</strong></p>
      <button onClick={handleUpgradeClick}>Upgrade / Manage Subscription</button>
    </div>
  );
};

export default SubscriptionManager;
