import React from "react";

function CallLogRow({ call }) {
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

  return (
    <div>
      <tr className="hover:bg-gray-50 transition-colors duration-150">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {(activePage - 1) * perPage + index + 1}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-semibold text-gray-900">
            {call?.phoneNumber || call?.phoneNumberId?.name || "N/A"}
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
          <div className="flex justify-center space-x-2">
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150">
              View Details
            </button>
          </div>
        </td>
      </tr>
    </div>
  );
}

export default CallLogRow;
