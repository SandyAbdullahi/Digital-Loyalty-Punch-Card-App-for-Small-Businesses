import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface QrCodeGeneratorProps {
  loyaltyProgramId: string;
}

const QrCodeGenerator: React.FC<QrCodeGeneratorProps> = ({ loyaltyProgramId }) => {
  const [qrCodeLink, setQrCodeLink] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string>('');

  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/loyalty-programs/${loyaltyProgramId}/qrcode`);
        setQrCodeLink(response.data.qrCodeLink);
      } catch (err) {
        setError('Failed to fetch QR code.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (loyaltyProgramId) {
      fetchQrCode();
    }
  }, [loyaltyProgramId]);

  const handleCopyClick = () => {
    if (qrCodeLink) {
      navigator.clipboard.writeText(qrCodeLink)
        .then(() => {
          setCopySuccess('Copied!');
          setTimeout(() => setCopySuccess(''), 2000);
        })
        .catch(() => {
          setCopySuccess('Failed to copy!');
        });
    }
  };

  if (loading) {
    return <div>Loading QR code...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (!qrCodeLink) {
    return <div>No QR code available for this program.</div>;
  }

  return (
    <div>
      <h4>Loyalty Program QR Code</h4>
      <p>Share this link or QR code with your customers to join this loyalty program.</p>
      <div>
        <img src={qrCodeLink} alt="QR Code" style={{ maxWidth: '200px', height: 'auto' }} />
      </div>
      <p>
        <strong>Link:</strong> <a href={qrCodeLink} target="_blank" rel="noopener noreferrer">{qrCodeLink}</a>
        <button onClick={handleCopyClick} style={{ marginLeft: '10px' }}>Copy Link</button>
        {copySuccess && <span style={{ marginLeft: '10px', color: 'green' }}>{copySuccess}</span>}
      </p>
    </div>
  );
};

export default QrCodeGenerator;
