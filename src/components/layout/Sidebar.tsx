// src/components/layout/Sidebar.tsx
import { NavLink } from "react-router-dom";
import { useState } from "react";
import type { ReactElement } from "react";
import DashboardIcon from "@/assets/icons/dashboard.svg?react";
import OrdersIcon from "@/assets/icons/orders.svg?react";
import ProductsIcon from "@/assets/icons/products.svg?react";
// import UsersIcon from "@/assets/icons/users.svg?react";
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

export default function Sidebar() {
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
    // { path: "/users", label: "Users", icon: <UsersIcon className="w-5 h-5" /> },
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
            className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800"
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.label}</span>
            </div>
            {isOpen ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )}
          </button>

          {isOpen && (
            <div className="ml-6 mt-1 space-y-1">
              {item.subItems!.map((subItem) => (
                <NavLink
                  key={subItem.path}
                  to={subItem.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm ${
                      isActive
                        ? "bg-primary-50 text-primary-600 font-medium border-1 border-primary-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`
                  }
                >
                  {subItem.icon}
                  <span>{subItem.label}</span>
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
        onClick={() => setOpenMenus([])}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
            isActive
              ? "bg-primary-50 text-primary-600 font-medium border-1 border-primary-600"
              : "text-gray-600 hover:text-gray-800"
          }`
        }
      >
        {item.icon}
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <aside className="w-60 bg-white text-gray-600 min-h-screen p-4 space-y-4 shadow-sm">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800">Grocery POS</h2>
        <p className="text-sm text-gray-500">Admin Panel</p>
      </div>
      <nav className="flex flex-col gap-2">{navItems.map(renderNavItem)}</nav>
    </aside>
  );
}
