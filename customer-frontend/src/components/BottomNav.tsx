import { Link, useLocation } from 'react-router-dom';
import { Gift01, Home02, User01 } from '@untitled-ui/icons-react';
import type { ReactNode } from 'react';

interface NavItem {
  label: string;
  icon: ReactNode;
  to: string;
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    icon: <Home02 className="h-5 w-5" />,
    to: '/dashboard',
  },
  {
    label: 'Rewards',
    icon: <Gift01 className="h-5 w-5" />,
    to: '/rewards',
  },
  {
    label: 'Profile',
    icon: <User01 className="h-5 w-5" />,
    to: '/profile',
  },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-4 z-50 px-4">
      <div
        className="pointer-events-auto mx-auto flex max-w-md items-center justify-between rounded-3xl border bg-white/90 px-4 py-2 shadow-[0_15px_45px_-25px_rgba(0,0,0,0.45)] backdrop-blur"
        style={{
          borderColor: 'var(--rudi-input-border)',
          background: 'linear-gradient(135deg, rgba(0,150,136,0.12), rgba(255,179,0,0.08))',
        }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-1 rounded-2xl px-3 py-1 text-xs font-semibold transition"
              style={{
                color: isActive ? 'var(--rudi-secondary)' : 'var(--rudi-text)',
                backgroundColor: isActive ? 'rgba(0,150,136,0.12)' : 'transparent',
                boxShadow: isActive ? '0 10px 24px -16px rgba(0,0,0,0.35)' : 'none',
              }}
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 shadow-sm"
                style={{
                  border: `1px solid var(--rudi-input-border)`,
                  color: isActive ? 'var(--rudi-primary)' : 'var(--rudi-secondary)',
                }}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
