
// ================================
// COMPONENTS/AGENTS/AGENTSTATUSUPDATE.JS - Agent Status Component
// ================================
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { agentsAPI, authAPI } from "../../services/api";
import { toast } from "react-toastify";

const AgentStatusUpdate = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: authAPI.getProfile,
  });

  const statusMutation = useMutation({
    mutationFn: agentsAPI.updateStatus,
    onSuccess: () => {
      toast.success("Status updated successfully");
      queryClient.invalidateQueries(["agents"]);
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(error.error?.message || "Failed to update status");
    },
  });

  const statuses = [
    { value: "available", label: "Available", color: "text-green-600" },
    { value: "busy", label: "Busy", color: "text-red-600" },
    { value: "break", label: "Break", color: "text-yellow-600" },
    { value: "offline", label: "Offline", color: "text-gray-600" },
  ];

  if (profile?.data?.role !== "agent") {
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