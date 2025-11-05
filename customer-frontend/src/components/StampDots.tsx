

type StampDotsProps = {
  threshold: number;
  earned: number;
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
};

const sizeStyles: Record<Required<StampDotsProps>['size'], string> = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-6 w-6',
};

const getIconComponent = (iconName?: string) => {
  switch (iconName) {
    case 'star':
      return '⭐';
    case 'heart':
      return '❤️';
    case 'coffee':
      return '☕';
    case 'pizza':
      return '🍕';
    case 'burger':
      return '🍔';
    case 'icecream':
      return '🍦';
    case 'cake':
      return '🍰';
    case 'beer':
      return '🍺';
    case 'donut':
      return '🍩';
    case 'default':
    case '':
      return null;
    default:
      return null;
  }
};

const StampDots = ({ threshold, earned, size = 'md', icon }: StampDotsProps) => {
  const IconComponent = getIconComponent(icon);

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.min(earned, threshold)}
      aria-valuemax={threshold}
      aria-label="Reward progress"
      className="flex items-center gap-1"
    >
      {Array.from({ length: threshold }, (_, index) => {
        const isFilled = index < earned;
        if (IconComponent && isFilled) {
          return (
            <div
              key={index}
              className={`transition-transform duration-[180ms] ease-out ${sizeStyles[size]} flex items-center justify-center text-[var(--rudi-primary)] scale-100`}
              style={{ animationDelay: `${index * 40}ms` }}
            >
              {IconComponent}
            </div>
          );
        } else {
          const base = 'rounded-full transition-transform duration-[180ms] ease-out';
          const stateClass = isFilled ? 'bg-[var(--rudi-primary)] scale-100' : 'bg-[var(--rudi-background)] border border-[var(--rudi-primary)] scale-90';
          return (
            <span
              key={index}
              className={`${base} ${sizeStyles[size]} ${stateClass}`}
              style={{ animationDelay: `${index * 40}ms` }}
            />
          );
        }
      })}
    </div>
  );
};

export default StampDots;
