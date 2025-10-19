import { useState } from 'react'
import './App.css'
import MerchantSignup from './components/MerchantSignup'
import MerchantDashboard from './components/MerchantDashboard'
import CustomerAuth from './components/CustomerAuth'
import CustomerDashboard from './components/CustomerDashboard'

function App() {
  const [isMerchantLoggedIn, setIsMerchantLoggedIn] = useState(false); // Placeholder for merchant authentication
  const [customer, setCustomer] = useState<{ id: string; email: string } | null>(null); // Placeholder for customer authentication
  const [showMerchantSignup, setShowMerchantSignup] = useState(false); // New state to control merchant signup form visibility

  const handleCustomerAuthSuccess = (customerData: { id: string; email: string }) => {
    setCustomer(customerData);
    setIsMerchantLoggedIn(false); // Ensure merchant view is off when customer logs in
    setShowMerchantSignup(false); // Hide merchant signup if customer logs in
  };

  const handleMerchantLoginSuccess = () => {
    setIsMerchantLoggedIn(true);
    setCustomer(null); // Ensure customer view is off when merchant logs in
    setShowMerchantSignup(false); // Hide merchant signup if merchant logs in
  };

  return (
    <>
      <h1>Digital Loyalty App</h1>

      {/* Simple navigation/toggle for now */}
      <div>
        <button onClick={() => { setIsMerchantLoggedIn(true); setCustomer(null); setShowMerchantSignup(false); }}>Merchant View</button>
        <button onClick={() => { setIsMerchantLoggedIn(false); setCustomer(null); setShowMerchantSignup(false); }}>Customer View</button>
      </div>

      {isMerchantLoggedIn ? (
        <MerchantDashboard />
      ) : customer ? (
        <CustomerDashboard customerId={customer.id} />
      ) : showMerchantSignup ? (
        <MerchantSignup onSignupSuccess={handleMerchantLoginSuccess} />
      ) : (
        // Default view when neither is logged in and not in merchant signup mode
        <>
          <CustomerAuth onAuthSuccess={handleCustomerAuthSuccess} />
          <p>Are you a merchant? <button onClick={() => setShowMerchantSignup(true)}>Sign Up Here</button></p>
        </>
      )}
    </>
  )
}

export default App
