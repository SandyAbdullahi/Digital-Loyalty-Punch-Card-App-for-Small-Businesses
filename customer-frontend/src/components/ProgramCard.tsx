type ProgramCardProps = {
  id: string;
  merchantName: string;
  merchantAddress?: string;
  earned: number;
  threshold: number;
  actionLabel?: string;
  onAction?: () => void;
};

const ProgramCard = ({
  merchantName,
  merchantAddress,
  earned,
  threshold,
  actionLabel = 'View',
  onAction,
}: ProgramCardProps) => (
  <article className="rudi-card p-4 flex items-start gap-3">
    <div className="h-12 w-12 rounded-full bg-rudi-teal/10 text-rudi-teal flex items-center justify-center font-heading font-semibold uppercase">
      {merchantName.slice(0, 2)}
    </div>
    <div className="flex-1 space-y-2">
      <h3 className="font-heading text-lg font-semibold">{merchantName}</h3>
      {merchantAddress && <p className="text-sm text-rudi-maroon/70">{merchantAddress}</p>}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-rudi-maroon">{earned}</span>
        <div className="flex-1 h-2 bg-rudi-sand rounded-full overflow-hidden">
          <div
            className="h-full bg-rudi-teal transition-all duration-[180ms]"
            style={{ width: `${Math.min((earned / threshold) * 100, 100)}%` }}
          />
        </div>
        <span className="text-sm text-rudi-maroon/70">/{threshold}</span>
      </div>
    </div>
    <button
      type="button"
      onClick={onAction}
      className="rudi-btn rudi-btn--secondary px-4 text-sm whitespace-nowrap disabled:opacity-60"
    >
      {actionLabel}
    </button>
  </article>
);

export default ProgramCard;
