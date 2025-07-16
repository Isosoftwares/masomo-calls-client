import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader, Select, TextInput, Pagination } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { DateInput } from "@mantine/dates";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const CallHistoryByNumber = ({ phoneNumber }) => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();

  // Pagination and search states
  const [perPage, setPerPage] = useState(10);
  const [activePage, setPage] = useState(1);

  // Fetch call history with pagination and phone number filter
  const getCallHistory = () => {
    const params = new URLSearchParams();
    params.append("page", activePage);
    params.append("limit", perPage);

    // Only add phone number filter if we have a phone number
    if (phoneNumber) {
      params.append("twilioNumber", phoneNumber);
    }

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
    queryKey: [`call-history`, phoneNumber, activePage, perPage],
    keepPreviousData: true,
    retry: 2,
    enabled: !!phoneNumber, // Only fetch if we have a phone number
  });

  const totalPages = Math.ceil(
    (callsData?.data?.pagination?.total || 0) / perPage
  );

  // Reset page when phone number changes
  useEffect(() => {
    setPage(1);
  }, [phoneNumber]);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  // Helper function to format duration
  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0s";
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

  // No phone number selected state
  if (!phoneNumber) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Phone Number Selected
        </h3>
        <p className="text-gray-600">
          Please select a phone number to view call history
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Call History</h2>
            <p className="text-gray-600 mt-1">
              Call history for:{" "}
              <span className="font-semibold text-gray-900">{phoneNumber}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-h-[450px] overflow-auto rounded-lg border border-gray-200">
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
                  Twilio No
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
                        No calls found for this phone number
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
                      {call?.callDetails?.twilioNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      {call?.comment || "No cReport"}
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

export default CallHistoryByNumber;
