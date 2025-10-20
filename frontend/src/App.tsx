import { useState, useEffect } from 'react'
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

  useEffect(() => {
    const merchantToken = localStorage.getItem('merchantToken');
    const customerToken = localStorage.getItem('customerToken');
    const storedMerchantId = localStorage.getItem('merchantId');
    const storedCustomerId = localStorage.getItem('customerId');
    const storedCustomerEmail = localStorage.getItem('customerEmail');

    if (merchantToken && storedMerchantId) {
      setIsMerchantLoggedIn(true);
      setMerchantId(storedMerchantId);
      setShowLandingPage(false);
    } else if (customerToken && storedCustomerId && storedCustomerEmail) {
      setCustomer({ id: storedCustomerId, email: storedCustomerEmail });
      setShowLandingPage(false);
    } else {
      setShowLandingPage(true);
    }
  }, []);

  const handleCustomerAuthSuccess = (customerData: { id: string; email: string }) => {
    localStorage.setItem('customerToken', 'some-customer-token'); // Replace with actual token
    localStorage.setItem('customerId', customerData.id);
    localStorage.setItem('customerEmail', customerData.email);
    setCustomer(customerData);
    setIsMerchantLoggedIn(false);
    setMerchantId(null);
    setShowMerchantSignup(false);
    setShowLandingPage(false);
    setShowCustomerAuth(false);
  };

  const handleMerchantLoginSuccess = (merchantData: { id: string; email: string }) => {
    localStorage.setItem('merchantToken', 'some-merchant-token'); // Replace with actual token
    localStorage.setItem('merchantId', merchantData.id);
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
    localStorage.removeItem('merchantToken');
    localStorage.removeItem('customerToken');
    localStorage.removeItem('merchantId');
    localStorage.removeItem('customerId');
    localStorage.removeItem('customerEmail');
    setIsMerchantLoggedIn(false);
    setMerchantId(null);
    setCustomer(null);
    setShowLandingPage(true);
    setShowCustomerAuth(false);
    setShowMerchantSignup(false);
  };

  const handleHomeClick = () => {
    setShowLandingPage(true);
    setShowCustomerAuth(false);
    setShowMerchantSignup(false);
  };

  const renderContent = () => {
    if (showLandingPage) {
      return <LandingPage onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} onHomeClick={handleHomeClick} />;
    } else if (isMerchantLoggedIn && merchantId) {
      return (
        <MerchantDashboardLayout merchantId={merchantId} onLogoutClick={handleLogout} onHomeClick={handleHomeClick}>
          <MerchantDashboard merchantId={merchantId} />
        </MerchantDashboardLayout>
      );
    } else if (customer) {
      return (
        <CustomerAppLayout customerId={customer.id} onLogoutClick={handleLogout} onHomeClick={handleHomeClick}>
          <CustomerApp customerId={customer.id} />
        </CustomerAppLayout>
      );
    } else if (showMerchantSignup) {
      return <MerchantSignup onAuthSuccess={handleMerchantLoginSuccess} onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} onHomeClick={handleHomeClick} />;
    } else if (showCustomerAuth) {
      return <CustomerAuth onAuthSuccess={handleCustomerAuthSuccess} onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} onHomeClick={handleHomeClick} />;
    } else {
      // Fallback to landing page if no specific state is active
      return <LandingPage onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} onHomeClick={handleHomeClick} />;
    }
  };

  return (
    <>
      {renderContent()}
    </>
  )
}

export default App
