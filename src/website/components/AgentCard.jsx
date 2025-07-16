// ================================
// COMPONENTS/AGENTS/AGENTCARD.JS - Individual Agent Card
// ================================
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { agentsAPI } from "../../services/api";
import {
  UserIcon,
  PhoneIcon,
  ClockIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

const AgentCard = ({ agent }) => {
  const { data: performance } = useQuery({
    queryKey: ["agent-performance", agent.agentId],
    queryFn: () => agentsAPI.getPerformance(agent.agentId, { period: "30d" }),
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "busy":
        return "bg-red-100 text-red-800";
      case "break":
        return "bg-yellow-100 text-yellow-800";
      case "offline":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0h 0m";
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
              {agent.userId?.profile?.firstName}{" "}
              {agent.userId?.profile?.lastName}
            </h3>
            <p className="text-sm text-gray-500">{agent.agentId}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
            agent.status
          )}`}
        >
          {agent.status}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <PhoneIcon className="h-4 w-4 mr-2" />
          <span>
            {agent.capacity?.currentCalls || 0} /{" "}
            {agent.capacity?.maxConcurrentCalls || 1} calls
          </span>
        </div>

        {agent.userId?.profile?.department && (
          <div className="text-sm text-gray-600">
            Department: {agent.userId.profile.department}
          </div>
        )}

        {agent.skills && agent.skills.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">
              Skills:
            </div>
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
            <div className="text-sm font-medium text-gray-700 mb-2">
              Performance (30 days)
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>
                <div className="font-medium">
                  {performance.data.periodStats?.totalCalls || 0}
                </div>
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
            Status changed:{" "}
            {new Date(agent.availability.lastStatusChange).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentCard;