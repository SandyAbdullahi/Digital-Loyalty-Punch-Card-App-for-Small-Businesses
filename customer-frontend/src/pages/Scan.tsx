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
  const prefersReducedMotionRef = useRef(false);
  const confettiIntervalRef = useRef<number | null>(null);

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

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotionRef.current = mediaQuery.matches;

    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      prefersReducedMotionRef.current =
        'matches' in event ? event.matches : event.currentTarget?.matches ?? false;
    };

    if ('addEventListener' in mediaQuery) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (confettiIntervalRef.current) {
        window.clearInterval(confettiIntervalRef.current);
      }

      if ('removeEventListener' in mediaQuery) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-[var(--rudi-background)] text-[var(--rudi-text)] flex flex-col">
      <header className="px-4 pt-6 pb-4 flex items-center justify-between max-w-md mx-auto">
        <Button
          variant="subtle"
          size="sm"
          leftSection={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <h1 className="font-heading text-lg font-semibold">Scan QR</h1>
        <span aria-hidden="true" className="w-10" />
      </header>
      <section className="flex-1 px-4 pb-16 flex flex-col items-center justify-center gap-6 max-w-md mx-auto">
        <div className="relative w-full max-w-[286px] aspect-[3/4] rounded-[32px] bg-black overflow-hidden">
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
          <p className="text-sm text-[var(--rudi-text)]/70">
            We&apos;ll confirm your visit with the merchant automatically.
          </p>
        </div>
        {status !== 'idle' && (
          <Notification
            color={status === 'success' ? 'teal' : status === 'error' ? 'red' : 'blue'}
            loading={status === 'loading'}
            title=""
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
