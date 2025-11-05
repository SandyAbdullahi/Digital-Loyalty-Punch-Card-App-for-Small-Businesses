import { Link, useLocation } from "react-router-dom";
import { Home01, Ticket02, QrCode02, Users01, Gift01, BarChartSquare02, Settings01 } from "@untitled-ui/icons-react";
import Logo from "./Logo";

type MenuItem = {
  name: string;
  path: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const menuItems: MenuItem[] = [
  { name: "Dashboard", path: "/dashboard", Icon: Home01 },
  { name: "Programs", path: "/dashboard", Icon: Ticket02 },
  { name: "QR Issuance", path: "/scan", Icon: QrCode02 },
  { name: "Customers", path: "/dashboard", Icon: Users01 },
  { name: "Rewards", path: "/rewards", Icon: Gift01 },
  { name: "Analytics", path: "/dashboard", Icon: BarChartSquare02 },
  { name: "Settings", path: "/profile", Icon: Settings01 },
];

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation();

  return (
    <div
      className={`fixed left-0 top-0 z-40 flex h-full w-60 flex-col bg-rudi-teal text-white transition-all duration-300 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-16 items-center justify-center border-b border-white/20">
        <Logo className="h-8 w-auto transform scale-[0.4]" />
        <span className="ml-2 text-lg font-bold">Rudi</span>
      </div>

      <nav className="flex flex-1 flex-col justify-center space-y-2 px-4">
        {menuItems.map(({ name, path, Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={name}
              to={path}
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? "bg-rudi-yellow text-rudi-maroon" : "text-white hover:bg-teal-500"
              }`}
            >
              <Icon width={18} height={18} strokeWidth={1.8} />
              <span className="ml-3">{name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

