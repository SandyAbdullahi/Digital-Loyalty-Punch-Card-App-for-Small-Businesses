type StampDotsProps = {
  threshold: number;
  earned: number;
  size?: 'sm' | 'md' | 'lg';
};

const sizeStyles: Record<Required<StampDotsProps>['size'], string> = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-6 w-6',
};

const StampDots = ({ threshold, earned, size = 'md' }: StampDotsProps) => {
  const dots = Array.from({ length: threshold }, (_, index) => index < earned);

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.min(earned, threshold)}
      aria-valuemax={threshold}
      aria-label="Reward progress"
      className="flex items-center gap-1"
    >
      {dots.map((isFilled, index) => {
        const base = 'rounded-full transition-transform duration-[180ms] ease-out';
        const stateClass = isFilled ? 'bg-rudi-teal scale-100' : 'bg-rudi-sand border border-rudi-teal scale-90';
        return (
          <span
            key={index}
            className={`${base} ${sizeStyles[size]} ${stateClass}`}
            style={{ animationDelay: `${index * 40}ms` }}
          />
        );
      })}
    </div>
  );
};

export default StampDots;
