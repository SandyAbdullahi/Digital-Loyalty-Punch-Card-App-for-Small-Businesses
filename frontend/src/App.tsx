import { useState } from 'react'
import './App.css'
import MerchantSignup from './components/MerchantSignup'
import MerchantDashboard from './components/MerchantDashboard'
import CustomerAuth from './components/CustomerAuth'
import CustomerDashboard from './components/CustomerDashboard'

function App() {
  const [isMerchantLoggedIn, setIsMerchantLoggedIn] = useState(false); // Placeholder for merchant authentication
  const [customer, setCustomer] = useState<{ id: string; email: string } | null>(null); // Placeholder for customer authentication

  const handleCustomerAuthSuccess = (customerData: { id: string; email: string }) => {
    setCustomer(customerData);
  };

  return (
    <>
      <h1>Digital Loyalty App</h1>

      {/* Simple navigation/toggle for now */}
      <div>
        <button onClick={() => { setIsMerchantLoggedIn(true); setCustomer(null); }}>Merchant View</button>
        <button onClick={() => { setIsMerchantLoggedIn(false); setCustomer(null); }}>Customer View</button>
      </div>

      {isMerchantLoggedIn ? (
        isMerchantLoggedIn ? <MerchantDashboard /> : <MerchantSignup /> // Merchant signup/dashboard
      ) : (
        customer ? (
          <CustomerDashboard customerId={customer.id} />
        ) : (
          <CustomerAuth onAuthSuccess={handleCustomerAuthSuccess} />
        )
      )}
    </>
  )
}

export default App
