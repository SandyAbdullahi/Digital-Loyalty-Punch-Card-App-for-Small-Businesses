import { useState } from 'react'
import './App.css'
import MerchantDashboardLayout from './components/MerchantDashboardLayout';
import MerchantSignup from './components/MerchantSignup'
import MerchantDashboard from './components/MerchantDashboard'
import CustomerAuth from './components/CustomerAuth'
import CustomerAppLayout from './components/CustomerAppLayout';
import CustomerApp from './components/CustomerApp'
import LandingPage from './components/LandingPage';

function App() {
  const [isMerchantLoggedIn, setIsMerchantLoggedIn] = useState(false); // Placeholder for merchant authentication
  const [merchantId, setMerchantId] = useState<string | null>(null); // New state for logged-in merchant ID
  const [customer, setCustomer] = useState<{ id: string; email: string } | null>(null); // Placeholder for customer authentication
  const [showMerchantSignup, setShowMerchantSignup] = useState(false); // New state to control merchant signup form visibility
  const [showLandingPage, setShowLandingPage] = useState(true); // New state to control landing page visibility
  const [showCustomerAuth, setShowCustomerAuth] = useState(false); // New state to control customer auth visibility

  const handleCustomerAuthSuccess = (customerData: { id: string; email: string }) => {
    setCustomer(customerData);
    setIsMerchantLoggedIn(false);
    setMerchantId(null);
    setShowMerchantSignup(false);
    setShowLandingPage(false);
    setShowCustomerAuth(false);
  };

  const handleMerchantLoginSuccess = (merchantData: { id: string; email: string }) => {
    setIsMerchantLoggedIn(true);
    setMerchantId(merchantData.id);
    setCustomer(null);
    setShowMerchantSignup(false);
    setShowLandingPage(false);
    setShowCustomerAuth(false);
  };

  const handleLoginClick = () => {
    setShowLandingPage(false);
    setShowCustomerAuth(true);
    setShowMerchantSignup(false);
  };

  const handleRegisterClick = () => {
    setShowLandingPage(false);
    setShowMerchantSignup(true);
    setShowCustomerAuth(false);
  };

  return (
    <>
      {showLandingPage ? (
        <LandingPage onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} />
      ) : isMerchantLoggedIn && merchantId ? (
        <MerchantDashboardLayout merchantId={merchantId}>
          <MerchantDashboard merchantId={merchantId} />
        </MerchantDashboardLayout>
      ) : customer ? (
        <CustomerAppLayout customerId={customer.id}>
          <CustomerApp customerId={customer.id} />
        </CustomerAppLayout>
      ) : showMerchantSignup ? (
        <MerchantSignup onAuthSuccess={handleMerchantLoginSuccess} />
      ) : showCustomerAuth ? (
        <CustomerAuth onAuthSuccess={handleCustomerAuthSuccess} />
      ) : (
        // Fallback if somehow no state is active, should ideally not happen
        <LandingPage onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} />
      )}
    </>
  )
}

export default App
