import { useState } from 'react'
import './App.css'
import MerchantSignup from './components/MerchantSignup'
import MerchantDashboard from './components/MerchantDashboard'
import CustomerAuth from './components/CustomerAuth'
import CustomerApp from './components/CustomerApp'

function App() {
  const [isMerchantLoggedIn, setIsMerchantLoggedIn] = useState(false); // Placeholder for merchant authentication
  const [merchantId, setMerchantId] = useState<string | null>(null); // New state for logged-in merchant ID
  const [customer, setCustomer] = useState<{ id: string; email: string } | null>(null); // Placeholder for customer authentication
  const [showMerchantSignup, setShowMerchantSignup] = useState(false); // New state to control merchant signup form visibility

  const handleCustomerAuthSuccess = (customerData: { id: string; email: string }) => {
    setCustomer(customerData);
    setIsMerchantLoggedIn(false); // Ensure merchant view is off when customer logs in
    setMerchantId(null); // Clear merchant ID
    setShowMerchantSignup(false); // Hide merchant signup if customer logs in
  };

  const handleMerchantLoginSuccess = (merchantData: { id: string; email: string }) => {
    setIsMerchantLoggedIn(true);
    setMerchantId(merchantData.id); // Set the logged-in merchant ID
    setCustomer(null); // Ensure customer view is off when merchant logs in
    setShowMerchantSignup(false); // Hide merchant signup if merchant logs in
  };

  return (
    <>


      {isMerchantLoggedIn && merchantId ? (
        <MerchantDashboard merchantId={merchantId} />
      ) : customer ? (
        <CustomerApp customerId={customer.id} />
      ) : showMerchantSignup ? (
        <MerchantSignup onAuthSuccess={handleMerchantLoginSuccess} />
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
