// ================================
// COMPONENTS/COMMON/AGENTSTATUSBADGE.JS - Agent Status Badge
// ================================
import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { agentsAPI, authAPI } from "../../services/api";
import { toast } from "react-toastify";

const AgentStatusBadge = () => {
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: authAPI.getProfile,
  });

  const { data: agentData } = useQuery({
    queryKey: ["current-agent"],
    queryFn: () => agentsAPI.getAgents({ userId: profile?.data?._id }),
    enabled: !!profile?.data?._id,
  });

  const statusMutation = useMutation({
    mutationFn: agentsAPI.updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(["current-agent"]);
      toast.success("Status updated");
    },
    onError: (error) => {
      toast.error(error.error?.message || "Failed to update status");
    },
  });

  if (profile?.data?.role !== "agent" || !agentData?.data?.[0]) {
    return null;
  }

  const agent = agentData.data[0];

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "busy":
        return "bg-red-100 text-red-800 border-red-200";
      case "break":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "offline":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const nextStatus = {
    available: "busy",
    busy: "break",
    break: "available",
    offline: "available",
  };

  const handleStatusClick = () => {
    const newStatus = nextStatus[agent.status] || "available";
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
      <div
        className={`w-2 h-2 rounded-full mr-2 ${
          agent.status === "available"
            ? "bg-green-500"
            : agent.status === "busy"
            ? "bg-red-500"
            : agent.status === "break"
            ? "bg-yellow-500"
            : "bg-gray-500"
        }`}
      />
      {agent.status}
    </button>
  );
};

export default AgentStatusBadge;
