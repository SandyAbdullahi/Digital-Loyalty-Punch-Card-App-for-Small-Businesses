import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'qr-scanner';
import axios from 'axios';
import { Button, Notification } from '@mantine/core';
import confetti from 'canvas-confetti';
import { ArrowLeft } from '@untitled-ui/icons-react';
import { BottomNav } from '../components/BottomNav';

const Scan = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const prefersReducedMotionRef = useRef(false);
  const confettiIntervalRef = useRef<number | null>(null);
  const [cameraHint, setCameraHint] = useState<string | null>(null);

  const handleCloseNotification = () => {
    setShowNotification(false);
    setStatus('idle');
    setMessage('');
  };

  const fireConfetti = () => {
    if (prefersReducedMotionRef.current) {
      return;
    }

    const duration = 1400;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 32,
      spread: 360,
      ticks: 60,
      zIndex: 1000,
      gravity: 0.9,
      scalar: 0.9,
    };

    if (confettiIntervalRef.current) {
      window.clearInterval(confettiIntervalRef.current);
    }

    const intervalId = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        window.clearInterval(intervalId);
        confettiIntervalRef.current = null;
        return;
      }

      const particleCount = Math.round(40 * (timeLeft / duration));

      confetti({
        ...defaults,
        particleCount,
        origin: {
          x: Math.random(),
          y: Math.random() * 0.4 + 0.15,
        },
      });
    }, 180);

    confettiIntervalRef.current = intervalId;
  };

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
    setShowNotification(true);
    try {
      let location = null;
      try {
        location = await getLocation();
      } catch (locError) {
        console.warn('Location not available', locError);
      }

      const payload: Record<string, unknown> = { token };
      if (location) {
        payload.lat = location.lat;
        payload.lng = location.lng;
      }

      const response = await axios.post('/api/v1/qr/scan', payload);
      const successMessage = response.data.message || 'Nice! Action completed.';
      setMessage(successMessage);
      setStatus('success');
      setShowNotification(true);

      const normalizedMessage = successMessage.toLowerCase();
      const isEarned =
        normalizedMessage.includes('stamp') ||
        normalizedMessage.includes('joined') ||
        normalizedMessage.includes('earned') ||
        normalizedMessage.includes('reward');

      if (isEarned) {
        fireConfetti();
        window.setTimeout(() => navigate('/dashboard'), 1400);
      } else {
        window.setTimeout(() => navigate('/dashboard'), 800);
      }
    } catch (error: any) {
      const detail = error?.response?.data?.detail ?? error?.message ?? 'We could not complete the scan.';
      setMessage(detail);
      setStatus('error');
      scannerRef.current?.start().catch(() => {});

      // Auto-hide error messages after 5 seconds
      setTimeout(() => {
        setShowNotification(false);
        setStatus('idle');
        setMessage('');
      }, 5000);
    }
  };

  useEffect(() => {
    if (!videoRef.current) return;

    const isCapacitor = typeof window !== 'undefined' && !!(window as any).Capacitor;

    if (typeof window !== 'undefined') {
      if (!window.isSecureContext && !isCapacitor) {
        setCameraHint(
          'Camera access is blocked on this connection. Most mobile browsers only allow scanning over HTTPS or localhost.'
        );
      } else if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraHint('This browser does not support camera access for QR scanning.');
      } else {
        setCameraHint(null);
      }
    }

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia ||
      (!window.isSecureContext && !isCapacitor)
    ) {
      setStatus('error');
      setMessage(
        'We could not access your camera. On the web, use a secure (https) connection. In the Rudi app, please ensure camera permission is granted.'
      );
      setShowNotification(true);
      return;
    }

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
      setShowNotification(true);
    });

    return () => {
      qrScanner.stop();
      qrScanner.destroy();
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotionRef.current = mediaQuery.matches;

    const handleChange = (event: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = event.matches;
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (confettiIntervalRef.current) {
        window.clearInterval(confettiIntervalRef.current);
      }

      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handleChange);
      } else if (typeof mediaQuery.removeListener === 'function') {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[var(--rudi-background)] to-rudi-coolblue/10 text-[var(--rudi-text)] flex flex-col">
      <header className="px-4 pt-6 pb-4 flex items-center justify-between max-w-md mx-auto">
        <Button
          variant="subtle"
          size="sm"
          leftSection={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <h1 className="font-heading text-lg font-semibold text-rudi-coolblue">Scan QR</h1>
        <span aria-hidden="true" className="w-10" />
      </header>
      <section className="flex-1 px-4 pb-16 flex flex-col items-center justify-center gap-6 max-w-md mx-auto">
        <div className="relative w-full max-w-[286px] aspect-[3/4] rounded-[32px] bg-black overflow-hidden">
          <video
            ref={videoRef}
            className="h-full w-full object-cover opacity-80"
            playsInline
            muted
          />
          <div className="absolute inset-0 border-4 border-transparent">
            <div className="absolute top-6 left-6 w-14 h-14 border-4 border-rudi-coolblue rounded-tl-[32px]" />
            <div className="absolute top-6 right-6 w-14 h-14 border-4 border-rudi-coolblue rounded-tr-[32px]" />
            <div className="absolute bottom-6 left-6 w-14 h-14 border-4 border-rudi-coolblue rounded-bl-[32px]" />
            <div className="absolute bottom-6 right-6 w-14 h-14 border-4 border-rudi-coolblue rounded-br-[32px]" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="font-heading text-xl font-semibold text-rudi-coolblue">Align QR code within the frame</h2>
          <p className="text-sm text-[var(--rudi-text)]/70">
            We&apos;ll confirm your visit with the merchant automatically.
          </p>
          {cameraHint && (
            <p className="text-xs text-red-500 mt-1 px-4">
              {cameraHint}
            </p>
          )}
        </div>
        {showNotification && status !== 'idle' && (
          <Notification
            color={status === 'success' ? 'teal' : status === 'error' ? 'red' : 'blue'}
            loading={status === 'loading'}
            title=""
            onClose={status === 'error' ? handleCloseNotification : undefined}
            withCloseButton={status === 'error'}
          >
            {status === 'loading' ? 'Processing your scan...' : message}
          </Notification>
        )}
      </section>
      <BottomNav />
    </main>
  );
};

export default Scan;
