import React from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Modal, Loader } from "@mantine/core";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

const DeletePhoneNumberModal = ({
  opened,
  onClose,
  phoneNumber,
  queryClient,
}) => {
  const axios = useAxiosPrivate();

  // Delete phone number mutation
  const deletePhoneNumber = () => {
    return axios.delete(`/phone-numbers/delete/${phoneNumber._id}`);
  };

  const {
    mutate: deletePhoneNumberMutate,
    isPending: loadingDelete,
  } = useMutation({
    mutationFn: deletePhoneNumber,
    onSuccess: (response) => {
      toast.success(
        response?.data?.message || "Phone number deleted successfully"
      );
      queryClient.invalidateQueries(["phone-numbers"]);
      onClose();
    },
    onError: (err) => {
      console.log(err);
      const text = err?.response?.data?.message || "Something went wrong";
      toast.error(text);
    },
  });

  const handleDelete = () => {
    deletePhoneNumberMutate();
  };

  if (!phoneNumber) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-red-600"
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
          </div>
          <span className="text-xl font-bold text-gray-900">
            Delete Phone Number
          </span>
        </div>
      }
      centered
      size="md"
      styles={{
        content: { borderRadius: "12px" },
        header: { borderBottom: "1px solid #e5e7eb", paddingBottom: "16px" },
      }}
    >
      <div className="space-y-6">
        {/* Warning Message */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
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
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                This action cannot be undone
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>This will permanently delete the phone number.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Phone Number Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Phone Number to Delete:
          </h4>
          <div className="space-y-1">
            <p className="text-lg font-bold text-gray-900">
              {phoneNumber.name} {phoneNumber.phoneNumber}
            </p>
            <p className="text-sm text-gray-600">
              This phone number will be permanently removed from the system.
            </p>
          </div>
        </div>

        {/* Confirmation Text */}
        <div className="text-center">
          <p className="text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">
              "{phoneNumber.name}"
            </span>
            ?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loadingDelete}
            className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          {loadingDelete ? (
            <div className="flex items-center px-6 py-2.5 bg-red-600 rounded-lg">
              <Loader color="white" size="sm" />
              <span className="ml-2 text-white font-medium">Deleting...</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleDelete}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Delete Phone Number
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DeletePhoneNumberModal;
