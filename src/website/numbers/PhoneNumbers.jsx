import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  Modal,
  Button,
  Group,
  Loader,
  Select,
  TextInput,
  Pagination,
} from "@mantine/core";
import { useDisclosure, useDebouncedState } from "@mantine/hooks";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import AddPhoneNumberModal from "./components/AddPhoneNumberModal";
import EditPhoneNumberModal from "./components/EditPhoneNumberModal";
import DeletePhoneNumberModal from "./components/DeletePhoneNumberModal";
import ViewPhoneNumberModal from "./components/ViewPhoneNumberModal";
import UpdateReportModal from "./components/UpdateReportModal";

const PhoneNumbers = () => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();

  // Modal states
  const [addModal, { open: addOpen, close: addClose }] = useDisclosure(false);
  const [editModal, { open: editOpen, close: editClose }] = useDisclosure(
    false
  );
  const [deleteModal, { open: deleteOpen, close: deleteClose }] = useDisclosure(
    false
  );
  const [viewModal, { open: viewOpen, close: viewClose }] = useDisclosure(
    false
  );
  const [reportModal, { open: reportOpen, close: reportClose }] = useDisclosure(
    false
  );

  // Pagination and search states
  const [perPage, setPerPage] = useState(60);
  const [activePage, setPage] = useState(1);
  const [phoneNumberSearch, setPhoneNumberSearch] = useDebouncedState("", 500);
  const [selectedNumber, setSelectedNumber] = useState(null);

  // Filter states
  const [schoolId, setSchoolId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Fetch phone numbers with pagination and search
  const getPhoneNumbers = () => {
    return axios.get(
      `/phone-numbers?page=${activePage}&perPage=${perPage}&phoneNumber=${phoneNumberSearch}&schoolId=${
        schoolId === null ? "" : schoolId
      }&categoryId=${categoryId === null ? "" : categoryId}`
    );
  };

  const {
    isLoading: loadingNumbers,
    data: numbersData,
    error: numbersError,
    isError: isNumbersError,
    refetch,
    isRefetching: refetchingNumbers,
  } = useQuery({
    queryFn: getPhoneNumbers,
    queryKey: [`phone-numbers`],
    keepPreviousData: true,
    retry: 2,
  });

  const totalPages = Math.ceil(numbersData?.data?.count / perPage);

  // Pagination refetch
  useEffect(() => {
    refetch();
  }, [activePage, perPage, phoneNumberSearch, schoolId, categoryId]);

  // Fetch categories for dropdown
  const getCategories = () => {
    return axios.get(`/categories`);
  };

  const {
    isLoading: loadingCategories,
    data: categoriesData,
    error: categoriesError,
    isError: isCategoriesError,
  } = useQuery({
    queryKey: [`allCategories-phone-numbers`],
    queryFn: getCategories,
    keepPreviousData: true,
    retry: 2,
  });

  let categories =
    categoriesData?.data?.categories?.map((category) => {
      const container = {};
      container.label = category?.name;
      container.value = category?._id;
      return container;
    }) || [];

  // Fetch schools for dropdown
  const getSchools = () => {
    return axios.get(`/schools`);
  };

  const {
    isLoading: loadingSchools,
    data: schoolsData,
    error: schoolsError,
    isError: isSchoolsError,
  } = useQuery({
    queryKey: [`allSchools-phone-numbers`],
    queryFn: getSchools,
    keepPreviousData: true,
    retry: 2,
  });

  let schools =
    schoolsData?.data?.schools?.map((school) => {
      const container = {};
      container.label = school?.name;
      container.value = school?._id;
      return container;
    }) || [];

  // Handle modal actions
  const handleView = (number) => {
    if (!number?._id) {
      toast.error("Invalid phone number selected");
      return;
    }
    setSelectedNumber(number);
    viewOpen();
  };

  const handleEdit = (number) => {
    if (!number?._id) {
      toast.error("Invalid phone number selected");
      return;
    }
    setSelectedNumber(number);
    editOpen();
  };

  const handleDelete = (number) => {
    if (!number?._id) {
      toast.error("Invalid phone number selected");
      return;
    }
    setSelectedNumber(number);
    deleteOpen();
  };

  const handleUpdateReport = (number) => {
    if (!number?._id) {
      toast.error("Invalid phone number selected");
      return;
    }
    setSelectedNumber(number);
    reportOpen();
  };

  // Modal close handlers with cleanup
  const handleAddClose = () => {
    addClose();
  };

  const handleEditClose = () => {
    editClose();
    setSelectedNumber(null);
  };

  const handleDeleteClose = () => {
    deleteClose();
    setSelectedNumber(null);
  };

  const handleViewClose = () => {
    viewClose();
    setSelectedNumber(null);
  };

  const handleReportClose = () => {
    reportClose();
    setSelectedNumber(null);
  };

  // Clear filters
  const clearFilters = () => {
    setSchoolId("");
    setCategoryId("");
    setPhoneNumberSearch("");
    setPage(1);
  };

  const hasActiveFilters = schoolId || categoryId || phoneNumberSearch;

  return (
    <div className="">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-100 bg-light p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Phone Numbers</h2>
            <p className="text-gray-600 mt-1">
              Manage your phone number inventory
            </p>
            {/* Show error indicators */}
            {(isCategoriesError || isSchoolsError) && (
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
                {isCategoriesError && "Categories unavailable"}{" "}
                {isCategoriesError && isSchoolsError && "• "}{" "}
                {isSchoolsError && "Schools unavailable"}
              </p>
            )}
          </div>
          <button
            onClick={addOpen}
            disabled={isCategoriesError || isSchoolsError}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
          >
            + Add Phone Number
          </button>
        </div>

        {/* Search and Filters Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
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
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Phone Number Search */}
              <div className="flex-1 min-w-0">
                <TextInput
                  placeholder="Search by phone number..."
                  value={phoneNumberSearch}
                  onChange={(event) =>
                    setPhoneNumberSearch(event.currentTarget.value)
                  }
                  size="lg"
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

              {/* School Filter */}
              <div className="flex-1 min-w-0">
                <Select
                  placeholder="Filter by School"
                  value={schoolId}
                  onChange={(value) => setSchoolId(value || "")}
                  data={[{ label: "All Schools", value: "" }, ...schools]}
                  clearable
                  searchable
                  disabled={isSchoolsError || loadingSchools}
                  size="lg"
                />
              </div>

              {/* Category Filter */}
              <div className="flex-1 min-w-0">
                <Select
                  placeholder="Filter by Category"
                  value={categoryId}
                  onChange={(value) => setCategoryId(value || "")}
                  data={[{ label: "All Categories", value: "" }, ...categories]}
                  clearable
                  searchable
                  disabled={isCategoriesError || loadingCategories}
                  size="lg"
                />
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-400 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap"
                >
                  Clear All
                </button>
              )}
            </div>
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
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  School
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Report Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loadingNumbers || refetchingNumbers ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <Loader color="blue" size="lg" />
                      <span className="ml-3 text-gray-600 text-lg">
                        {refetchingNumbers
                          ? "Updating..."
                          : "Loading phone numbers..."}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : isNumbersError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
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
                        Failed to load phone numbers
                      </p>
                      <p className="text-sm text-red-400 mt-1">
                        {numbersError?.response?.data?.message ||
                          numbersError?.message ||
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
              ) : numbersData?.data?.message ||
                !numbersData?.data?.phoneNumbers ||
                !Array.isArray(numbersData?.data?.phoneNumbers) ||
                numbersData?.data?.phoneNumbers?.length < 1 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
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
                        No phone numbers found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                numbersData?.data?.phoneNumbers?.map((number, index) => (
                  <tr
                    key={number?._id || index}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(activePage - 1) * perPage + index + 1}
                    </td>
                    <td className="px-1 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        <h1>{number?.name || "N/A"}</h1>
                        <h1>{number?.phoneNumber || "N/A"}</h1>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {number?.categoryId?.name || ""}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {number?.schoolId?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          number?.report
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {number?.report ? "Has Report" : "No Report"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleView(number)}
                          className="bg-green-400  text-gray-100 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(number)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150"
                        >
                          Edit
                        </button>
                        {/* <button
                          onClick={() => handleUpdateReport(number)}
                          className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150"
                        >
                          Report
                        </button> */}
                        <button
                          onClick={() => handleDelete(number)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {numbersData?.data?.phoneNumbers &&
        numbersData?.data?.phoneNumbers?.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Showing {(activePage - 1) * perPage + 1} to{" "}
                {Math.min(activePage * perPage, numbersData?.data?.count || 0)}{" "}
                of {numbersData?.data?.count || 0} results
              </span>
              <Select
                value={perPage.toString()}
                onChange={(value) => {
                  setPerPage(parseInt(value));
                  setPage(1);
                }}
                data={[
                  { label: "30 per page", value: "30" },
                  { label: "60 per page", value: "60" },
                  { label: "90 per page", value: "90" },
                  { label: "120 per page", value: "120" },
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

      {/* Modals */}
      <AddPhoneNumberModal
        opened={addModal}
        onClose={handleAddClose}
        categories={categories}
        schools={schools}
        queryClient={queryClient}
      />

      {selectedNumber && (
        <>
          <EditPhoneNumberModal
            opened={editModal}
            onClose={handleEditClose}
            phoneNumber={selectedNumber}
            categories={categories}
            schools={schools}
            queryClient={queryClient}
          />

          <DeletePhoneNumberModal
            opened={deleteModal}
            onClose={handleDeleteClose}
            phoneNumber={selectedNumber}
            queryClient={queryClient}
          />

          <ViewPhoneNumberModal
            opened={viewModal}
            onClose={handleViewClose}
            phoneNumber={selectedNumber}
          />

          <UpdateReportModal
            opened={reportModal}
            onClose={handleReportClose}
            phoneNumber={selectedNumber}
            queryClient={queryClient}
          />
        </>
      )}
    </div>
  );
};

export default PhoneNumbers;
