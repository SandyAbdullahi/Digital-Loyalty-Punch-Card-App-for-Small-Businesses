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
  const [merchantAuthMode, setMerchantAuthMode] = useState<'login' | 'register' | null>(null);
  const [customerAuthMode, setCustomerAuthMode] = useState<'login' | 'register' | null>(null);
  const [showLandingPage, setShowLandingPage] = useState(true);

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
    setMerchantAuthMode(null);
    setCustomerAuthMode(null);
    setShowLandingPage(false);
  };

  const handleMerchantLoginSuccess = (merchantData: { id: string; email: string }) => {
    localStorage.setItem('merchantToken', 'some-merchant-token'); // Replace with actual token
    localStorage.setItem('merchantId', merchantData.id);
    setIsMerchantLoggedIn(true);
    setMerchantId(merchantData.id);
    setCustomer(null);
    setMerchantAuthMode(null);
    setCustomerAuthMode(null);
    setShowLandingPage(false);
  };

  const showMerchantLogin = () => {
    setShowLandingPage(false);
    setCustomerAuthMode(null);
    setMerchantAuthMode('login');
  };

  const showMerchantRegister = () => {
    setShowLandingPage(false);
    setCustomerAuthMode(null);
    setMerchantAuthMode('register');
  };

  const showCustomerLogin = () => {
    setShowLandingPage(false);
    setMerchantAuthMode(null);
    setCustomerAuthMode('login');
  };

  const showCustomerRegister = () => {
    setShowLandingPage(false);
    setMerchantAuthMode(null);
    setCustomerAuthMode('register');
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
    setMerchantAuthMode(null);
    setCustomerAuthMode(null);
    setShowLandingPage(true);
  };

  const handleHomeClick = () => {
    setShowLandingPage(true);
    setMerchantAuthMode(null);
    setCustomerAuthMode(null);
  };

  const renderContent = () => {
    if (showLandingPage) {
      return <LandingPage onLoginClick={showCustomerLogin} onRegisterClick={showMerchantRegister} onHomeClick={handleHomeClick} />;
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
    } else if (merchantAuthMode) {
      return <MerchantSignup onAuthSuccess={handleMerchantLoginSuccess} onLoginClick={showCustomerLogin} onRegisterClick={showMerchantRegister} onHomeClick={handleHomeClick} initialIsRegistering={merchantAuthMode === 'register'} />;
    } else if (customerAuthMode) {
      return <CustomerAuth onAuthSuccess={handleCustomerAuthSuccess} onLoginClick={showCustomerLogin} onRegisterClick={showMerchantLogin} onHomeClick={handleHomeClick} initialIsRegistering={customerAuthMode === 'register'} />;
    } else {
      // Fallback to landing page if no specific state is active
      return <LandingPage onLoginClick={showCustomerLogin} onRegisterClick={showMerchantRegister} onHomeClick={handleHomeClick} />;
    }
  };

  return (
    <>
      {renderContent()}
    </>
  )
}

export default App
