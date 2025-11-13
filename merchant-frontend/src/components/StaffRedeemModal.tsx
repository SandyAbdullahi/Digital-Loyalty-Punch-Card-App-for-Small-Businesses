import { useState } from 'react';
import { Alert, Button, Modal, TextInput } from '@mantine/core';
import axios from 'axios';

type StaffRedeemModalProps = {
  opened: boolean;
  onClose: () => void;
  onRedeemed?: () => void;
};

const StaffRedeemModal = ({ opened, onClose, onRedeemed }: StaffRedeemModalProps) => {
  const [rewardId, setRewardId] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setRewardId('');
    setVoucherCode('');
  };

  const handleRedeem = async () => {
    if (!rewardId || !voucherCode) return;
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      await axios.post(`/api/v1/rewards/${rewardId}/redeem`, {
        voucher_code: voucherCode,
      });
      setMessage('Reward redeemed successfully.');
      onRedeemed?.();
      reset();
    } catch (err: any) {
      console.error('Manual redeem failed', err);
      setError(err?.response?.data?.detail ?? 'Unable to redeem reward.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setMessage(null);
    setError(null);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Manual voucher verification" centered>
      <div className="space-y-4">
        <TextInput
          label="Reward ID"
          description="Scan or paste the reward identifier from the customer QR"
          value={rewardId}
          onChange={(e) => setRewardId(e.currentTarget.value)}
          placeholder="e.g. 7d5a4f2e-..."
        />
        <TextInput
          label="Voucher code"
          description="Printed/typed code shown on customer device"
          value={voucherCode}
          onChange={(e) => setVoucherCode(e.currentTarget.value.toUpperCase())}
          placeholder="BASE32CODE"
        />
        <Button fullWidth loading={loading} disabled={!rewardId || !voucherCode} onClick={handleRedeem}>
          Confirm redemption
        </Button>
        {message && (
          <Alert color="green" title="Success">
            {message}
          </Alert>
        )}
        {error && (
          <Alert color="red" title="Error">
            {error}
          </Alert>
        )}
      </div>
    </Modal>
  );
};

export default StaffRedeemModal;
