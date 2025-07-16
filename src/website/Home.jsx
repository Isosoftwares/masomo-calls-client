// ================================
// WEBSITE/HOME.JS - Updated Home Page
// ================================
import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { analyticsAPI } from "../services/api";
import {
  PhoneIcon,
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const Home = () => {
  const { data: dashboardData } = useQuery({
    queryKey: ["dashboard", "24h"],
    queryFn: () => analyticsAPI.getDashboard({ period: "24h" }),
  });

  const quickStats = [
    {
      title: "Calls Today",
      value: dashboardData?.data?.calls?.totalCalls || 0,
      icon: PhoneIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Calls",
      value: dashboardData?.data?.calls?.activeCalls || 0,
      icon: PhoneIcon,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Available Agents",
      value: dashboardData?.data?.agents?.available || 0,
      icon: UsersIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Avg Wait Time",
      value: dashboardData?.data?.calls?.avgWaitTime
        ? `${Math.round(dashboardData.data.calls.avgWaitTime)}s`
        : "0s",
      icon: ClockIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const quickActions = [
    {
      title: "Make a Call",
      description: "Start an outbound call to a customer",
      href: "/dashboard/softphone",
      icon: PhoneIcon,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Call History",
      description: "See detailed analytics and metrics",
      href: "/dashboard/calls/history",
      icon: ChartBarIcon,
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "Manage Agents",
      description: "View and manage agent status",
      href: "/dashboard/agents",
      icon: UsersIcon,
      color: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  return (
    <div className="py-4 min-h-screen">
      <div className=" ">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Call Center Management
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your call center operations efficiently with real-time
            monitoring, intelligent call routing, and comprehensive analytics.
          </p>
        </div>

        {/* Quick Stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.title}
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {typeof stat.value === "number"
                          ? stat.value.toLocaleString()
                          : stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div> */}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div
                      className={`p-3 rounded-full text-white ${action.color}`}
                    >
                      <action.icon className="h-6 w-6" />
                    </div>
                    <ArrowRightIcon className="h-5 w-5 text-gray-400 ml-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {action.title}
                  </h3>
                  <p className="text-gray-600">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">System Status</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Service Status
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Call Routing</span>
                    <span className="flex items-center text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Voice Services
                    </span>
                    <span className="flex items-center text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Operational
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Quick Links
                </h3>
                <div className="space-y-2">
                  <Link
                    to="/dashboard/calls/history"
                    className="block text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Call History
                  </Link>

                  <Link
                    to="/dashboard/system-settings"
                    className="block text-sm text-blue-600 hover:text-blue-800"
                  >
                    System Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
