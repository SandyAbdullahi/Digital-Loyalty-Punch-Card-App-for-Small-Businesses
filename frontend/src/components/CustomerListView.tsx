import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface CustomerListViewProps {
  merchantId: string;
}

interface Customer {
  id: string;
  name: string; // Assuming customer has a name, or use email/ID
  email: string;
}

const CustomerListView: React.FC<CustomerListViewProps> = ({ merchantId }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/merchants/${merchantId}/customers`);
        setCustomers(response.data);
      } catch (err) {
        setError('Failed to fetch customer list.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (merchantId) {
      fetchCustomers();
    }
  }, [merchantId]);

  if (loading) {
    return <div>Loading customers...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div>
      <h3>Your Customers</h3>
      {customers.length === 0 ? (
        <p>No customers have joined your loyalty programs yet.</p>
      ) : (
        <ul>
          {customers.map((customer) => (
            <li key={customer.id}>{customer.name || customer.email}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomerListView;
