import React, { useState } from 'react';
import axios from 'axios';

interface MerchantSearchProps {
  onMerchantSelected?: (merchantId: string) => void;
}

interface Merchant {
  id: string;
  businessName: string;
  businessType: string;
  location?: string;
}

const MerchantSearch: React.FC<MerchantSearchProps> = ({ onMerchantSelected }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setMerchants([]);

    try {
      // Assuming the backend endpoint for nearby merchants can also handle a general search term
      const response = await axios.get(`/api/merchants/nearby?location=${searchTerm}`);
      setMerchants(response.data);
    } catch (err) {
      setError('Failed to search for merchants.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Find Participating Merchants</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <input
          type="text"
          placeholder="Enter location or business name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {merchants.length > 0 && (
        <div>
          <h4>Results:</h4>
          <ul>
            {merchants.map((merchant) => (
              <li key={merchant.id}>
                {merchant.businessName} ({merchant.businessType}) - {merchant.location}
                {onMerchantSelected && (
                  <button onClick={() => onMerchantSelected(merchant.id)} style={{ marginLeft: '10px' }}>
                    View Loyalty Programs
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {merchants.length === 0 && !loading && searchTerm && <p>No merchants found for "{searchTerm}".</p>}
    </div>
  );
};

export default MerchantSearch;
