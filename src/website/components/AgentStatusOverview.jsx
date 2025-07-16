// ================================
// COMPONENTS/DASHBOARD/AGENTSTATUS.JS - Agent Status Overview
// ================================
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { agentsAPI } from "../../services/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const AgentStatusOverview = () => {
  const { data: agents, isLoading } = useQuery({
    queryKey: ["agents"],
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
    { name: "Available", value: statusCounts.available || 0, color: "#10B981" },
    { name: "Busy", value: statusCounts.busy || 0, color: "#EF4444" },
    { name: "Break", value: statusCounts.break || 0, color: "#F59E0B" },
    { name: "Offline", value: statusCounts.offline || 0, color: "#6B7280" },
  ].filter((item) => item.value > 0);

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
                <Tooltip formatter={(value) => [value, "Agents"]} />
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