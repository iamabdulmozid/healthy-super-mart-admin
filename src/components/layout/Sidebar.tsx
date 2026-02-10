// src/components/layout/Sidebar.tsx
import { NavLink } from "react-router-dom";
import { useState } from "react";
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
} from "@heroicons/react/24/outline";

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

export default function Sidebar({ isOpen, isCollapsed, onClose }: SidebarProps) {
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
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
        <div key={item.label}>
          <button
            onClick={() => toggleMenu(item.label)}
            className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-100 transition-all duration-200 text-neutral-600 hover:text-neutral-900 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex-shrink-0 text-neutral-500 group-hover:text-primary-600 transition-colors">
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
                    `flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-all duration-200 text-sm ${
                      isActive
                        ? "bg-primary-50 text-primary-700 font-semibold border-l-3 border-primary-600 pl-[11px]"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`
                  }
                >
                  <span className="flex-shrink-0">{subItem.icon}</span>
                  <span className="truncate">{subItem.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={onClose}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-100 transition-all duration-200 group ${
            isActive
              ? "bg-primary-50 text-primary-700 font-semibold border-l-3 border-primary-600 pl-[11px]"
              : "text-neutral-600 hover:text-neutral-900"
          }`
        }
      >
        <span className={`flex-shrink-0 transition-colors ${
          isCollapsed ? 'text-neutral-500 group-hover:text-primary-600' : ''
        }`}>
          {item.icon}
        </span>
        {!isCollapsed && <span className="font-medium truncate">{item.label}</span>}
      </NavLink>
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
        <div className="flex flex-col h-full">
          {/* Logo section */}
          <div className={`px-4 py-6 border-b border-(--color-border) transition-all ${
            isCollapsed ? 'px-3' : 'px-6'
          }`}>
            {isCollapsed ? (
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-neutral-900">
                  Healthy Mart
                </h2>
                <p className="text-sm text-neutral-500 mt-1">Admin Portal</p>
              </>
            )}
          </div>

          {/* Navigation */}
          <nav className={`flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin py-4 ${
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
