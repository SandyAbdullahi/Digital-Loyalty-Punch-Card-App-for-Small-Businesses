import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'qr-scanner';
import axios from 'axios';

const Scan = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const getLocation = (): Promise<{ lat: number; lng: number }> =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });

  const handleScan = async (token: string) => {
    setStatus('loading');
    setMessage('');
    try {
      const location = await getLocation();
      let endpoint = '/api/v1/qr/scan-join';
      if (token.includes('stamp')) endpoint = '/api/v1/qr/scan-stamp';
      else if (token.includes('redeem')) endpoint = '/api/v1/qr/scan-redeem';

      const response = await axios.post(endpoint, {
        token,
        lat: location.lat,
        lng: location.lng,
      });
      setMessage(response.data.message || 'Nice! Stamp added.');
      setStatus('success');
    } catch (error: any) {
      const detail = error?.response?.data?.detail ?? error?.message ?? 'We could not complete the scan.';
      setMessage(detail);
      setStatus('error');
      scannerRef.current?.start().catch(() => {});
    }
  };

  useEffect(() => {
    if (!videoRef.current) return;

    const qrScanner = new QrScanner(
      videoRef.current,
      (result) => {
        handleScan(result.data);
        qrScanner.stop();
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    scannerRef.current = qrScanner;
    qrScanner.start().catch((err) => {
      setStatus('error');
      setMessage(err?.message ?? 'Unable to access camera.');
    });

    return () => {
      qrScanner.stop();
      qrScanner.destroy();
    };
  }, []);

  return (
    <main className="min-h-screen bg-rudi-sand text-rudi-maroon flex flex-col">
      <header className="px-4 pt-6 pb-4 flex items-center justify-between max-w-md mx-auto">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rudi-link text-sm inline-flex items-center gap-2"
        >
          ← Back
        </button>
        <h1 className="font-heading text-lg font-semibold">Scan QR</h1>
        <span aria-hidden="true" className="w-10" />
      </header>
      <section className="flex-1 px-4 pb-10 flex flex-col items-center justify-center gap-6 max-w-md mx-auto">
        <div className="relative w-full max-w-md aspect-[3/4] rounded-[32px] bg-black overflow-hidden">
          <video ref={videoRef} className="h-full w-full object-cover opacity-80" />
          <div className="absolute inset-0 border-4 border-transparent">
            <div className="absolute top-6 left-6 w-14 h-14 border-4 border-rudi-teal rounded-tl-[32px]" />
            <div className="absolute top-6 right-6 w-14 h-14 border-4 border-rudi-teal rounded-tr-[32px]" />
            <div className="absolute bottom-6 left-6 w-14 h-14 border-4 border-rudi-teal rounded-bl-[32px]" />
            <div className="absolute bottom-6 right-6 w-14 h-14 border-4 border-rudi-teal rounded-br-[32px]" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="font-heading text-xl font-semibold">Align QR code within the frame</h2>
          <p className="text-sm text-rudi-maroon/70">We’ll confirm your visit with the merchant automatically.</p>
        </div>
        <div
          className={`px-4 py-3 rounded-xl text-sm font-medium ${
            status === 'success'
              ? 'bg-rudi-teal/10 text-rudi-teal'
              : status === 'error'
              ? 'bg-rudi-coral/10 text-rudi-coral'
              : 'text-rudi-maroon/70'
          }`}
          role="status"
        >
          {status === 'idle' && 'Ready to scan.'}
          {status === 'loading' && 'Processing your scan…'}
          {status !== 'idle' && status !== 'loading' && message}
        </div>
      </section>
    </main>
  );
};

export default Scan;
