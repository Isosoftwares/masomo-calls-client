// ================================
// COMPONENTS/AGENTS/AGENTSLIST.JS - Agents List
// ================================
import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React from "react";
import AddUser from "./AddUser";

// Agent Card Component
const AgentCard = ({ agent }) => {
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "supervisor":
        return "bg-blue-100 text-blue-800";
      case "agent":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDepartmentColor = (department) => {
    switch (department) {
      case "Sales":
        return "bg-purple-100 text-purple-800";
      case "Customer Service":
        return "bg-orange-100 text-orange-800";
      case "IT":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatLastLogin = (lastLogin) => {
    if (!lastLogin) return "Never";
    const date = new Date(lastLogin);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200">
      {/* Header with Avatar and Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {getInitials(agent.profile.firstName, agent.profile.lastName)}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {agent.profile.firstName} {agent.profile.lastName}
            </h3>
            <p className="text-sm text-gray-600">@{agent.username}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <div
            className={`w-3 h-3 rounded-full ${
              agent.isActive ? "bg-green-400" : "bg-gray-400"
            }`}
          ></div>
          <span
            className={`text-xs font-medium ${
              agent.isActive ? "text-green-600" : "text-gray-500"
            }`}
          >
            {agent.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Role and Department Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
            agent.role
          )}`}
        >
          {agent.role.charAt(0).toUpperCase() + agent.role.slice(1)}
        </span>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          {agent.email}
        </div>
      </div>

      {/* Last Login */}
      <div className="border-t border-gray-200 pt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Last Login:</span>
          <span className="text-gray-700 font-medium">
            {formatLastLogin(agent.lastLogin)}
          </span>
        </div>
      </div>
    </div>
  );
};

// Main AgentsList Component
const AgentsList = ({ agents, isLoading }) => {
  const [opened, { open, close }] = useDisclosure(false);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md p-6 animate-pulse border border-gray-200"
          >
            {/* Header skeleton */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="h-3 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            </div>

            {/* Badges skeleton */}
            <div className="flex gap-2 mb-4">
              <div className="h-6 bg-gray-300 rounded-full w-16"></div>
              <div className="h-6 bg-gray-300 rounded-full w-20"></div>
            </div>

            {/* Skills skeleton */}
            <div className="mb-4">
              <div className="h-4 bg-gray-300 rounded w-12 mb-2"></div>
              <div className="flex gap-1">
                <div className="h-6 bg-gray-300 rounded w-16"></div>
                <div className="h-6 bg-gray-300 rounded w-20"></div>
              </div>
            </div>

            {/* Contact skeleton */}
            <div className="mb-4">
              <div className="h-4 bg-gray-300 rounded w-32"></div>
            </div>

            {/* Footer skeleton */}
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between">
                <div className="h-3 bg-gray-300 rounded w-16"></div>
                <div className="h-3 bg-gray-300 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          No agents found
        </h3>
        <p className="text-gray-500">
          There are no agents to display at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Modal opened={opened} onClose={close} title="Add agent">
        <AddUser handleCloseAddModal={close} />
      </Modal>
      {/* Summary Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-3 items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Agents ({agents.length})
            </h2>
            <button
              onClick={open}
              className="bg-primary text-light px-3 py-2 rounded-md "
            >
              Add Agent
            </button>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
              Active: {agents.filter((agent) => agent.isActive).length}
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
              Inactive: {agents.filter((agent) => !agent.isActive).length}
            </span>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {agents.map((agent) => (
          <AgentCard key={agent._id} agent={agent} />
        ))}
      </div>
    </div>
  );
};

export default AgentsList;
