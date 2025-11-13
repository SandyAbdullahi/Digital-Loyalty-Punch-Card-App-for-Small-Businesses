import { useState } from 'react';
import { Alert, Button, Progress, Text, TextInput } from '@mantine/core';
import axios from 'axios';

type StaffStampPanelProps = {
  enrollmentId: string;
  onStampIssued?: () => void;
};

type StampResponse = {
  reward?: {
    status: 'inactive' | 'redeemable' | 'redeemed' | 'expired';
    voucher_code?: string;
    redeem_expires_at?: string;
  };
  stampsInCycle?: number;
  stampsRequired?: number;
};

const StaffStampPanel = ({ enrollmentId, onStampIssued }: StaffStampPanelProps) => {
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<StampResponse['reward']['status']>('inactive');
  const [stampsInCycle, setStampsInCycle] = useState<number>(0);
  const [stampsRequired, setStampsRequired] = useState<number>(0);
  const [voucherCode, setVoucherCode] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const progress =
    stampsRequired > 0 ? Math.min((stampsInCycle / stampsRequired) * 100, 100) : 0;

  const handleIssueStamp = async () => {
    if (!txId || !enrollmentId) return;
    setLoading(true);
    setFeedback(null);
    setError(null);
    try {
      const { data } = await axios.post<StampResponse>(
        `/api/v1/enrollments/${enrollmentId}/stamps`,
        { tx_id: txId }
      );
      setTxId('');
      setStampsInCycle(data.stampsInCycle ?? 0);
      setStampsRequired(data.stampsRequired ?? 0);
      const nextStatus = data.reward?.status ?? 'inactive';
      setStatus(nextStatus);
      setVoucherCode(data.reward?.voucher_code ?? null);
      setFeedback(
        nextStatus === 'redeemable'
          ? 'Reward ready! Ask the customer to show their voucher.'
          : 'Stamp issued successfully.'
      );
      onStampIssued?.();
    } catch (err: any) {
      console.error('Error issuing stamp:', err);
      setError(err?.response?.data?.detail ?? 'Failed to issue stamp.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTx = () => {
    setTxId(crypto.randomUUID());
  };

  return (
    <div className="rounded-3xl border border-rudi-teal/20 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <Text size="lg" fw={600}>
            Issue Stamp
          </Text>
          <Text size="sm" c="dimmed">
            Scan a customer QR or type the enrollment ID, then log their visit.
          </Text>
        </div>
        <Button variant="light" onClick={handleGenerateTx}>
          Generate TX
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        <TextInput
          label="Transaction ID"
          description="Use a unique value per visit"
          value={txId}
          onChange={(e) => setTxId(e.currentTarget.value)}
          placeholder="e.g. POS-923423"
        />

        <Button fullWidth loading={loading} disabled={!txId} onClick={handleIssueStamp}>
          Log Visit
        </Button>
      </div>

      {stampsRequired > 0 && (
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-rudi-maroon/70">
            <span>Cycle progress</span>
            <span>
              {stampsInCycle}/{stampsRequired}
            </span>
          </div>
          <Progress value={progress} radius="xl" size="lg" color="teal" />
        </div>
      )}

      {voucherCode && status === 'redeemable' && (
        <Alert mt="md" color="teal" title="Reward unlocked">
          Voucher code: <strong>{voucherCode}</strong>. Ask the customer to present it in
          store before redeeming.
        </Alert>
      )}

      {feedback && (
        <Alert mt="md" color="green">
          {feedback}
        </Alert>
      )}
      {error && (
        <Alert mt="md" color="red">
          {error}
        </Alert>
      )}
    </div>
  );
};

export default StaffStampPanel;
