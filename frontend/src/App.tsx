import { useState } from 'react'
import './App.css'
import MerchantDashboardLayout from './components/MerchantDashboardLayout';
import MerchantSignup from './components/MerchantSignup'
import MerchantDashboard from './components/MerchantDashboard'
import CustomerAuth from './components/CustomerAuth'
import CustomerAppLayout from './components/CustomerAppLayout';
import CustomerApp from './components/CustomerApp'
import LandingPage from './components/LandingPage';
import AppNavbar from './components/AppNavbar';

function App() {
  const [isMerchantLoggedIn, setIsMerchantLoggedIn] = useState(false);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [customer, setCustomer] = useState<{ id: string; email: string } | null>(null);
  const [showMerchantSignup, setShowMerchantSignup] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [showCustomerAuth, setShowCustomerAuth] = useState(false);

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

  const handleLogout = () => {
    setIsMerchantLoggedIn(false);
    setMerchantId(null);
    setCustomer(null);
    setShowLandingPage(true);
    setShowCustomerAuth(false);
    setShowMerchantSignup(false);
  };

  const renderContent = () => {
    if (showLandingPage) {
      return <LandingPage onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} />;
    } else if (isMerchantLoggedIn && merchantId) {
      return (
        <MerchantDashboardLayout merchantId={merchantId} onLogoutClick={handleLogout}>
          <MerchantDashboard merchantId={merchantId} />
        </MerchantDashboardLayout>
      );
    } else if (customer) {
      return (
        <CustomerAppLayout customerId={customer.id} onLogoutClick={handleLogout}>
          <CustomerApp customerId={customer.id} />
        </CustomerAppLayout>
      );
    } else if (showMerchantSignup) {
      return <MerchantSignup onAuthSuccess={handleMerchantLoginSuccess} />;
    } else if (showCustomerAuth) {
      return <CustomerAuth onAuthSuccess={handleCustomerAuthSuccess} />;
    } else {
      // Fallback to landing page if no specific state is active
      return <LandingPage onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} />;
    }
  };

  return (
    <>
      {renderContent()}
    </>
  )
}

export default App
