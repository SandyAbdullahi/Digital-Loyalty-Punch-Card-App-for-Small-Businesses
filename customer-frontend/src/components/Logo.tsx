const Logo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const dimension = {
    sm: 'h-10 w-10 text-2xl',
    md: 'h-12 w-12 text-3xl',
    lg: 'h-16 w-16 text-4xl',
    xl: 'h-24 w-24 text-5xl',
  }[size];

  return (
    <div
      className={`flex items-center justify-center rounded-rudi bg-rudi-teal text-white font-heading font-bold ${dimension}`}
      aria-label="Rudi logo"
    >
      R
    </div>
  );
};

export default Logo;
