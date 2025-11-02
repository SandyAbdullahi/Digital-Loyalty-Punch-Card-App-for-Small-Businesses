import React from 'react';

type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

interface LogoProps {
  size?: LogoSize;
  className?: string;
  style?: React.CSSProperties;
}

const Logo = ({ size = 'md', className = '', style }: LogoProps) => {
  const dimension = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-5 w-5',
  }[size];

  return (
    <img
      src="/logo-1.png"
      alt="Rudi logo"
      className={`${dimension} object-contain ${className}`}
      style={style}
    />
  );
};

export default Logo;
