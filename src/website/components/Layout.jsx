// ================================
// COMPONENTS/LAYOUT/LAYOUT.JS - Responsive Main Layout
// ================================
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import useSocket from "../../hooks/useSocket";

const Layout = () => {
  const { isConnected } = useSocket();
  const [sideNav, setSideNav] = useState(false);


  // Close sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSideNav(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sideNav) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sideNav]);

  const date = new Date();
  const year = date.getFullYear();

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Sidebar */}
      <Sidebar sideNav={sideNav} setSideNav={setSideNav} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <Header
          isConnected={isConnected}
          sideNav={sideNav}
          setSideNav={setSideNav}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 py-4 px-6 ">
          <div className="">
            <Outlet />
          </div>
        </main>
        {/* <div className="p-4  border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          © {year} Call Center System
        </div>
      </div> */}
      </div>
    </div>
  );
};

export default Layout;
