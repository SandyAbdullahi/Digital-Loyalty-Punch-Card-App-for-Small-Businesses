import { useState } from 'react';
import axios from 'axios';
import QrScanner from 'qr-scanner';
import { Button, Input, Label } from '@rudi/ui';
import { Loader2, Scan } from 'lucide-react';

const StampIssuance = () => {
  const [scanning, setScanning] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState('');
  const [txId, setTxId] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isIssuing, setIsIssuing] = useState(false);

  const showFeedback = (message: string) => {
    setFeedback(message);
    setTimeout(() => setFeedback(''), 3000);
  };

  const startScan = async () => {
    setScanning(true);
    try {
      const result = await QrScanner.scanImage();
      // Assume QR contains enrollmentId
      setEnrollmentId(result);
    } catch (error) {
      console.error('Scan failed', error);
      showFeedback('Scan failed. Try again.');
    } finally {
      setScanning(false);
    }
  };

  const issueStamp = async () => {
    if (!enrollmentId || !txId) return;
    setIsIssuing(true);
    try {
      const response = await axios.post(`/api/enrollments/${enrollmentId}/stamps`, {
        tx_id: txId,
        issued_by_staff_id: null, // Assume current user
      });
      showFeedback('Stamp issued successfully!');
      if (response.data.reward && response.data.reward.status === 'redeemable') {
        showFeedback('Reward available! Show customer the voucher.');
      }
    } catch (error) {
      console.error('Failed to issue stamp', error);
      showFeedback('Failed to issue stamp.');
    } finally {
      setIsIssuing(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="flex w-full max-w-3xl flex-col items-center gap-6 rounded-3xl bg-card p-8 text-center shadow-lg lg:p-12">
        <div className="space-y-2 animate-slide-up">
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            Issue Stamp
          </h1>
          <p className="text-sm text-muted-foreground">
            Scan customer's QR or enter enrollment ID to issue a stamp.
          </p>
        </div>

        <div className="grid w-full gap-4 text-left md:grid-cols-1">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Enrollment ID</Label>
            <Input
              value={enrollmentId}
              onChange={(e) => setEnrollmentId(e.target.value)}
              className="h-12 rounded-2xl border-border bg-background"
              placeholder="Scan or enter enrollment ID"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Transaction ID</Label>
            <Input
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              className="h-12 rounded-2xl border-border bg-background"
              placeholder="Unique TX ID"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            className="btn-secondary h-11 px-6"
            onClick={startScan}
            disabled={scanning}
          >
            {scanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning…
              </>
            ) : (
              <>
                <Scan className="mr-2 h-4 w-4" />
                Scan QR
              </>
            )}
          </Button>

          <Button
            className="btn-primary h-11 px-6"
            onClick={issueStamp}
            disabled={!enrollmentId || !txId || isIssuing}
          >
            {isIssuing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Issuing…
              </>
            ) : (
              'Issue Stamp'
            )}
          </Button>
        </div>

        {feedback && (
          <div className="rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold text-primary shadow-sm">
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
};

export default StampIssuance;