// ================================
// PAGES/CALLHISTORY.JS - Call History Page
// ================================
import React, { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { callsAPI } from "../services/api";
import CallHistoryFilters from "../website/components/CallHistoryFilters";
import CallHistoryTable from "../website/components/CallHistoryTable";
import useAuth from "../hooks/useAuth";
import axios from "../api/axios";

const AgentCallHistory = () => {
  const { auth } = useAuth();

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: "",
    phoneNumber: "",
    startDate: "",
    endDate: "",
    agentId: auth?.userId ,
  });

  const queryParams = new URLSearchParams(filters).toString();


  const fetchCallHistory = useCallback(async () => {
    const response = await axios.get(`/record-calls/history?${queryParams}`);
    return response;
  });

  const { data, isLoading } = useQuery({
    queryKey: ["call-history", filters],
    queryFn: fetchCallHistory,
    keepPreviousData: true,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Call History</h1>
      </div>

      <CallHistoryFilters filters={filters} onFiltersChange={setFilters} />

      <CallHistoryTable
        data={data?.data?.data?.calls}
        isLoading={isLoading}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
};

export default AgentCallHistory;
