// ================================
// COMPONENTS/LAYOUT/SIDEBAR.JS - Responsive Navigation Sidebar
// ================================
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  HomeIcon,
  PhoneIcon,
  UsersIcon,
  QueueListIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  Cog6ToothIcon,
  ClockIcon,
  XMarkIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Home", href: "/dashboard", icon: HomeIcon },
  { name: "SoftPhone", href: "/dashboard/softphone", icon: PhoneIcon },
  { name: "Call History", href: "/dashboard/calls/history", icon: ClockIcon },
  { name: "Agents", href: "/dashboard/agents", icon: UsersIcon },
  {
    name: "Phone Numbers",
    href: "/dashboard/phone-numbers",
    icon: DevicePhoneMobileIcon,
  },
  {
    name: "System Settings",
    href: "/dashboard/system-settings",
    icon: Cog6ToothIcon,
  },
  { name: "Profile", href: "/dashboard/profile", icon: UserIcon },
];

const Sidebar = ({ setSideNav, sideNav }) => {
  const location = useLocation();

  const closeSidebar = () => {
    setSideNav(false);
  };

  const date = new Date();
  const year = date.getFullYear();

  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      {sideNav && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden z-20"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:z-auto
          ${sideNav ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-primary/50">
            <div className="text-center flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold">Call Center</h1>
              <p className="text-gray-400 text-xs sm:text-sm">
                Management System
              </p>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={closeSidebar}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <XMarkIcon className="h-7 w-7" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    // Close sidebar on mobile when navigating
                    if (window.innerWidth < 1024) {
                      closeSidebar();
                    }
                  }}
                  className={`
                    flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors duration-200 group
                    ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }
                  `}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            <div className="text-xs text-gray-400 text-center">
              © {year} Call Center System
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
