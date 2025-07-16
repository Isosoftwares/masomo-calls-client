// ================================
// COMPONENTS/AGENTS/AGENTFILTERS.JS - Agent Filters
// ================================
import React from "react";
import { useForm } from "react-hook-form";

const AgentFilters = ({ filters, onFiltersChange }) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: filters,
  });

  const onSubmit = (data) => {
    onFiltersChange(data);
  };

  const handleReset = () => {
    const resetFilters = {
      status: "",
      department: "",
      isOnline: "",
    };
    reset(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Status
            </label>
            <select
              {...register("status")}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-white hover:border-gray-400 transition-all duration-200"
            >
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="break">Break</option>
              <option value="offline">Offline</option>
            </select>
          </div>

        
        </div>

        <div className="flex justify-end space-x-4 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md transition-all duration-200"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgentFilters;
