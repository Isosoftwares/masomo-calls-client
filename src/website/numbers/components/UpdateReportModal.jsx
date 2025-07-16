import React, { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Modal, Loader } from "@mantine/core";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

const UpdateReportModal = ({ opened, onClose, phoneNumber, queryClient }) => {
  const axios = useAxiosPrivate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  // Set default values when modal opens
  useEffect(() => {
    if (phoneNumber && opened) {
      setValue("report", phoneNumber.report || "");
    }
  }, [phoneNumber, opened, setValue]);

  // Update report mutation
  const updateReport = (data) => {
    return axios.patch(`/phone-numbers/report`, {
      phoneNumberId: phoneNumber._id,
      report: data.report,
    });
  };

  const { mutate: updateReportMutate, isLoading: loadingUpdate } = useMutation({
    mutationFn: updateReport,
    onSuccess: (response) => {
      toast.success(response?.data?.message || "Report updated successfully");
      queryClient.invalidateQueries(["phone-numbers"]);
      onClose();
      reset();
    },
    onError: (err) => {
      console.log(err);
      const text = err?.response?.data?.message || "Something went wrong";
      toast.error(text);
    },
  });

  const submitReport = (data) => {
    updateReportMutate(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!phoneNumber) return null;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900">Update Report</span>
        </div>
      }
      centered
      size="md"
      styles={{
        content: { borderRadius: "12px" },
        header: { borderBottom: "1px solid #e5e7eb", paddingBottom: "16px" },
      }}
    >
      <form onSubmit={handleSubmit(submitReport)} className="space-y-6">
        {/* Phone Number Info */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-purple-800">
                Phone Number
              </h3>
              <p className="text-lg font-bold text-purple-900">
                {phoneNumber.name}
              </p>
            </div>
          </div>
        </div>

        {/* Current Report Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Current Status:
          </h4>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              phoneNumber.report
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {phoneNumber.report ? "Has Report" : "No Report"}
          </span>

          {phoneNumber.report && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-1">Current report:</p>
              <div className="bg-white border border-gray-200 rounded p-2 text-sm text-gray-900">
                {phoneNumber.report}
              </div>
            </div>
          )}
        </div>

        {/* Report Field */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Report Details
          </label>
          <textarea
            placeholder="Enter detailed report information..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 resize-vertical"
            {...register("report", {
              required: "Report details are required",
            })}
          />
          {errors.report && (
            <p className="text-red-500 text-xs font-medium">
              {errors.report.message}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Provide comprehensive details about this phone number's status,
            usage, or any relevant information.
          </p>
        </div>

        {/* Character Count */}
        <div className="text-right">
          <span className="text-xs text-gray-500">
            Minimum 10 characters recommended for detailed reports
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={loadingUpdate}
            className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          {loadingUpdate ? (
            <div className="flex items-center px-6 py-2.5 bg-purple-600 rounded-lg">
              <Loader color="white" size="sm" />
              <span className="ml-2 text-white font-medium">Updating...</span>
            </div>
          ) : (
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Update Report
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default UpdateReportModal;
