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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 z-50">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.5rem',
                color: isActive ? 'var(--rudi-primary)' : 'var(--rudi-text)',
              }}
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isActive ? 'rgba(0, 200, 150, 0.12)' : 'transparent',
                }}
              >
                {item.icon}
              </span>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
