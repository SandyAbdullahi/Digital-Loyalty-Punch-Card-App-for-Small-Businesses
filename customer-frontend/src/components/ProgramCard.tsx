import StampDots from './StampDots';

type ProgramCardProps = {
  id: string;
  merchantName: string;
  programName: string;
  merchantAddress?: string;
  earned: number;
  threshold: number;
  actionLabel?: string;
  onAction?: () => void;
  onCardClick?: () => void;
  logoUrl?: string;
  stampIcon?: string;
};

const ProgramCard = ({
  merchantName,
  programName,
  merchantAddress,
  earned,
  threshold,
  actionLabel = 'View',
  onAction,
  onCardClick,
  logoUrl,
  stampIcon,
}: ProgramCardProps) => (
  <article
    className={`bg-white p-4 rounded-2xl shadow-md flex gap-3 items-start ${onCardClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
    onClick={onCardClick}
  >
    <div className="h-12 w-12 rounded-full bg-[var(--rudi-primary)]/10 text-[var(--rudi-primary)] flex items-center justify-center font-heading font-semibold overflow-hidden">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={merchantName}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="uppercase">{merchantName.slice(0, 2)}</span>
      )}
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-[var(--rudi-text)]">{programName}</h3>
      <p className="text-sm text-[var(--rudi-text)]/70">{merchantName}</p>
      {merchantAddress && (
        <p className="text-sm text-[var(--rudi-text)]/70">{merchantAddress}</p>
      )}
      <StampDots earned={earned} threshold={threshold} icon={stampIcon} />
    </div>
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onAction?.();
      }}
      className="h-8 px-3 rounded-lg bg-[var(--rudi-secondary)] text-white text-sm font-semibold hover:bg-[var(--rudi-secondary)]/90 transition-colors whitespace-nowrap"
    >
      {actionLabel}
    </button>
  </article>
);

export default ProgramCard;
