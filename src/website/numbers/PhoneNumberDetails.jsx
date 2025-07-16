import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "@mantine/core";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

function PhoneNumberDetails({ phoneNumber }) {
  const axios = useAxiosPrivate();

  // Fetch detailed phone number data with populated fields
  const getPhoneNumberDetails = async () => {
    return await axios.get(`/phone-numbers/one-by-phone/${phoneNumber}`);
  };
  const {
    isLoading: loadingDetails,
    data: detailsData,
    error: detailsError,
    isError: isDetailsError,
  } = useQuery({
    queryFn: getPhoneNumberDetails,
    queryKey: [`phone-number-details`, phoneNumber],
    keepPreviousData: true,
    retry: 2,
    enabled: !!phoneNumber,
  });

  const numberDetails = detailsData?.data?.phoneNumber || {};

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color
  const getStatusColor = (report) => {
    return report
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

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
          Please select a phone number to view details
        </p>
      </div>
    );
  }

  if (loadingDetails) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-center space-x-3">
          <Loader color="blue" size="lg" />
          <span className="text-lg text-gray-600">
            Loading phone number details...
          </span>
        </div>
      </div>
    );
  }

  if (isDetailsError) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
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
          <h3 className="text-lg font-medium text-red-900 mb-2">
            Failed to load details
          </h3>
          <p className="text-red-600 mb-4">
            {detailsError?.response?.data?.message ||
              detailsError?.message ||
              "Unable to fetch phone number details"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Phone Number Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Phone Number Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Phone Number
            </label>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {numberDetails?.phoneNumber || "Not available"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Name</label>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {numberDetails?.name || "Not available"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Category
            </label>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {numberDetails?.categoryId?.name || "Not available"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Category Desc
            </label>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {numberDetails?.categoryId?.description || "No Desc"}
            </p>
          </div>
        </div>
        {numberDetails?.schoolId ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-green-700">
                  School Name
                </label>
                <p className="text-lg font-semibold text-green-900 mt-1">
                  {numberDetails?.schoolId?.name || "Not available"}
                </p>
              </div>

              <div className="">
                <label className="text-sm font-medium text-green-700">
                  Description
                </label>
                <p className="text-green-900 mt-1">
                  {numberDetails?.schoolId?.description || "No desc"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-center py-4">
            <p>No school information available</p>
          </div>
        )}

        <div className="bg-orange-50 border border-orange-200 mt-3 rounded-lg p-4">
          <label className="text-sm font-medium text-orange-700">
            Report Content
          </label>
          <div className="mt-2  rounded p-3 border border-orange-300">
            <p className="text-gray-900 whitespace-pre-wrap">
              {numberDetails?.report || " No report"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhoneNumberDetails;
