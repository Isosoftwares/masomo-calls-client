import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader, Select, TextInput, Pagination } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { DateInput } from "@mantine/dates";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const CallHistory = () => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();

  // Pagination and search states
  const [perPage, setPerPage] = useState(20);
  const [activePage, setPage] = useState(1);
  const [phoneNumberSearch, setPhoneNumberSearch] = useDebouncedState("", 500);

  // Filter states
  const [status, setStatus] = useState("");
  const [agentId, setAgentId] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Fetch call history with pagination and filters
  const getCallHistory = () => {
    const params = new URLSearchParams();
    params.append("page", activePage);
    params.append("limit", perPage);

    if (phoneNumberSearch) params.append("phoneNumber", phoneNumberSearch);
    if (status) params.append("status", status);
    if (agentId) params.append("agentId", agentId);
    if (startDate) params.append("startDate", startDate.toISOString());
    if (endDate) params.append("endDate", endDate.toISOString());

    return axios.get(`/record-calls/history?${params.toString()}`);
  };

  const {
    isLoading: loadingCalls,
    data: callsData,
    error: callsError,
    isError: isCallsError,
    refetch,
    isRefetching: refetchingCalls,
  } = useQuery({
    queryFn: getCallHistory,
    queryKey: [`call-history`],
    keepPreviousData: true,
    retry: 2,
  });

  const totalPages = Math.ceil(callsData?.data?.pagination?.total / perPage);

  // Pagination refetch
  useEffect(() => {
    refetch();
  }, [
    activePage,
    perPage,
    phoneNumberSearch,
    status,
    agentId,
    startDate,
    endDate,
  ]);

  // Fetch agents for dropdown
  const getAgents = () => {
    return axios.get(`/agents`);
  };

  const {
    isLoading: loadingAgents,
    data: agentsData,
    error: agentsError,
    isError: isAgentsError,
  } = useQuery({
    queryKey: [`agents-call-history`],
    queryFn: getAgents,
    keepPreviousData: true,
    retry: 2,
  });

  let agents =
    agentsData?.data?.agents?.map((agent) => ({
      label: agent?.username || agent?.name || `Agent ${agent?._id}`,
      value: agent?._id,
    })) || [];

  // Status options
  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Completed", value: "completed" },
    { label: "In Progress", value: "in-progress" },
    { label: "Failed", value: "failed" },
    { label: "Missed", value: "missed" },
  ];

  // Clear filters
  const clearFilters = () => {
    setStatus("");
    setAgentId("");
    setStartDate(null);
    setEndDate(null);
    setPhoneNumberSearch("");
    setPage(1);
  };

  const hasActiveFilters =
    status || agentId || startDate || endDate || phoneNumberSearch;

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Helper function to format duration
  const formatDuration = (seconds) => {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Helper function to get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "missed":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Call History</h2>
            <p className="text-gray-600 mt-1">
              View and manage your call history
            </p>
            {/* Show error indicators */}
            {isAgentsError && (
              <p className="text-amber-600 text-sm mt-1 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.351 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                Agents unavailable
              </p>
            )}
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-700">
                Search & Filters:
              </span>
            </div>

            {/* First Row - Search and Status */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Phone Number Search */}
              <div className="flex-1 min-w-0">
                <TextInput
                  placeholder="Search by phone number..."
                  value={phoneNumberSearch}
                  onChange={(event) =>
                    setPhoneNumberSearch(event.currentTarget.value)
                  }
                  styles={{
                    input: {
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      backgroundColor: "white",
                    },
                  }}
                  icon={
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  }
                />
              </div>

              {/* Status Filter */}
              <div className="flex-1 min-w-0">
                <Select
                  placeholder="Filter by Status"
                  value={status}
                  onChange={(value) => setStatus(value || "")}
                  data={statusOptions}
                  clearable
                  styles={{
                    input: {
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      backgroundColor: "white",
                    },
                  }}
                />
              </div>

              {/* Agent Filter */}
              <div className="flex-1 min-w-0">
                <Select
                  placeholder="Filter by Agent"
                  value={agentId}
                  onChange={(value) => setAgentId(value || "")}
                  data={[{ label: "All Agents", value: "" }, ...agents]}
                  clearable
                  searchable
                  disabled={isAgentsError || loadingAgents}
                  styles={{
                    input: {
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      backgroundColor: "white",
                    },
                  }}
                />
              </div>
            </div>

            {/* Second Row - Date Filters and Clear Button */}
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              {/* Start Date */}
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  From Date
                </label>
                <DateInput
                  placeholder="Select start date"
                  value={startDate}
                  onChange={setStartDate}
                  clearable
                  styles={{
                    input: {
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      backgroundColor: "white",
                    },
                  }}
                />
              </div>

              {/* End Date */}
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  To Date
                </label>
                <DateInput
                  placeholder="Select end date"
                  value={endDate}
                  onChange={setEndDate}
                  clearable
                  minDate={startDate}
                  styles={{
                    input: {
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      backgroundColor: "white",
                    },
                  }}
                />
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Active Filter Count */}
            {hasActiveFilters && (
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {
                    [
                      status,
                      agentId,
                      startDate,
                      endDate,
                      phoneNumberSearch,
                    ].filter(Boolean).length
                  }{" "}
                  filter
                  {[
                    status,
                    agentId,
                    startDate,
                    endDate,
                    phoneNumberSearch,
                  ].filter(Boolean).length !== 1
                    ? "s"
                    : ""}{" "}
                  active
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Report
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loadingCalls || refetchingCalls ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <Loader color="blue" size="lg" />
                      <span className="ml-3 text-gray-600 text-lg">
                        {refetchingCalls
                          ? "Updating..."
                          : "Loading call history..."}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : isCallsError ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-red-500">
                      <svg
                        className="mx-auto h-12 w-12 text-red-400 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8V4m0 4v4m0 0v4m0-4h4m-4 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-lg font-medium">
                        Failed to load call history
                      </p>
                      <p className="text-sm text-red-400 mt-1">
                        {callsError?.response?.data?.message ||
                          callsError?.message ||
                          "Unable to fetch data from server"}
                      </p>
                      <button
                        onClick={() => refetch()}
                        className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : !callsData?.data?.data?.calls ||
                !Array.isArray(callsData?.data?.data?.calls) ||
                callsData?.data?.data?.calls < 1 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <p className="text-lg font-medium">
                        No call history found
                      </p>
                      <p className="text-sm text-gray-400">
                        No calls match your current filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                callsData?.data?.data?.calls?.map((call, index) => (
                  <tr
                    key={call?._id || index}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(activePage - 1) * perPage + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {call?.phoneNumber ||
                          call?.phoneNumberId?.name ||
                          "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {call?.assignedAgent?.username ||
                          call?.assignedAgent?.name ||
                          "Unassigned"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          call?.status
                        )}`}
                      >
                        {call?.status || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(call?.callDetails?.startTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(call?.callDetails?.duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      {call?.comment || "No Report"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {callsData?.data?.calls && callsData?.data?.calls?.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Showing {(activePage - 1) * perPage + 1} to{" "}
              {Math.min(
                activePage * perPage,
                callsData?.data?.pagination?.total || 0
              )}{" "}
              of {callsData?.data?.pagination?.total || 0} results
            </span>
            <Select
              value={perPage.toString()}
              onChange={(value) => {
                setPerPage(parseInt(value));
                setPage(1);
              }}
              data={[
                { label: "20 per page", value: "20" },
                { label: "50 per page", value: "50" },
                { label: "100 per page", value: "100" },
              ]}
              styles={{
                input: {
                  padding: "4px 8px",
                  fontSize: "14px",
                  minWidth: "120px",
                },
              }}
            />
          </div>

          {totalPages > 1 && (
            <Pagination
              page={activePage}
              onChange={setPage}
              total={totalPages}
              color="blue"
              size="sm"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CallHistory;
