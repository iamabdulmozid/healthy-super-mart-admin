// src/components/layout/Header.tsx
import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Bars3Icon, 
  ArrowLeftStartOnRectangleIcon,
  UserCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Get page title based on current route
  const getPageTitle = (): string => {
    const path = location.pathname;
    
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/orders') return 'Orders';
    if (path === '/products') return 'Products';
    if (path === '/categories') return 'Categories';
    if (path === '/users') return 'Users';
    if (path === '/reports') return 'Reports';
    if (path === '/pos') return 'Point of Sale';
    if (path.startsWith('/accounts')) {
      if (path === '/accounts/summary') return 'Day Summary';
      if (path === '/accounts/transactions') return 'Transactions';
      if (path === '/accounts/withdraw') return 'Withdraw';
      return 'Accounts';
    }
    
    return 'Healthy Super Mart';
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
    setIsUserMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <header className="sticky top-0 z-[1200] bg-white/95 border-b border-(--color-border) backdrop-blur-sm">
      <div className="px-4 md:px-6 lg:px-8 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left section - Menu buttons */}
          <div className="flex items-center gap-2">
            {/* Mobile hamburger */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Menu name - dynamic based on Selected menu */}
            <div className="flex flex-col">
              <h1 className="text-base sm:text-lg font-semibold text-neutral-900 leading-tight">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Right section - User menu */}
          {admin && (
            <div className="relative" ref={userMenuRef}>
              {/* User menu button */}
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
                aria-label="User menu"
              >
                <UserCircleIcon className="h-7 w-7 sm:h-8 sm:w-8 text-neutral-400" />
                <div className="hidden md:block text-sm text-left">
                  <p className="font-medium text-neutral-900">
                    {admin.firstName} {admin.lastName}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {admin.roles.map(role => role.name).join(', ')}
                  </p>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-neutral-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
                  {/* User info - shown on mobile in dropdown */}
                  <div className="md:hidden px-4 py-3 border-b border-neutral-200">
                    <p className="font-medium text-neutral-900 text-sm">
                      {admin.firstName} {admin.lastName}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {admin.roles.map(role => role.name).join(', ')}
                    </p>
                  </div>
                  
                  {/* Logout option */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
