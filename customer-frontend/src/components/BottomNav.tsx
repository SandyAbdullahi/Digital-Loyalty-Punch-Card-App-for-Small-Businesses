import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  icon: string;
  to: string;
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    icon: '🏠',
    to: '/dashboard',
  },
  {
    label: 'Rewards',
    icon: '🎁',
    to: '/rewards',
  },
  {
    label: 'Profile',
    icon: '👤',
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
              className={`flex flex-col items-center py-1 px-3 rounded-lg ${
                isActive ? 'text-teal-600' : 'text-maroon-600'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
