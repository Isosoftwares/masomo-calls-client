// ================================
// UPDATED APP.JS - Main Application with All Routes
// ================================
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
import PersistLogin from "./components/PersistLogin";
import RequireAuth from "./components/RequireAuth";
import F404Page from "./F404Page";
import Login from "./Login";
import Unauthorized from "./Unauthorized";

// Main Pages
import Home from "./website/Home";
import Dashboard from "./pages/Dashboard";
import CallManagement from "./pages/CallManagement";
import CallHistory from "./pages/CallHistory";
import AgentManagement from "./pages/AgentManagement";
import QueueManagement from "./pages/QueueManagement";
import Analytics from "./pages/Analytics";
import PhoneNumbers from "./pages/PhoneNumbers";
import Settings from "./pages/Settings";

// Layout
import Layout from "./components/Layout/Layout";

import useScrollToTop from "./components/useScrollToTop";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  });
  
  const location = useLocation();
  useScrollToTop();

  return (
    <div className="relative">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route element={<PersistLogin />}>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected Routes */}
            <Route element={<RequireAuth allowedRoles={['agent', 'supervisor', 'admin']} />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/calls" element={<CallManagement />} />
                <Route path="/calls/history" element={<CallHistory />} />
                <Route path="/agents" element={<AgentManagement />} />
                <Route path="/queues" element={<QueueManagement />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/phone-numbers" element={<PhoneNumbers />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            <Route path="/*" element={<F404Page />} />
          </Route>
        </Routes>
      </QueryClientProvider>
    </div>
  );
}

export default App;

// ================================
// SERVICES/API.JS - API Integration
// ================================
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

// Calls API
export const callsAPI = {
  createCall: (callData) => api.post('/calls', callData),
  getCallHistory: (params) => api.get('/calls/history', { params }),
  getActiveCalls: () => api.get('/calls/active'),
  updateCall: (callId, updates) => api.put(`/calls/${callId}`, updates),
  endCall: (callId) => api.delete(`/calls/${callId}`),
};

// Agents API
export const agentsAPI = {
  getAgents: (params) => api.get('/agents', { params }),
  getAgentById: (agentId) => api.get(`/agents/${agentId}`),
  updateStatus: (status) => api.put('/agents/status', { status }),
  updateSkills: (skills) => api.put('/agents/skills', { skills }),
  updateAvailability: (availability) => api.put('/agents/availability', availability),
  getPerformance: (agentId, params) => api.get(`/agents/${agentId}/performance`, { params }),
};

// Queues API
export const queuesAPI = {
  getQueues: () => api.get('/queues'),
  createQueue: (queueData) => api.post('/queues', queueData),
  updateQueue: (queueId, updates) => api.put(`/queues/${queueId}`, updates),
  addAgent: (queueId, agentData) => api.post(`/queues/${queueId}/agents`, agentData),
  removeAgent: (queueId, agentId) => api.delete(`/queues/${queueId}/agents/${agentId}`),
  getStats: (queueId, params) => api.get(`/queues/${queueId}/stats`, { params }),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: (params) => api.get('/analytics/dashboard', { params }),
  getCallVolume: (params) => api.get('/analytics/call-volume', { params }),
  getAgentPerformance: (params) => api.get('/analytics/agent-performance', { params }),
  getQueuePerformance: (params) => api.get('/analytics/queue-performance', { params }),
  exportCalls: (params) => api.get('/analytics/export-calls', { params }),
};

// Phone Numbers API
export const phoneNumbersAPI = {
  getPhoneNumbers: (params) => api.get('/phone-numbers', { params }),
  purchaseNumber: (numberData) => api.post('/phone-numbers/purchase', numberData),
  updateNumber: (numberId, updates) => api.put(`/phone-numbers/${numberId}`, updates),
  releaseNumber: (numberId) => api.delete(`/phone-numbers/${numberId}`),
  getStats: (numberId, params) => api.get(`/phone-numbers/${numberId}/stats`, { params }),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  getSettings: () => api.get('/notifications/settings'),
  updateSettings: (settings) => api.put('/notifications/settings', settings),
};

export default api;

// ================================
// HOOKS/USESOCKET.JS - WebSocket Hook
// ================================
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    if (!token) return;

    const socketInstance = io(process.env.REACT_APP_WS_URL || 'http://localhost:3000', {
      auth: {
        token
      },
      transports: ['websocket']
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
      console.log('Socket connected');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      reconnectAttempts.current++;
      
      if (reconnectAttempts.current > 5) {
        toast.error('Unable to connect to real-time services');
      }
    });

    // Call events
    socketInstance.on('call:incoming', (data) => {
      toast.info(`Incoming call from ${data.phoneNumber}`, {
        autoClose: false,
      });
    });

    socketInstance.on('call:updated', (data) => {
      // Handle call updates
      console.log('Call updated:', data);
    });

    socketInstance.on('queue:updated', (data) => {
      // Handle queue updates
      console.log('Queue updated:', data);
    });

    socketInstance.on('system:message', (data) => {
      toast.info(data.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const emit = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  };

  return { socket, isConnected, emit };
};

export default useSocket;

// ================================
// COMPONENTS/LAYOUT/LAYOUT.JS - Main Layout
// ================================
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import useSocket from '../../hooks/useSocket';

const Layout = () => {
  const { isConnected } = useSocket();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header isConnected={isConnected} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

// ================================
// COMPONENTS/LAYOUT/SIDEBAR.JS - Navigation Sidebar
// ================================
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  PhoneIcon,
  UsersIcon,
  QueueListIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  Cog6ToothIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Active Calls', href: '/calls', icon: PhoneIcon },
  { name: 'Call History', href: '/calls/history', icon: ClockIcon },
  { name: 'Agents', href: '/agents', icon: UsersIcon },
  { name: 'Queues', href: '/queues', icon: QueueListIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Phone Numbers', href: '/phone-numbers', icon: DevicePhoneMobileIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="bg-gray-900 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Call Center</h1>
        <p className="text-gray-400 text-sm">Management System</p>
      </div>
      
      <nav className="space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`
                flex items-center space-x-3 py-2 px-4 rounded-lg transition-colors duration-200
                ${isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;

// ================================
// COMPONENTS/LAYOUT/HEADER.JS - Top Header
// ================================
import React, { useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authAPI } from '../../services/api';
import AgentStatusBadge from '../Common/AgentStatusBadge';
import NotificationPanel from '../Common/NotificationPanel';

const Header = ({ isConnected }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: authAPI.getProfile,
  });

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Welcome, {profile?.data?.profile?.firstName || profile?.data?.username}
            </h2>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm text-gray-500">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {profile?.data?.role === 'agent' && (
              <AgentStatusBadge />
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-500 relative"
              >
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              </button>
              
              {showNotifications && (
                <NotificationPanel onClose={() => setShowNotifications(false)} />
              )}
            </div>

            {/* User Menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
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
                        <a
                          href="/settings"
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } block px-4 py-2 text-sm text-gray-700`}
                        >
                          Settings
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-gray-100' : ''
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

// ================================
// PAGES/DASHBOARD.JS - Main Dashboard
// ================================
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../services/api';
import DashboardStats from '../components/Dashboard/DashboardStats';
import RealTimeMetrics from '../components/Dashboard/RealTimeMetrics';
import CallVolumeChart from '../components/Dashboard/CallVolumeChart';
import ActiveCallsList from '../components/Dashboard/ActiveCallsList';
import AgentStatusOverview from '../components/Dashboard/AgentStatusOverview';
import QueueStatus from '../components/Dashboard/QueueStatus';

const Dashboard = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard', '24h'],
    queryFn: () => analyticsAPI.getDashboard({ period: '24h' }),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Real-time metrics */}
      <RealTimeMetrics />

      {/* Dashboard stats */}
      <DashboardStats data={dashboardData?.data} />

      {/* Charts and lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <CallVolumeChart />
          <AgentStatusOverview />
        </div>
        <div className="space-y-6">
          <ActiveCallsList />
          <QueueStatus />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// ================================
// COMPONENTS/DASHBOARD/DASHBOARDSTATS.JS - Stats Cards
// ================================
import React from 'react';
import {
  PhoneIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </div>
              {change && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {changeType === 'increase' ? '+' : ''}{change}%
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

const DashboardStats = ({ data }) => {
  const stats = [
    {
      title: 'Total Calls Today',
      value: data?.calls?.totalCalls || 0,
      change: 12,
      changeType: 'increase',
      icon: PhoneIcon,
      color: 'text-blue-500',
    },
    {
      title: 'Active Calls',
      value: data?.calls?.activeCalls || 0,
      icon: PhoneIcon,
      color: 'text-green-500',
    },
    {
      title: 'Available Agents',
      value: data?.agents?.available || 0,
      icon: UserGroupIcon,
      color: 'text-purple-500',
    },
    {
      title: 'Avg Wait Time',
      value: data?.calls?.avgWaitTime ? `${Math.round(data.calls.avgWaitTime)}s` : '0s',
      change: -8,
      changeType: 'decrease',
      icon: ClockIcon,
      color: 'text-orange-500',
    },
    {
      title: 'Completion Rate',
      value: data?.calls?.completionRate ? `${Math.round(data.calls.completionRate)}%` : '0%',
      change: 5,
      changeType: 'increase',
      icon: CheckCircleIcon,
      color: 'text-green-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;

// ================================
// COMPONENTS/DASHBOARD/REALTIMEMETRICS.JS - Real-time Updates
// ================================
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../../services/api';
import useSocket from '../../hooks/useSocket';

const RealTimeMetrics = () => {
  const [metrics, setMetrics] = useState({
    activeCalls: 0,
    queuedCalls: 0,
    availableAgents: 0,
  });

  const { socket } = useSocket();

  const { data } = useQuery({
    queryKey: ['realtime-metrics'],
    queryFn: () => analyticsAPI.getDashboard({ period: '1h' }),
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (data?.data) {
      setMetrics({
        activeCalls: data.data.calls.activeCalls || 0,
        queuedCalls: data.data.calls.queuedCalls || 0,
        availableAgents: data.data.agents.available || 0,
      });
    }
  }, [data]);

  useEffect(() => {
    if (socket) {
      socket.on('call:updated', (data) => {
        // Update metrics in real-time
        if (data.status === 'in-progress') {
          setMetrics(prev => ({ ...prev, activeCalls: prev.activeCalls + 1 }));
        } else if (data.status === 'completed') {
          setMetrics(prev => ({ ...prev, activeCalls: Math.max(0, prev.activeCalls - 1) }));
        }
      });

      socket.on('queue:updated', (data) => {
        setMetrics(prev => ({ ...prev, queuedCalls: data.queueSize || 0 }));
      });

      return () => {
        socket.off('call:updated');
        socket.off('queue:updated');
      };
    }
  }, [socket]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Real-time Status</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{metrics.activeCalls}</div>
          <div className="text-sm text-gray-500">Active Calls</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-600">{metrics.queuedCalls}</div>
          <div className="text-sm text-gray-500">Queued Calls</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{metrics.availableAgents}</div>
          <div className="text-sm text-gray-500">Available Agents</div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMetrics;

// ================================
// COMPONENTS/DASHBOARD/CALLVOLUMECHART.JS - Call Volume Chart
// ================================
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../../services/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CallVolumeChart = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['call-volume', '24h'],
    queryFn: () => analyticsAPI.getCallVolume({ period: '24h', interval: 'hour' }),
    refetchInterval: 300000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Call Volume (24h)</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const chartData = data?.data?.data || [];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Call Volume (24h)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="_id" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit' })}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleString()}
              formatter={(value, name) => [value, name === 'totalCalls' ? 'Total Calls' : name]}
            />
            <Line 
              type="monotone" 
              dataKey="totalCalls" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CallVolumeChart;

// ================================
// COMPONENTS/DASHBOARD/ACTIVECALLSLIST.JS - Active Calls List
// ================================
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { callsAPI } from '../../services/api';
import { PhoneIcon, ClockIcon } from '@heroicons/react/24/outline';

const ActiveCallsList = () => {
  const { data: activeCalls, isLoading } = useQuery({
    queryKey: ['active-calls'],
    queryFn: callsAPI.getActiveCalls,
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Active Calls</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex space-x-3">
              <div className="rounded-full bg-gray-300 h-10 w-10"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const calls = activeCalls?.data || [];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Active Calls</h3>
        <span className="text-sm text-gray-500">{calls.length} active</span>
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {calls.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <PhoneIcon className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2">No active calls</p>
          </div>
        ) : (
          calls.map((call) => (
            <div key={call._id} className="flex items-center space-x-3 p-3 border rounded-lg">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <PhoneIcon className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {call.phoneNumber}
                </p>
                <p className="text-sm text-gray-500">
                  {call.agentInfo?.agentName || 'Unassigned'}
                </p>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <ClockIcon className="h-4 w-4 mr-1" />
                {call.callDetails?.startTime && 
                  Math.floor((new Date() - new Date(call.callDetails.startTime)) / 1000 / 60)
                }m
              </div>
              <div className={`px-2 py-1 text-xs rounded-full ${
                call.status === 'in-progress' ? 'bg-green-100 text-green-800' :
                call.status === 'ringing' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {call.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActiveCallsList;

// ================================
// PAGES/CALLMANAGEMENT.JS - Call Management Page
// ================================
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { callsAPI } from '../services/api';
import MakeCallModal from '../components/Calls/MakeCallModal';
import CallInterface from '../components/Calls/CallInterface';
import ActiveCallsList from '../components/Dashboard/ActiveCallsList';
import { PlusIcon } from '@heroicons/react/24/outline';

const CallManagement = () => {
  const [showMakeCall, setShowMakeCall] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);

  const { data: activeCalls } = useQuery({
    queryKey: ['active-calls'],
    queryFn: callsAPI.getActiveCalls,
    refetchInterval: 5000,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Call Management</h1>
        <button
          onClick={() => setShowMakeCall(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Make Call</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Calls */}
        <ActiveCallsList />

        {/* Call Interface */}
        {selectedCall && (
          <CallInterface 
            call={selectedCall}
            onClose={() => setSelectedCall(null)}
          />
        )}
      </div>

      {/* Make Call Modal */}
      {showMakeCall && (
        <MakeCallModal
          isOpen={showMakeCall}
          onClose={() => setShowMakeCall(false)}
        />
      )}
    </div>
  );
};

export default CallManagement;

// ================================
// COMPONENTS/CALLS/MAKECALLMODAL.JS - Make Call Modal
// ================================
import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { callsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { XMarkIcon } from '@heroicons/react/24/outline';

const MakeCallModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const makeCallMutation = useMutation({
    mutationFn: callsAPI.createCall,
    onSuccess: () => {
      toast.success('Call initiated successfully');
      queryClient.invalidateQueries(['active-calls']);
      reset();
      onClose();
    },
    onError: (error) => {
      toast.error(error.error?.message || 'Failed to make call');
    },
  });

  const onSubmit = (data) => {
    makeCallMutation.mutate({
      phoneNumber: data.phoneNumber,
      customerId: data.customerId,
      priority: parseInt(data.priority) || 0,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Make New Call</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register('phoneNumber', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^\+[1-9]\d{1,14}$/,
                      message: 'Enter a valid international phone number (e.g., +1234567890)'
                    }
                  })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1234567890"
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
                  Customer ID (Optional)
                </label>
                <input
                  type="text"
                  {...register('customerId')}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="CUST123"
                />
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  {...register('priority')}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="0">Low</option>
                  <option value="5">Normal</option>
                  <option value="8">High</option>
                  <option value="10">Urgent</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={makeCallMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {makeCallMutation.isPending ? 'Calling...' : 'Make Call'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakeCallModal;

// ================================
// COMPONENTS/CALLS/CALLINTERFACE.JS - Call Control Interface
// ================================
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { callsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import {
  PhoneIcon,
  PhoneXMarkIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  PauseIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';

const CallInterface = ({ call, onClose }) => {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const interval = setInterval(() => {
      if (call.callDetails?.startTime) {
        const elapsed = Math.floor((new Date() - new Date(call.callDetails.startTime)) / 1000);
        setDuration(elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [call.callDetails?.startTime]);

  const endCallMutation = useMutation({
    mutationFn: () => callsAPI.endCall(call.callId),
    onSuccess: () => {
      toast.success('Call ended');
      queryClient.invalidateQueries(['active-calls']);
      onClose();
    },
    onError: (error) => {
      toast.error(error.error?.message || 'Failed to end call');
    },
  });

  const updateCallMutation = useMutation({
    mutationFn: (updates) => callsAPI.updateCall(call.callId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['active-calls']);
    },
  });

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    endCallMutation.mutate();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // In a real implementation, this would control the actual call audio
  };

  const toggleHold = () => {
    setIsOnHold(!isOnHold);
    updateCallMutation.mutate({ 
      status: isOnHold ? 'in-progress' : 'on-hold' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="text-2xl font-bold text-gray-900 mb-2">
          {call.phoneNumber}
        </div>
        <div className="text-lg text-gray-600">
          {call.direction === 'inbound' ? 'Incoming Call' : 'Outbound Call'}
        </div>
        <div className="text-sm text-gray-500">
          Duration: {formatDuration(duration)}
        </div>
        <div className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${
          call.status === 'in-progress' ? 'bg-green-100 text-green-800' :
          call.status === 'ringing' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {call.status}
        </div>
      </div>

      {/* Call Controls */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={toggleMute}
          className={`p-3 rounded-full ${
            isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
          } hover:bg-opacity-80 transition-colors`}
        >
          <MicrophoneIcon className="h-6 w-6" />
        </button>

        <button
          onClick={toggleHold}
          className={`p-3 rounded-full ${
            isOnHold ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'
          } hover:bg-opacity-80 transition-colors`}
        >
          {isOnHold ? <PlayIcon className="h-6 w-6" /> : <PauseIcon className="h-6 w-6" />}
        </button>

        <button
          className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-opacity-80 transition-colors"
        >
          <SpeakerWaveIcon className="h-6 w-6" />
        </button>

        <button
          onClick={handleEndCall}
          disabled={endCallMutation.isPending}
          className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          <PhoneXMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Call Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Call Notes
        </label>
        <textarea
          rows={3}
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Add notes about this call..."
          onChange={(e) => {
            updateCallMutation.mutate({ notes: e.target.value });
          }}
        />
      </div>

      {/* Customer Info */}
      {call.callerInfo && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Customer Information</h4>
          <div className="space-y-1 text-sm text-gray-600">
            {call.callerInfo.name && (
              <div>Name: {call.callerInfo.name}</div>
            )}
            {call.callerInfo.customerId && (
              <div>Customer ID: {call.callerInfo.customerId}</div>
            )}
            {call.callerInfo.accountType && (
              <div>Account Type: {call.callerInfo.accountType}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CallInterface;

// ================================
// PAGES/CALLHISTORY.JS - Call History Page
// ================================
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { callsAPI } from '../services/api';
import CallHistoryTable from '../components/Calls/CallHistoryTable';
import CallHistoryFilters from '../components/Calls/CallHistoryFilters';

const CallHistory = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    phoneNumber: '',
    startDate: '',
    endDate: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['call-history', filters],
    queryFn: () => callsAPI.getCallHistory(filters),
    keepPreviousData: true,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Call History</h1>
      </div>

      <CallHistoryFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />

      <CallHistoryTable 
        data={data?.data}
        isLoading={isLoading}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
};

export default CallHistory;

// ================================
// COMPONENTS/CALLS/CALLHISTORYFILTERS.JS - Call History Filters
// ================================
import React from 'react';
import { useForm } from 'react-hook-form';

const CallHistoryFilters = ({ filters, onFiltersChange }) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: filters,
  });

  const onSubmit = (data) => {
    onFiltersChange({ ...filters, ...data, page: 1 });
  };

  const handleReset = () => {
    const resetFilters = {
      page: 1,
      limit: 20,
      status: '',
      phoneNumber: '',
      startDate: '',
      endDate: '',
    };
    reset(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="busy">Busy</option>
              <option value="no-answer">No Answer</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              {...register('phoneNumber')}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search phone number..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              {...register('startDate')}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              {...register('endDate')}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default CallHistoryFilters;

// ================================
// COMPONENTS/CALLS/CALLHISTORYTABLE.JS - Call History Table
// ================================
import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const CallHistoryTable = ({ data, isLoading, filters, onFiltersChange }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const calls = data?.calls || [];
  const pagination = data?.pagination || {};

  const formatDuration = (seconds) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'no-answer':
        return 'bg-gray-100 text-gray-800';
      case 'canceled':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePageChange = (newPage) => {
    onFiltersChange({ ...filters, page: newPage });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Direction
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Time
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {calls.map((call) => (
              <tr key={call._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {call.phoneNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    call.direction === 'inbound' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {call.direction}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {call.agentInfo?.agentName || 'Unassigned'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDuration(call.callDetails?.duration)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                    {call.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {call.callDetails?.startTime ? 
                    new Date(call.callDetails.startTime).toLocaleString() : 
                    '-'
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                
                {[...Array(pagination.pages)].map((_, i) => {
                  const pageNum = i + 1;
                  const isCurrentPage = pageNum === pagination.page;
                  
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.pages ||
                    (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          isCurrentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === pagination.page - 2 ||
                    pageNum === pagination.page + 2
                  ) {
                    return (
                      <span
                        key={pageNum}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallHistoryTable;

// ================================
// PAGES/AGENTMANAGEMENT.JS - Agent Management Page
// ================================
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { agentsAPI } from '../services/api';
import AgentsList from '../components/Agents/AgentsList';
import AgentFilters from '../components/Agents/AgentFilters';
import AgentStatusUpdate from '../components/Agents/AgentStatusUpdate';

const AgentManagement = () => {
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    isOnline: '',
  });

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents', filters],
    queryFn: () => agentsAPI.getAgents(filters),
    refetchInterval: 30000,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Agent Management</h1>
        <AgentStatusUpdate />
      </div>

      <AgentFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />

      <AgentsList 
        agents={agents?.data || []}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AgentManagement;

// ================================
// COMPONENTS/AGENTS/AGENTSLIST.JS - Agents List
// ================================
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { agentsAPI } from '../../services/api';
import AgentCard from './AgentCard';

const AgentsList = ({ agents, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">No agents found</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {agents.map((agent) => (
        <AgentCard key={agent._id} agent={agent} />
      ))}
    </div>
  );
};

export default AgentsList;

// ================================
// COMPONENTS/AGENTS/AGENTCARD.JS - Individual Agent Card
// ================================
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { agentsAPI } from '../../services/api';
import {
  UserIcon,
  PhoneIcon,
  ClockIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

const AgentCard = ({ agent }) => {
  const { data: performance } = useQuery({
    queryKey: ['agent-performance', agent.agentId],
    queryFn: () => agentsAPI.getPerformance(agent.agentId, { period: '30d' }),
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-red-100 text-red-800';
      case 'break':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 rounded-full p-2">
            <UserIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {agent.userId?.profile?.firstName} {agent.userId?.profile?.lastName}
            </h3>
            <p className="text-sm text-gray-500">{agent.agentId}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
          {agent.status}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <PhoneIcon className="h-4 w-4 mr-2" />
          <span>
            {agent.capacity?.currentCalls || 0} / {agent.capacity?.maxConcurrentCalls || 1} calls
          </span>
        </div>

        {agent.userId?.profile?.department && (
          <div className="text-sm text-gray-600">
            Department: {agent.userId.profile.department}
          </div>
        )}

        {agent.skills && agent.skills.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Skills:</div>
            <div className="flex flex-wrap gap-1">
              {agent.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  {skill.skill}
                  <span className="ml-1 flex items-center">
                    <StarIcon className="h-3 w-3 fill-current" />
                    {skill.level}
                  </span>
                </span>
              ))}
              {agent.skills.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{agent.skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {performance?.data && (
          <div className="pt-3 border-t border-gray-200">
            <div className="text-sm font-medium text-gray-700 mb-2">Performance (30 days)</div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>
                <div className="font-medium">{performance.data.periodStats?.totalCalls || 0}</div>
                <div className="text-xs">Total Calls</div>
              </div>
              <div>
                <div className="font-medium">
                  {formatDuration(performance.data.periodStats?.totalTalkTime)}
                </div>
                <div className="text-xs">Talk Time</div>
              </div>
            </div>
          </div>
        )}

        {agent.availability?.lastStatusChange && (
          <div className="flex items-center text-xs text-gray-500">
            <ClockIcon className="h-3 w-3 mr-1" />
            Status changed: {new Date(agent.availability.lastStatusChange).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentCard;

// ================================
// COMPONENTS/AGENTS/AGENTSTATUSUPDATE.JS - Agent Status Component
// ================================
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { agentsAPI, authAPI } from '../../services/api';
import { toast } from 'react-toastify';

const AgentStatusUpdate = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: authAPI.getProfile,
  });

  const statusMutation = useMutation({
    mutationFn: agentsAPI.updateStatus,
    onSuccess: () => {
      toast.success('Status updated successfully');
      queryClient.invalidateQueries(['agents']);
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(error.error?.message || 'Failed to update status');
    },
  });

  const statuses = [
    { value: 'available', label: 'Available', color: 'text-green-600' },
    { value: 'busy', label: 'Busy', color: 'text-red-600' },
    { value: 'break', label: 'Break', color: 'text-yellow-600' },
    { value: 'offline', label: 'Offline', color: 'text-gray-600' },
  ];

  if (profile?.data?.role !== 'agent') {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
      >
        Update Status
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {statuses.map((status) => (
              <button
                key={status.value}
                onClick={() => statusMutation.mutate(status.value)}
                disabled={statusMutation.isPending}
                className={`${status.color} block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentStatusUpdate;

// ================================
// COMPONENTS/AGENTS/AGENTFILTERS.JS - Agent Filters
// ================================
import React from 'react';
import { useForm } from 'react-hook-form';

const AgentFilters = ({ filters, onFiltersChange }) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: filters,
  });

  const onSubmit = (data) => {
    onFiltersChange(data);
  };

  const handleReset = () => {
    const resetFilters = {
      status: '',
      department: '',
      isOnline: '',
    };
    reset(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="break">Break</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              {...register('department')}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Departments</option>
              <option value="Customer Service">Customer Service</option>
              <option value="Sales">Sales</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Billing">Billing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Online Status
            </label>
            <select
              {...register('isOnline')}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              <option value="true">Online</option>
              <option value="false">Offline</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgentFilters;

// ================================
// PAGES/QUEUEMANAGEMENT.JS - Queue Management Page
// ================================
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queuesAPI } from '../services/api';
import QueuesList from '../components/Queues/QueuesList';
import CreateQueueModal from '../components/Queues/CreateQueueModal';
import { PlusIcon } from '@heroicons/react/24/outline';

const QueueManagement = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: queues, isLoading } = useQuery({
    queryKey: ['queues'],
    queryFn: queuesAPI.getQueues,
    refetchInterval: 30000,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Queue Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Create Queue</span>
        </button>
      </div>

      <QueuesList 
        queues={queues?.data || []}
        isLoading={isLoading}
      />

      {showCreateModal && (
        <CreateQueueModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default QueueManagement;

// ================================
// COMPONENTS/QUEUES/QUEUESLIST.JS - Queues List
// ================================
import React from 'react';
import QueueCard from './QueueCard';

const QueuesList = ({ queues, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="space-y-4">
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (queues.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">No queues found</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {queues.map((queue) => (
        <QueueCard key={queue._id} queue={queue} />
      ))}
    </div>
  );
};

export default QueuesList;

// ================================
// COMPONENTS/QUEUES/QUEUECARD.JS - Individual Queue Card
// ================================
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { queuesAPI } from '../../services/api';
import {
  QueueListIcon,
  UsersIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const QueueCard = ({ queue }) => {
  const { data: stats } = useQuery({
    queryKey: ['queue-stats', queue.queueId],
    queryFn: () => queuesAPI.getStats(queue.queueId, { period: '24h' }),
    refetchInterval: 60000,
  });

  const getStrategyColor = (strategy) => {
    switch (strategy) {
      case 'round_robin':
        return 'bg-blue-100 text-blue-800';
      case 'skills_based':
        return 'bg-green-100 text-green-800';
      case 'weighted':
        return 'bg-purple-100 text-purple-800';
      case 'priority':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStrategy = (strategy) => {
    return strategy.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 rounded-full p-2">
            <QueueListIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{queue.name}</h3>
            <p className="text-sm text-gray-500">{queue.queueId}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStrategyColor(queue.strategy)}`}>
          {formatStrategy(queue.strategy)}
        </span>
      </div>

      {queue.description && (
        <p className="text-sm text-gray-600 mb-4">{queue.description}</p>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <UsersIcon className="h-4 w-4 mr-2" />
            <span>Agents</span>
          </div>
          <span className="font-medium">{queue.agents?.length || 0}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <QueueListIcon className="h-4 w-4 mr-2" />
            <span>Current Queue</span>
          </div>
          <span className="font-medium">{queue.currentSize || 0}</span>
        </div>

        {stats?.data && (
          <>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <ClockIcon className="h-4 w-4 mr-2" />
                <span>Avg Wait Time</span>
              </div>
              <span className="font-medium">
                {stats.data.avgWaitTime ? `${Math.round(stats.data.avgWaitTime)}s` : '0s'}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <ChartBarIcon className="h-4 w-4 mr-2" />
                <span>Abandonment Rate</span>
              </div>
              <span className="font-medium">
                {stats.data.abandonmentRate ? `${Math.round(stats.data.abandonmentRate)}%` : '0%'}
              </span>
            </div>
          </>
        )}

        <div className="pt-3 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">Configuration</div>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Max Wait: {queue.configuration?.maxWaitTime || 0}s</div>
            <div>Max Size: {queue.configuration?.maxQueueSize || 0}</div>
            {queue.configuration?.skillsRequired && queue.configuration.skillsRequired.length > 0 && (
              <div>
                Skills: {queue.configuration.skillsRequired.join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueCard;

// ================================
// COMPONENTS/QUEUES/CREATEQUEUEMODAL.JS - Create Queue Modal
// ================================
import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queuesAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { XMarkIcon } from '@heroicons/react/24/outline';

const CreateQueueModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const createQueueMutation = useMutation({
    mutationFn: queuesAPI.createQueue,
    onSuccess: () => {
      toast.success('Queue created successfully');
      queryClient.invalidateQueries(['queues']);
      reset();
      onClose();
    },
    onError: (error) => {
      toast.error(error.error?.message || 'Failed to create queue');
    },
  });

  const onSubmit = (data) => {
    const queueData = {
      name: data.name,
      description: data.description,
      strategy: data.strategy,
      configuration: {
        maxWaitTime: parseInt(data.maxWaitTime) || 300,
        maxQueueSize: parseInt(data.maxQueueSize) || 100,
        skillsRequired: data.skillsRequired ? data.skillsRequired.split(',').map(s => s.trim()) : [],
      },
    };
    createQueueMutation.mutate(queueData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create New Queue</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Queue Name
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Queue name is required' })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Customer Support"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Queue description..."
                />
              </div>

              <div>
                <label htmlFor="strategy" className="block text-sm font-medium text-gray-700">
                  Routing Strategy
                </label>
                <select
                  {...register('strategy', { required: 'Strategy is required' })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Strategy</option>
                  <option value="round_robin">Round Robin</option>
                  <option value="skills_based">Skills Based</option>
                  <option value="weighted">Weighted</option>
                  <option value="priority">Priority</option>
                </select>
                {errors.strategy && (
                  <p className="mt-1 text-sm text-red-600">{errors.strategy.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="maxWaitTime" className="block text-sm font-medium text-gray-700">
                    Max Wait Time (seconds)
                  </label>
                  <input
                    type="number"
                    {...register('maxWaitTime')}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="300"
                  />
                </div>

                <div>
                  <label htmlFor="maxQueueSize" className="block text-sm font-medium text-gray-700">
                    Max Queue Size
                  </label>
                  <input
                    type="number"
                    {...register('maxQueueSize')}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="skillsRequired" className="block text-sm font-medium text-gray-700">
                  Required Skills (comma-separated)
                </label>
                <input
                  type="text"
                  {...register('skillsRequired')}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="customer_service, technical_support"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createQueueMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {createQueueMutation.isPending ? 'Creating...' : 'Create Queue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQueueModal;

// ================================
// PAGES/ANALYTICS.JS - Analytics Dashboard
// ================================
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../services/api';
import AnalyticsFilters from '../components/Analytics/AnalyticsFilters';
import CallVolumeChart from '../components/Analytics/CallVolumeChart';
import AgentPerformanceChart from '../components/Analytics/AgentPerformanceChart';
import QueuePerformanceTable from '../components/Analytics/QueuePerformanceTable';
import KPICards from '../components/Analytics/KPICards';

const Analytics = () => {
  const [period, setPeriod] = useState('30d');

  const { data: callVolume, isLoading: isLoadingVolume } = useQuery({
    queryKey: ['call-volume', period],
    queryFn: () => analyticsAPI.getCallVolume({ period, interval: 'day' }),
  });

  const { data: agentPerformance, isLoading: isLoadingAgents } = useQuery({
    queryKey: ['agent-performance', period],
    queryFn: () => analyticsAPI.getAgentPerformance({ period }),
  });

  const { data: queuePerformance, isLoading: isLoadingQueues } = useQuery({
    queryKey: ['queue-performance', period],
    queryFn: () => analyticsAPI.getQueuePerformance({ period }),
  });

  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard', period],
    queryFn: () => analyticsAPI.getDashboard({ period }),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <AnalyticsFilters 
          period={period}
          onPeriodChange={setPeriod}
        />
      </div>

      {/* KPI Cards */}
      <KPICards data={dashboardData?.data} period={period} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CallVolumeChart 
          data={callVolume?.data}
          isLoading={isLoadingVolume}
          period={period}
        />
        <AgentPerformanceChart 
          data={agentPerformance?.data}
          isLoading={isLoadingAgents}
          period={period}
        />
      </div>

      {/* Queue Performance Table */}
      <QueuePerformanceTable 
        data={queuePerformance?.data}
        isLoading={isLoadingQueues}
        period={period}
      />
    </div>
  );
};

export default Analytics;

// ================================
// COMPONENTS/ANALYTICS/KPICARDS.JS - KPI Cards
// ================================
import React from 'react';
import {
  PhoneIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from '@heroicons/react/24/outline';

const KPICard = ({ title, value, trend, icon: Icon, color, format }) => {
  const formatValue = (val) => {
    if (!val && val !== 0) return '0';
    
    switch (format) {
      case 'percentage':
        return `${Math.round(val)}%`;
      case 'duration':
        return `${Math.round(val)}s`;
      case 'number':
        return val.toLocaleString();
      default:
        return val;
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {formatValue(value)}
                </div>
                {trend && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trend > 0 ? (
                      <TrendingUpIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDownIcon className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(trend)}%
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICards = ({ data, period }) => {
  const kpis = [
    {
      title: 'Total Calls',
      value: data?.calls?.totalCalls || 0,
      trend: 12,
      icon: PhoneIcon,
      color: 'text-blue-500',
      format: 'number',
    },
    {
      title: 'Average Wait Time',
      value: data?.calls?.avgWaitTime || 0,
      trend: -8,
      icon: ClockIcon,
      color: 'text-orange-500',
      format: 'duration',
    },
    {
      title: 'Completion Rate',
      value: data?.calls?.completionRate || 0,
      trend: 5,
      icon: CheckCircleIcon,
      color: 'text-green-500',
      format: 'percentage',
    },
    {
      title: 'Abandonment Rate',
      value: data?.calls?.abandonmentRate || 0,
      trend: -3,
      icon: XCircleIcon,
      color: 'text-red-500',
      format: 'percentage',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
};

export default KPICards;

// ================================
// COMPONENTS/COMMON/AGENTSTATUSBADGE.JS - Agent Status Badge
// ================================
import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { agentsAPI, authAPI } from '../../services/api';
import { toast } from 'react-toastify';

const AgentStatusBadge = () => {
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: authAPI.getProfile,
  });

  const { data: agentData } = useQuery({
    queryKey: ['current-agent'],
    queryFn: () => agentsAPI.getAgents({ userId: profile?.data?._id }),
    enabled: !!profile?.data?._id,
  });

  const statusMutation = useMutation({
    mutationFn: agentsAPI.updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(['current-agent']);
      toast.success('Status updated');
    },
    onError: (error) => {
      toast.error(error.error?.message || 'Failed to update status');
    },
  });

  if (profile?.data?.role !== 'agent' || !agentData?.data?.[0]) {
    return null;
  }

  const agent = agentData.data[0];
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'busy':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'break':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offline':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const nextStatus = {
    available: 'busy',
    busy: 'break',
    break: 'available',
    offline: 'available',
  };

  const handleStatusClick = () => {
    const newStatus = nextStatus[agent.status] || 'available';
    statusMutation.mutate(newStatus);
  };

  return (
    <button
      onClick={handleStatusClick}
      disabled={statusMutation.isPending}
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border cursor-pointer
        hover:opacity-80 transition-opacity ${getStatusColor(agent.status)}
      `}
    >
      <div className={`w-2 h-2 rounded-full mr-2 ${
        agent.status === 'available' ? 'bg-green-500' :
        agent.status === 'busy' ? 'bg-red-500' :
        agent.status === 'break' ? 'bg-yellow-500' :
        'bg-gray-500'
      }`} />
      {agent.status}
    </button>
  );
};

export default AgentStatusBadge;

// ================================
// COMPONENTS/COMMON/NOTIFICATIONPANEL.JS - Notification Panel
// ================================
import React, { useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI } from '../../services/api';
import { XMarkIcon, BellIcon } from '@heroicons/react/24/outline';

const NotificationPanel = ({ onClose }) => {
  const panelRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsAPI.getNotifications,
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationsAPI.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleMarkAsRead = (notificationId) => {
    markAsReadMutation.mutate(notificationId);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'incoming_call':
        return '📞';
      case 'system_alert':
        return '⚠️';
      case 'performance_alert':
        return '📊';
      default:
        return '📝';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 max-h-96 overflow-y-auto"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-3">
                <div className="rounded-full bg-gray-300 h-8 w-8"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {notifications?.data?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BellIcon className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2">No notifications</p>
              </div>
            ) : (
              notifications?.data?.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                    notification.read ? 'bg-white' : 'bg-blue-50 border-blue-200'
                  }`}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.data?.message || notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;

// ================================
// COMPONENTS/ANALYTICS/CALLVOLUMECHART.JS - Enhanced Call Volume Chart
// ================================
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const CallVolumeChart = ({ data, isLoading, period }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Call Volume Trends</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const chartData = data?.data || [];

  const formatXAxisLabel = (value) => {
    const date = new Date(value);
    if (period === '24h') {
      return date.toLocaleTimeString([], { hour: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Call Volume Trends</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="_id" 
              tick={{ fontSize: 12 }}
              tickFormatter={formatXAxisLabel}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleString()}
              formatter={(value, name) => [
                value, 
                name === 'totalCalls' ? 'Total Calls' : 
                name === 'inboundCalls' ? 'Inbound' : 
                name === 'outboundCalls' ? 'Outbound' : name
              ]}
            />
            <Bar dataKey="inboundCalls" stackId="a" fill="#3B82F6" />
            <Bar dataKey="outboundCalls" stackId="a" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex justify-center space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
          <span>Inbound Calls</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
          <span>Outbound Calls</span>
        </div>
      </div>
    </div>
  );
};

export default CallVolumeChart;

// ================================
// COMPONENTS/ANALYTICS/AGENTPERFORMANCECHART.JS - Agent Performance Chart
// ================================
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const AgentPerformanceChart = ({ data, isLoading, period }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Agent Performance</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const chartData = (data?.agents || []).slice(0, 10).map(agent => ({
    name: agent.agentName || 'Unknown',
    totalCalls: agent.totalCalls || 0,
    completionRate: Math.round(agent.completionRate || 0),
    avgCallDuration: Math.round((agent.avgCallDuration || 0) / 60), // Convert to minutes
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Top Agent Performance ({period})
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fontSize: 10 }}
              width={80}
            />
            <Tooltip 
              formatter={(value, name) => [
                value, 
                name === 'totalCalls' ? 'Total Calls' : 
                name === 'completionRate' ? 'Completion Rate (%)' : 
                name === 'avgCallDuration' ? 'Avg Duration (min)' : name
              ]}
            />
            <Bar dataKey="totalCalls" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AgentPerformanceChart;

// ================================
// COMPONENTS/ANALYTICS/QUEUEPERFORMANCETABLE.JS - Queue Performance Table
// ================================
import React from 'react';

const QueuePerformanceTable = ({ data, isLoading, period }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Queue Performance</h3>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const queues = data?.queues || [];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Queue Performance ({period})
      </h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Queue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Calls
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Wait Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Abandonment Rate
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {queues.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No queue data available
                </td>
              </tr>
            ) : (
              queues.map((queue, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {queue._id || 'Unknown Queue'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(queue.totalCalls || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {queue.avgWaitTime ? `${Math.round(queue.avgWaitTime)}s` : '0s'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      (queue.serviceLevel || 0) >= 80 
                        ? 'bg-green-100 text-green-800' 
                        : (queue.serviceLevel || 0) >= 60 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {Math.round(queue.serviceLevel || 0)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      (queue.abandonmentRate || 0) <= 5 
                        ? 'bg-green-100 text-green-800' 
                        : (queue.abandonmentRate || 0) <= 10 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {Math.round(queue.abandonmentRate || 0)}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QueuePerformanceTable;

// ================================
// COMPONENTS/ANALYTICS/ANALYTICSFILTERS.JS - Analytics Filters
// ================================
import React from 'react';

const AnalyticsFilters = ({ period, onPeriodChange }) => {
  const periods = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
  ];

  return (
    <div className="flex items-center space-x-4">
      <label className="text-sm font-medium text-gray-700">Period:</label>
      <select
        value={period}
        onChange={(e) => onPeriodChange(e.target.value)}
        className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
      >
        {periods.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AnalyticsFilters;

// ================================
// PAGES/PHONENUMBERS.JS - Phone Numbers Management
// ================================
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { phoneNumbersAPI } from '../services/api';
import PhoneNumbersList from '../components/PhoneNumbers/PhoneNumbersList';
import PurchaseNumberModal from '../components/PhoneNumbers/PurchaseNumberModal';
import PhoneNumberFilters from '../components/PhoneNumbers/PhoneNumberFilters';
import { PlusIcon } from '@heroicons/react/24/outline';

const PhoneNumbers = () => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [filters, setFilters] = useState({
    isActive: '',
    purpose: '',
  });

  const { data: phoneNumbers, isLoading } = useQuery({
    queryKey: ['phone-numbers', filters],
    queryFn: () => phoneNumbersAPI.getPhoneNumbers(filters),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Phone Numbers</h1>
        <button
          onClick={() => setShowPurchaseModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Purchase Number</span>
        </button>
      </div>

      <PhoneNumberFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />

      <PhoneNumbersList 
        phoneNumbers={phoneNumbers?.data || []}
        isLoading={isLoading}
      />

      {showPurchaseModal && (
        <PurchaseNumberModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
        />
      )}
    </div>
  );
};

export default PhoneNumbers;

// ================================
// COMPONENTS/PHONENUMBERS/PHONENUMBERSLIST.JS - Phone Numbers List
// ================================
import React from 'react';
import PhoneNumberCard from './PhoneNumberCard';

const PhoneNumbersList = ({ phoneNumbers, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="space-y-4">
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (phoneNumbers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">No phone numbers found</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {phoneNumbers.map((phoneNumber) => (
        <PhoneNumberCard key={phoneNumber._id} phoneNumber={phoneNumber} />
      ))}
    </div>
  );
};

export default PhoneNumbersList;

// ================================
// COMPONENTS/PHONENUMBERS/PHONENUMBERCARD.JS - Phone Number Card
// ================================
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phoneNumbersAPI } from '../../services/api';
import { toast } from 'react-toastify';
import {
  DevicePhoneMobileIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const PhoneNumberCard = ({ phoneNumber }) => {
  const [showSettings, setShowSettings] = useState(false);
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ['phone-number-stats', phoneNumber._id],
    queryFn: () => phoneNumbersAPI.getStats(phoneNumber._id, { period: '30d' }),
  });

  const releaseMutation = useMutation({
    mutationFn: () => phoneNumbersAPI.releaseNumber(phoneNumber._id),
    onSuccess: () => {
      toast.success('Phone number released successfully');
      queryClient.invalidateQueries(['phone-numbers']);
    },
    onError: (error) => {
      toast.error(error.error?.message || 'Failed to release number');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updates) => phoneNumbersAPI.updateNumber(phoneNumber._id, updates),
    onSuccess: () => {
      toast.success('Phone number updated successfully');
      queryClient.invalidateQueries(['phone-numbers']);
      setShowSettings(false);
    },
    onError: (error) => {
      toast.error(error.error?.message || 'Failed to update number');
    },
  });

  const handleRelease = () => {
    if (window.confirm('Are you sure you want to release this phone number? This action cannot be undone.')) {
      releaseMutation.mutate();
    }
  };

  const handleToggleActive = () => {
    updateMutation.mutate({ isActive: !phoneNumber.isActive });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 rounded-full p-2">
            <DevicePhoneMobileIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {phoneNumber.phoneNumber}
            </h3>
            <p className="text-sm text-gray-500">
              {phoneNumber.friendlyName || 'No name'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-400 hover:text-gray-600"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleRelease}
            disabled={releaseMutation.isPending}
            className="text-red-400 hover:text-red-600"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Status</span>
          <button
            onClick={handleToggleActive}
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              phoneNumber.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {phoneNumber.isActive ? 'Active' : 'Inactive'}
          </button>
        </div>

        {phoneNumber.assignment?.purpose && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Purpose</span>
            <span className="font-medium">{phoneNumber.assignment.purpose}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Capabilities</span>
          <div className="flex space-x-1">
            {phoneNumber.capabilities?.voice && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Voice</span>
            )}
            {phoneNumber.capabilities?.sms && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">SMS</span>
            )}
            {phoneNumber.capabilities?.mms && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">MMS</span>
            )}
          </div>
        </div>

        {stats?.data && (
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <ChartBarIcon className="h-4 w-4 mr-1" />
              Usage (30 days)
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>
                <div className="font-medium">{stats.data.statistics.totalCalls || 0}</div>
                <div className="text-xs">Total Calls</div>
              </div>
              <div>
                <div className="font-medium">
                  {Math.round((stats.data.statistics.totalDuration || 0) / 60)}m
                </div>
                <div className="text-xs">Total Duration</div>
              </div>
            </div>
          </div>
        )}

        {phoneNumber.usage?.lastUsed && (
          <div className="text-xs text-gray-500">
            Last used: {new Date(phoneNumber.usage.lastUsed).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Friendly Name
              </label>
              <input
                type="text"
                defaultValue={phoneNumber.friendlyName}
                className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                onBlur={(e) => {
                  if (e.target.value !== phoneNumber.friendlyName) {
                    updateMutation.mutate({ friendlyName: e.target.value });
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose
              </label>
              <select
                defaultValue={phoneNumber.assignment?.purpose || ''}
                className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  updateMutation.mutate({
                    assignment: {
                      ...phoneNumber.assignment,
                      purpose: e.target.value
                    }
                  });
                }}
              >
                <option value="">Select Purpose</option>
                <option value="customer_support">Customer Support</option>
                <option value="sales">Sales</option>
                <option value="technical_support">Technical Support</option>
                <option value="billing">Billing</option>
                <option value="main">Main Line</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneNumberCard;

// ================================
// COMPONENTS/PHONENUMBERS/PURCHASENUMBERMODAL.JS - Purchase Number Modal
// ================================
import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { phoneNumbersAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { XMarkIcon } from '@heroicons/react/24/outline';

const PurchaseNumberModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const purchaseMutation = useMutation({
    mutationFn: phoneNumbersAPI.purchaseNumber,
    onSuccess: () => {
      toast.success('Phone number purchased successfully');
      queryClient.invalidateQueries(['phone-numbers']);
      reset();
      onClose();
    },
    onError: (error) => {
      toast.error(error.error?.message || 'Failed to purchase number');
    },
  });

  const onSubmit = (data) => {
    purchaseMutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Purchase Phone Number</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="areaCode" className="block text-sm font-medium text-gray-700">
                  Area Code
                </label>
                <input
                  type="text"
                  {...register('areaCode', {
                    required: 'Area code is required',
                    pattern: {
                      value: /^\d{3}$/,
                      message: 'Area code must be 3 digits'
                    }
                  })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="415"
                  maxLength={3}
                />
                {errors.areaCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.areaCode.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="friendlyName" className="block text-sm font-medium text-gray-700">
                  Friendly Name
                </label>
                <input
                  type="text"
                  {...register('friendlyName')}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Customer Support Line"
                />
              </div>

              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                  Purpose
                </label>
                <select
                  {...register('purpose', { required: 'Purpose is required' })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Purpose</option>
                  <option value="customer_support">Customer Support</option>
                  <option value="sales">Sales</option>
                  <option value="technical_support">Technical Support</option>
                  <option value="billing">Billing</option>
                  <option value="main">Main Line</option>
                </select>
                {errors.purpose && (
                  <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="text-sm text-yellow-700">
                  <strong>Note:</strong> Phone numbers typically cost $1.15/month plus usage fees. 
                  You will be charged immediately upon purchase.
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={purchaseMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {purchaseMutation.isPending ? 'Purchasing...' : 'Purchase Number'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseNumberModal;

// ================================
// COMPONENTS/PHONENUMBERS/PHONENUMBERFILTERS.JS - Phone Number Filters
// ================================
import React from 'react';
import { useForm } from 'react-hook-form';

const PhoneNumberFilters = ({ filters, onFiltersChange }) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: filters,
  });

  const onSubmit = (data) => {
    onFiltersChange(data);
  };

  const handleReset = () => {
    const resetFilters = {
      isActive: '',
      purpose: '',
    };
    reset(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              {...register('isActive')}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose
            </label>
            <select
              {...register('purpose')}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Purposes</option>
              <option value="customer_support">Customer Support</option>
              <option value="sales">Sales</option>
              <option value="technical_support">Technical Support</option>
              <option value="billing">Billing</option>
              <option value="main">Main Line</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default PhoneNumberFilters;

// ================================
// PAGES/SETTINGS.JS - Settings Page
// ================================
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI, notificationsAPI } from '../services/api';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const queryClient = useQueryClient();

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'preferences', name: 'Preferences', icon: Cog6ToothIcon },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'preferences' && <PreferencesSettings />}
        </div>
      </div>
    </div>
  );
};

// Profile Settings Component
const ProfileSettings = () => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: authAPI.getProfile,
  });

  const updateProfileMutation = useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries(['profile']);
    },
    onError: (error) => {
      toast.error(error.error?.message || 'Failed to update profile');
    },
  });

  const onSubmit = (data) => {
    updateProfileMutation.mutate({ profile: data });
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded"></div>
      ))}
    </div>;
  }

  const profileData = profile?.data?.profile || {};

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            {...register('firstName', { required: 'First name is required' })}
            defaultValue={profileData.firstName}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            {...register('lastName', { required: 'Last name is required' })}
            defaultValue={profileData.lastName}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <select
            {...register('department')}
            defaultValue={profileData.department}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Department</option>
            <option value="Customer Service">Customer Service</option>
            <option value="Sales">Sales</option>
            <option value="Technical Support">Technical Support</option>
            <option value="Billing">Billing</option>
            <option value="Management">Management</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Extension
          </label>
          <input
            type="text"
            {...register('phoneExtension')}
            defaultValue={profileData.phoneExtension}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 1234"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Skills (comma-separated)
        </label>
        <input
          type="text"
          {...register('skills')}
          defaultValue={profileData.skills?.join(', ')}
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="customer_service, technical_support, billing"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={updateProfileMutation.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

// Notification Settings Component
const NotificationSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: notificationsAPI.getSettings,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: notificationsAPI.updateSettings,
    onSuccess: () => {
      toast.success('Notification settings updated');
      queryClient.invalidateQueries(['notification-settings']);
    },
    onError: (error) => {
      toast.error(error.error?.message || 'Failed to update settings');
    },
  });

  const handleToggle = (setting) => {
    const newSettings = {
      ...settings?.data,
      [setting]: !settings?.data?.[setting],
    };
    updateSettingsMutation.mutate(newSettings);
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 rounded"></div>
      ))}
    </div>;
  }

  const settingsData = settings?.data || {};

  const notificationOptions = [
    {
      id: 'incomingCalls',
      label: 'Incoming Calls',
      description: 'Get notified when you receive incoming calls',
    },
    {
      id: 'queueUpdates',
      label: 'Queue Updates',
      description: 'Notifications about queue status changes',
    },
    {
      id: 'systemMessages',
      label: 'System Messages',
      description: 'Important system announcements and alerts',
    },
    {
      id: 'emailNotifications',
      label: 'Email Notifications',
      description: 'Receive notifications via email',
    },
    {
      id: 'soundAlerts',
      label: 'Sound Alerts',
      description: 'Play sounds for important notifications',
    },
  ];

  return (
    <div className="space-y-6">
      {notificationOptions.map((option) => (
        <div key={option.id} className="flex items-center justify-between py-4 border-b border-gray-200">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900">{option.label}</h3>
            <p className="text-sm text-gray-500">{option.description}</p>
          </div>
          <button
            onClick={() => handleToggle(option.id)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              settingsData[option.id] ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settingsData[option.id] ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );
};

// Security Settings Component
const SecuritySettings = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const changePasswordMutation = useMutation({
    mutationFn: (data) => {
      // This would need to be implemented in the API
      return Promise.resolve();
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error) => {
      toast.error('Failed to change password');
    },
  });

  const onSubmit = (data) => {
    changePasswordMutation.mutate(data);
  };

  const newPassword = watch('newPassword');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              {...register('currentPassword', { required: 'Current password is required' })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              {...register('newPassword', {
                required: 'New password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value =>
                  value === newPassword || 'Passwords do not match'
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-700">
            Two-factor authentication is not yet enabled. This feature will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  );
};

// Preferences Settings Component
const PreferencesSettings = () => {
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    callVolume: 50,
    autoAnswer: false,
    defaultQueue: '',
  });

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    // In a real app, this would save to the backend
    toast.success('Preference updated');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Display Preferences</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Theme
            </label>
            <select
              value={preferences.theme}
              onChange={(e) => handlePreferenceChange('theme', e.target.value)}
              className="w-full max-w-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              value={preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
              className="w-full max-w-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <select
              value={preferences.timezone}
              onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
              className="w-full max-w-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Call Preferences</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Call Volume
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={preferences.callVolume}
              onChange={(e) => handlePreferenceChange('callVolume', e.target.value)}
              className="w-full max-w-xs"
            />
            <div className="text-sm text-gray-500">{preferences.callVolume}%</div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Auto Answer</h4>
              <p className="text-sm text-gray-500">Automatically answer incoming calls</p>
            </div>
            <button
              onClick={() => handlePreferenceChange('autoAnswer', !preferences.autoAnswer)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                preferences.autoAnswer ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  preferences.autoAnswer ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

// ================================
// COMPONENTS/DASHBOARD/AGENTSTATUS.JS - Agent Status Overview
// ================================
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { agentsAPI } from '../../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const AgentStatusOverview = () => {
  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: () => agentsAPI.getAgents(),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Agent Status</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const agentsList = agents?.data || [];
  
  // Count agents by status
  const statusCounts = agentsList.reduce((acc, agent) => {
    acc[agent.status] = (acc[agent.status] || 0) + 1;
    return acc;
  }, {});

  const chartData = [
    { name: 'Available', value: statusCounts.available || 0, color: '#10B981' },
    { name: 'Busy', value: statusCounts.busy || 0, color: '#EF4444' },
    { name: 'Break', value: statusCounts.break || 0, color: '#F59E0B' },
    { name: 'Offline', value: statusCounts.offline || 0, color: '#6B7280' },
  ].filter(item => item.value > 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Agent Status</h3>
      
      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No agent data available
        </div>
      ) : (
        <>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Agents']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-2">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center text-sm">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-600">{item.name}:</span>
                <span className="ml-1 font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AgentStatusOverview;



// ================================
// WEBSITE/HOME.JS - Updated Home Page
// ================================
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../services/api';
import {
  PhoneIcon,
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const Home = () => {
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard', '24h'],
    queryFn: () => analyticsAPI.getDashboard({ period: '24h' }),
  });

  const quickStats = [
    {
      title: 'Calls Today',
      value: dashboardData?.data?.calls?.totalCalls || 0,
      icon: PhoneIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Calls',
      value: dashboardData?.data?.calls?.activeCalls || 0,
      icon: PhoneIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Available Agents',
      value: dashboardData?.data?.agents?.available || 0,
      icon: UsersIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Avg Wait Time',
      value: dashboardData?.data?.calls?.avgWaitTime 
        ? `${Math.round(dashboardData.data.calls.avgWaitTime)}s` 
        : '0s',
      icon: ClockIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const quickActions = [
    {
      title: 'Make a Call',
      description: 'Start an outbound call to a customer',
      href: '/calls',
      icon: PhoneIcon,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      title: 'View Dashboard',
      description: 'See detailed analytics and metrics',
      href: '/dashboard',
      icon: ChartBarIcon,
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      title: 'Manage Agents',
      description: 'View and manage agent status',
      href: '/agents',
      icon: UsersIcon,
      color: 'bg-purple-600 hover:bg-purple-700',
    },
  ];

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Call Center Management
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your call center operations efficiently with real-time monitoring, 
            intelligent call routing, and comprehensive analytics.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
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
                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-full text-white ${action.color}`}>
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
                <h3 className="text-sm font-medium text-gray-700 mb-3">Service Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Call Routing</span>
                    <span className="flex items-center text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Voice Services</span>
                    <span className="flex items-center text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Analytics</span>
                    <span className="flex items-center text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Operational
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Links</h3>
                <div className="space-y-2">
                  <Link to="/calls/history" className="block text-sm text-blue-600 hover:text-blue-800">
                    View Call History
                  </Link>
                  <Link to="/analytics" className="block text-sm text-blue-600 hover:text-blue-800">
                    Detailed Analytics
                  </Link>
                  <Link to="/settings" className="block text-sm text-blue-600 hover:text-blue-800">
                    Account Settings
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