// ================================
// PAGES/AGENTMANAGEMENT.JS - Agent Management Page
// ================================
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { agentsAPI } from "../services/api";
import AgentsList from "./components/AgentsList";
import AgentFilters from "./components/AgentFilters";
import AgentStatusUpdate from "./components/AgentStatusUpdate";

const AgentManagement = () => {
  const [filters, setFilters] = useState({
    status: "",
    department: "",
    isOnline: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["agents", filters],
    queryFn: () => agentsAPI.getAgents(filters),
    refetchInterval: 30000,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Agent Management</h1>
        <AgentStatusUpdate />
      </div>

      <AgentFilters filters={filters} onFiltersChange={setFilters} />

      <AgentsList agents={data?.data?.agents || []} isLoading={isLoading} />
    </div>
  );
};

export default AgentManagement;
