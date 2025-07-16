// ================================
// COMPONENTS/LAYOUT/HEADER.JS - Top Header with Hamburger Menu
// ================================
import React, { useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  BellIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import { authAPI } from "../../services/api";
import AgentStatusBadge from "./AgentStatusBadge";
import NotificationPanel from "./NotificationPanel";
import { Link, useNavigate } from "react-router-dom";
import useLogout from "../../hooks/useLogout";

const Header = ({ isConnected, setSideNav, sideNav }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: authAPI.getProfile,
  });

  const logOut = useLogout();
  const signOut = async () => {
    await logOut();
    navigate("/");
  };

  const toggleSidebar = () => {
    setSideNav(!sideNav);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            {/* Hamburger Menu Button - Only visible on mobile/tablet */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Toggle sidebar"
            >
              {sideNav ? (
                <XMarkIcon className="h-8 w-8" />
              ) : (
                <Bars3Icon className="h-8 w-8" />
              )}
            </button>

            <div className="flex items-center space-x-3">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Welcome,{" "}
                <span className="hidden sm:inline">
                  {profile?.data?.profile?.firstName || profile?.data?.username}
                </span>
                <span className="sm:hidden">
                  {
                    (
                      profile?.data?.profile?.firstName ||
                      profile?.data?.username
                    )?.split(" ")[0]
                  }
                </span>
              </h2>

              {/* Connection Status */}
              <div className="hidden sm:flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-400" : "bg-red-400"
                  }`}
                />
                <span className="text-sm text-gray-500">
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>

              {/* Mobile Connection Status - Just the dot */}
              <div className="sm:hidden">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isConnected ? "bg-green-400" : "bg-red-400"
                  }`}
                  title={isConnected ? "Connected" : "Disconnected"}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {profile?.data?.role === "agent" && <AgentStatusBadge />}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-500 relative"
              >
                <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              </button>

              {showNotifications && (
                <NotificationPanel
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </div>

            {/* User Menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-2 sm:space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <UserCircleIcon className="h-7 w-7 sm:h-8 sm:w-8 text-gray-400" />
                <span className="hidden md:block text-gray-700">
                  {profile?.data?.username}
                </span>
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/dashboard/system-settings"
                          className={`${
                            active ? "bg-gray-100" : ""
                          } block px-4 py-2 text-sm text-gray-700`}
                        >
                          Settings
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => {
                            signOut();
                          }}
                          className={`${
                            active ? "bg-gray-100" : ""
                          } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                        >
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
