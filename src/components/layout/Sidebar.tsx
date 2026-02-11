// src/components/layout/Sidebar.tsx
import { NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import type { ReactElement } from "react";
import DashboardIcon from "@/assets/icons/dashboard.svg?react";
import OrdersIcon from "@/assets/icons/orders.svg?react";
import ProductsIcon from "@/assets/icons/products.svg?react";
import POSIcon from "@/assets/icons/pos.svg?react";
import CategoriesIcon from "@/assets/icons/categories.svg?react";
import {
  ChartBarIcon,
  BanknotesIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";

// Tooltip component that renders with fixed positioning
function Tooltip({ children, text, show }: { children: React.ReactNode; text: string; show: boolean }) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isReady, setIsReady] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 8,
      });
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }, [show]);

  return (
    <div ref={triggerRef} className="relative">
      {children}
      {show && isReady && (
        <div
          className="fixed px-3 py-1.5 bg-neutral-900 text-white text-sm rounded-md whitespace-nowrap z-[9999] pointer-events-none shadow-lg -translate-y-1/2"
          style={{ top: `${position.top}px`, left: `${position.left}px` }}
        >
          {text}
        </div>
      )}
    </div>
  );
}

interface NavItem {
  path: string;
  label: string;
  icon: ReactElement;
  subItems?: NavItem[];
}

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export default function Sidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }: SidebarProps) {
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const closeAllMenus = () => {
    setOpenMenus([]);
  };

  const navItems: NavItem[] = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <DashboardIcon className="w-5 h-5" />,
    },
    {
      path: "/orders",
      label: "Orders",
      icon: <OrdersIcon className="w-5 h-5" />,
    },
    {
      path: "/products",
      label: "Products",
      icon: <ProductsIcon className="w-5 h-5" />,
    },
    {
      path: "/categories",
      label: "Categories",
      icon: <CategoriesIcon className="w-5 h-5" />,
    },
    {
      path: "/accounts",
      label: "Accounts",
      icon: <BanknotesIcon className="w-5 h-5" />,
      subItems: [
        {
          path: "/accounts/summary",
          label: "Day Summary",
          icon: <ChartBarIcon className="w-4 h-4" />,
        },
        {
          path: "/accounts/transactions",
          label: "Transactions",
          icon: <ChartBarIcon className="w-4 h-4" />,
        },
        {
          path: "/accounts/withdraw",
          label: "Withdraw",
          icon: <ChartBarIcon className="w-4 h-4" />,
        },
      ],
    },
    {
      path: "/reports",
      label: "Reports",
      icon: <ChartBarIcon className="w-5 h-5" />,
    },
    { path: "/pos", label: "POS", icon: <POSIcon className="w-5 h-5" /> },
  ];

  const renderNavItem = (item: NavItem) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isOpen = openMenus.includes(item.label);

    if (hasSubItems) {
      return (
        <Tooltip key={item.label} text={item.label} show={isCollapsed && hoveredItem === item.label}>
          <div
            onMouseEnter={() => setHoveredItem(item.label)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <button
              onClick={() => toggleMenu(item.label)}
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-all duration-200 text-neutral-600 hover:text-neutral-900 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex-shrink-0 text-neutral-500 transition-colors">
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
              </div>
              {!isCollapsed && (
                <span className="flex-shrink-0">
                  {isOpen ? (
                    <ChevronDownIcon className="w-4 h-4" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4" />
                  )}
                </span>
              )}
            </button>

            {isOpen && !isCollapsed && (
              <div className="ml-8 mt-1 space-y-1">
              {item.subItems!.map((subItem) => (
                <NavLink
                  key={subItem.path}
                  to={subItem.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                      isActive
                        ? "bg-primary-100 text-primary-700 font-semibold shadow-sm"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`flex-shrink-0 transition-colors ${
                        isActive ? "text-primary-600" : "text-neutral-400"
                      }`}>
                        {subItem.icon}
                      </span>
                      <span className="truncate">{subItem.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          )}
          </div>
        </Tooltip>
      );
    }

    return (
      <Tooltip key={item.path} text={item.label} show={isCollapsed && hoveredItem === item.path}>
        <div
          onMouseEnter={() => setHoveredItem(item.path)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <NavLink
            to={item.path}
            onClick={() => {
              closeAllMenus();
              onClose();
            }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-primary-100 text-primary-700 font-semibold shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`flex-shrink-0 transition-colors ${
                  isActive ? "text-primary-600" : "text-neutral-500"
                }`}>
                  {item.icon}
                </span>
                {!isCollapsed && <span className="font-medium truncate">{item.label}</span>}
              </>
            )}
          </NavLink>
        </div>
      </Tooltip>
    );
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen
          bg-white border-r border-(--color-border)
          transition-all duration-300 ease-smooth
          z-[1200]
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64
        `}
        style={{ zIndex: 'var(--z-fixed)' }}
      >
        <div className="flex flex-col h-full relative">
          {/* Desktop collapse button - positioned at top right edge aligned with Dashboard menu */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex absolute top-28 -right-4 z-[1300] w-8 h-8 items-center justify-center bg-white border border-(--color-border) rounded-full shadow-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-all duration-200"
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4" />
            )}
          </button>
          {/* Logo section */}
          <div className={`px-4 py-6 border-b border-(--color-border) transition-all ${
            isCollapsed ? 'px-3' : 'px-6'
          }`}>
            <div className="h-14 flex items-center justify-center">
              {isCollapsed ? (
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
              ) : (
                <div className="w-full">
                  <h2 className="text-xl font-bold text-neutral-900 whitespace-nowrap">
                    Healthy Super Mart
                  </h2>
                  <p className="text-sm text-neutral-500 mt-1 whitespace-nowrap">Admin Portal</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 overflow-y-auto overflow-x-visible scrollbar-thin py-4 ${
            isCollapsed ? 'px-3' : 'px-4'
          }`}>
            <div className="space-y-1">
              {navItems.map(renderNavItem)}
            </div>
          </nav>

          {/* Footer */}
          {!isCollapsed && (
            <div className="px-4 py-4 border-t border-(--color-border)">
              <p className="text-xs text-neutral-500 text-center">
                © 2026 Healthy Super Mart
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
