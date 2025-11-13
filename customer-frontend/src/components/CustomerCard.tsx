import { Clock, Gift } from 'lucide-react';

export type CustomerRewardStatus = 'inactive' | 'redeemable' | 'redeemed' | 'expired';

type CustomerCardProps = {
  programName: string;
  stampsRequired: number;
  stampsInCycle: number;
  status: CustomerRewardStatus;
  voucherCode?: string | null;
  redeemExpiresAt?: string | null;
};

const statusCopy: Record<CustomerRewardStatus, string> = {
  inactive: 'Keep scanning in store to unlock your reward.',
  redeemable: 'Show this code to staff to redeem in store.',
  redeemed: 'Reward redeemed. A new cycle will start automatically.',
  expired: 'Voucher expired. Earn more visits to unlock another reward.',
};

const CustomerCard = ({
  programName,
  stampsRequired,
  stampsInCycle,
  status,
  voucherCode,
  redeemExpiresAt,
}: CustomerCardProps) => {
  const safeRequired = Math.max(stampsRequired, 1);
  const progress = Math.min(stampsInCycle / safeRequired, 1);
  const expiresLabel = redeemExpiresAt
    ? new Date(redeemExpiresAt).toLocaleString()
    : null;

  return (
    <div className="rounded-3xl border border-[#FFE6C7] bg-[#FFF9F2] p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFE0B2]">
          <Gift className="h-6 w-6 text-[#8B5E34]" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[#B07A45]">Program</p>
          <h3 className="text-xl font-semibold text-[#2F1B00]">{programName}</h3>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium text-[#8B5E34]">
            {stampsInCycle} / {safeRequired} visits
          </p>
        <p
          className={`text-xs font-semibold uppercase tracking-wide ${
            status === 'inactive'
              ? 'text-[#C97B25]'
              : status === 'redeemable'
              ? 'text-[#0D9488]'
              : status === 'redeemed'
              ? 'text-[#1D4ED8]'
              : 'text-[#B91C1C]'
          }`}
        >
            {status}
          </p>
        </div>
        <div className="mt-2 h-2 rounded-full bg-[#FFE8D4]">
          <div
            className="h-full rounded-full bg-[#FF8C42] transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <p className="mt-4 text-sm text-[#5C3B21]">{statusCopy[status]}</p>

      {status === 'redeemable' && voucherCode && (
        <div className="mt-4 rounded-2xl border border-dashed border-[#FFB347] bg-white p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#B45309]">
            Voucher
          </p>
          <p className="mt-2 font-mono text-2xl tracking-[0.3em] text-[#1F2937]">
            {voucherCode}
          </p>
          {expiresLabel && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#FFF5EB] px-3 py-1 text-xs font-medium text-[#92400E]">
              <Clock className="h-3.5 w-3.5" />
              Valid until {expiresLabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerCard;
