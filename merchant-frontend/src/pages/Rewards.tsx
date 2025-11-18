import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import QrScanner from 'qr-scanner';
import { Button } from '@rudi/ui';
import { formatApiDate } from '../utils/date';
import { useWebSocket } from '../contexts/WebSocketContext';
import StaffRedeemModal from '../components/StaffRedeemModal';

type RewardStatus = 'redeemable' | 'redeemed' | 'expired' | 'inactive';

type RewardRecord = {
  id: string;
  program: string;
  customer: string;
  date: string;
  status: RewardStatus;
  amount?: string;
  code?: string;
  expiresAt?: string;
};

const pillStyles: Record<RewardStatus, string> = {
  redeemable: 'bg-rudi-yellow/20 text-rudi-yellow',
  redeemed: 'bg-rudi-teal/20 text-rudi-teal',
  expired: 'bg-rudi-coral/20 text-rudi-coral',
  inactive: 'bg-rudi-teal/10 text-rudi-maroon/70',
};

const Rewards = () => {
  const [rewards, setRewards] = useState<RewardRecord[]>([]);
  const [loadingCode, setLoadingCode] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [manualRedeemOpen, setManualRedeemOpen] = useState(false);
  const [redeemNotificationLoading, setRedeemNotificationLoading] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const { redeemNotifications, markRedeemNotificationAsRead, lastMessage } = useWebSocket();

  const fetchRewards = async () => {
    try {
      const response = await axios.get('/api/v1/merchants/rewards');
      if (Array.isArray(response.data)) {
        setRewards(
          response.data.map((reward: Record<string, unknown>) => ({
            id: String(reward.id ?? crypto.randomUUID()),
            program: String(reward.program ?? 'Program name'),
            customer: String(reward.customer ?? 'Guest'),
            date: reward.created_at ?? reward.date ?? null,
            status: (reward.status ?? 'claimed') as RewardStatus,
            amount: reward.amount,
            code: reward.code ? String(reward.code) : undefined,
            expiresAt: reward.expires_at ? String(reward.expires_at) : undefined,
          }))
        );
      }
    } catch (error) {
      console.error('Failed to fetch rewards', error);
      setRewards([]);
    }
  };

  const handleManualRedeemSuccess = async () => {
    await fetchRewards();
    setManualRedeemOpen(false);
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  useEffect(() => {
    if (!lastMessage || typeof lastMessage !== 'object') return;
    const type = (lastMessage as { type?: string }).type;
    if (type === 'redeem_request' || type === 'reward_redeemed') {
      fetchRewards();
    }
  }, [lastMessage]);

  const redeemCode = async (code: string) => {
    try {
      setLoadingCode(code);
      await axios.post('/api/v1/merchants/redeem-code', { code });
      await fetchRewards();
    } catch (error) {
      console.error('Failed to redeem code:', error);
    } finally {
      setLoadingCode(null);
    }
  };

  const confirmPendingRedeem = async (notificationId: string, rewardId: string, code: string) => {
    if (!rewardId) {
      console.warn('Missing reward id for notification, nothing to redeem');
      markRedeemNotificationAsRead(notificationId);
      return;
    }
    try {
      setRedeemNotificationLoading(notificationId);
      await axios.post(`/api/v1/merchants/rewards/${rewardId}/redeem`, {
        voucher_code: code,
      });
      markRedeemNotificationAsRead(notificationId);
      await fetchRewards();
    } catch (error) {
      console.error('Failed to confirm redeem request:', error);
      alert('Failed to confirm redeem. Please try again or scan the voucher QR.');
    } finally {
      setRedeemNotificationLoading((current) => (current === notificationId ? null : current));
    }
  };

  useEffect(() => {
    if (!lastMessage || typeof lastMessage !== 'object') return;
    if ((lastMessage as { type?: string }).type !== 'redeem_request') return;
    fetchRewards();
  }, [lastMessage]);

  const startScanning = async () => {
    if (!videoRef.current) return;

    setScanning(true);
    setScanError(null);

    try {
      const scanner = new QrScanner(
        videoRef.current,
        async (result) => {
          const code = result.data.trim();
          if (code) {
            stopScanning();
            await redeemCode(code);
          }
        },
        {
          onDecodeError: (err) => {
            console.error('QR decode error:', err);
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      scannerRef.current = scanner;
      await scanner.start();
    } catch (error) {
      console.error('Failed to start scanner:', error);
      setScanError('Failed to access camera. Please check permissions.');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setScanning(false);
    setScanError(null);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
      }
    };
  }, []);

  const hasPending = useMemo(
    () => rewards.some((reward) => reward.status === 'redeemable' && reward.code),
    [rewards]
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-3xl font-semibold text-rudi-maroon">Rewards</h1>
        <p className="text-sm text-rudi-maroon/70">
          Verify codes, confirm redemptions, and celebrate every reward.
        </p>
      </div>

      {/* Pending Redeem Notifications */}
      {redeemNotifications.filter(n => !n.read).length > 0 && (
        <div className="rounded-3xl bg-gradient-to-r from-rudi-yellow/10 to-rudi-teal/10 border border-rudi-yellow/20 p-6">
          <h2 className="font-heading text-xl font-semibold text-rudi-maroon mb-4">
            🔔 Pending Redeem Requests
          </h2>
          <div className="space-y-3">
            {redeemNotifications.filter(n => !n.read).map((notification) => (
              <div key={notification.id} className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
                <div className="flex-1">
                  <p className="font-semibold text-rudi-maroon">
                    {notification.customer_name} wants to redeem {notification.stamps_redeemed} stamps
                  </p>
                  <p className="text-sm text-rudi-maroon/70">
                    Program: {notification.program_name}
                  </p>
                  <p className="text-xs text-rudi-maroon/60 font-mono">
                    Code: {notification.code}
                  </p>
                </div>
                <Button
                  className="btn-primary h-8 px-3 text-xs"
                  onClick={() =>
                    confirmPendingRedeem(notification.id, notification.reward_id, notification.code)
                  }
                  disabled={redeemNotificationLoading === notification.id}
                >
                  {redeemNotificationLoading === notification.id ? 'Confirming...' : 'Mark redeemed'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Scanner */}
      {scanning && (
        <div className="rounded-3xl bg-white p-6 shadow-rudi-card">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold text-rudi-maroon">
                Scan Redeem QR Code
              </h2>
              <Button
                className="btn-secondary h-8 px-3 text-xs"
                onClick={stopScanning}
              >
                Cancel
              </Button>
            </div>
            {scanError && (
              <p className="text-sm text-rudi-coral">{scanError}</p>
            )}
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full max-w-md mx-auto rounded-lg border border-rudi-teal/20"
                playsInline
                muted
              />
              <div className="absolute inset-0 border-2 border-rudi-primary rounded-lg pointer-events-none" />
            </div>
            <p className="text-sm text-rudi-maroon/70 text-center">
              Point your camera at the customer's redeem QR code
            </p>
          </div>
        </div>
      )}

      {!scanning && (
        <div className="flex justify-center">
          <Button
            className="btn-primary"
            onClick={startScanning}
          >
            📱 Scan Redeem QR Code
          </Button>
        </div>
      )}

      {rewards.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-10 text-center shadow-rudi-card">
          <div className="h-20 w-20 rounded-full bg-rudi-yellow/30" />
          <h3 className="font-heading text-lg text-rudi-maroon">No rewards yet!</h3>
          <p className="text-sm text-rudi-maroon/70">
            Pending redemptions and completed rewards will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl bg-white shadow-rudi-card">
          <div className="grid grid-cols-6 gap-4 border-b border-rudi-teal/15 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-rudi-maroon/60 max-sm:hidden">
            <span>Program</span>
            <span>Customer</span>
            <span>Date</span>
            <span>Amount</span>
            <span>Status</span>
            <span>{hasPending ? 'Verify' : 'Actions'}</span>
          </div>
          <div className="divide-y divide-rudi-teal/10">
            {rewards.map((reward, index) => (
              <div
                key={reward.id}
                className="grid grid-cols-1 gap-4 px-6 py-5 text-sm text-rudi-maroon md:grid-cols-6 md:items-center animate-slide-up"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <div>
                  <span className="font-semibold">{reward.program}</span>
                  <p className="md:hidden text-xs text-rudi-maroon/60">{reward.customer}</p>
                  {reward.code && (
                    <p className="md:hidden font-mono text-xs text-rudi-maroon/70">
                      Code: {reward.code}
                    </p>
                  )}
                </div>
                <div className="hidden md:block">{reward.customer}</div>
                <div className="text-sm text-rudi-maroon/70">
                  {formatApiDate(reward.date, undefined, '—')}
                </div>
                <div className="font-semibold">{reward.amount || '1'}</div>
                <span
                  className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${pillStyles[reward.status]}`}
                >
                  {reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}
                </span>
                <div className="flex flex-col items-end gap-2 text-right">
                  {reward.status === 'redeemable' && reward.code ? (
                    <>
                      <span className="font-mono text-xs text-rudi-maroon/80">
                        Code: {reward.code}
                      </span>
                      {reward.expiresAt && (
                        <span className="text-[11px] text-rudi-maroon/60">
                          Expires at:{' '}
                          {formatApiDate(reward.expiresAt, {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                      <Button
                        className="btn-primary h-8 px-3 text-xs"
                        type="button"
                        onClick={() => redeemCode(reward.code!)}
                        disabled={loadingCode === reward.code}
                      >
                        {loadingCode === reward.code ? 'Confirming...' : 'Mark redeemed'}
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs text-rudi-teal">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <StaffRedeemModal
        opened={manualRedeemOpen}
        onClose={() => setManualRedeemOpen(false)}
        onRedeemed={handleManualRedeemSuccess}
      />
    </div>
  );
};

export default Rewards;

