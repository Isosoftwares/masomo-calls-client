import React from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { Modal, Loader, Select } from "@mantine/core";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

const AddPhoneNumberModal = ({
  opened,
  onClose,
  categories,
  schools,
  queryClient,
}) => {
  const axios = useAxiosPrivate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm();

  // Add phone number mutation
  const addPhoneNumber = (data) => {
    return axios.post(`/phone-numbers`, data);
  };

  const { mutate: addPhoneNumberMutate, isPending: loadingAdd } = useMutation({
    mutationFn: addPhoneNumber,
    onSuccess: (response) => {
      toast.success(
        response?.data?.message || "Phone number added successfully"
      );
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

  const submitPhoneNumber = (data) => {
    addPhoneNumberMutate(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <div className="text-xl font-bold text-gray-900">
          Add New Phone Number
        </div>
      }
      centered
      size="md"
      styles={{
        content: { borderRadius: "12px" },
        header: { borderBottom: "1px solid #e5e7eb", paddingBottom: "16px" },
      }}
    >
      <form onSubmit={handleSubmit(submitPhoneNumber)} className="space-y-6">
        {/* Phone Number Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Phone Number *
          </label>
          <input
            type="text"
            placeholder="Enter phone number (e.g., +1234567890)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            {...register("phoneNumber", {
              required: "Phone number is required",
              pattern: {
                value: /^[\+]?[0-9\s\-\(\)]+$/,
                message: "Please enter a valid phone number",
              },
            })}
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-xs font-medium">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Name
          </label>
          <input
            type="text"
            placeholder="Enter name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            {...register("name", {
              required: "Name is required",
            })}
          />
          {errors.name && (
            <p className="text-red-500 text-xs font-medium">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Category *
          </label>
          <Controller
            name="categoryId"
            control={control}
            rules={{ required: "Category is required" }}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Select a category"
                data={categories}
                searchable
                clearable
                size="lg"
              />
            )}
          />
          {errors.categoryId && (
            <p className="text-red-500 text-xs font-medium">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        {/* School Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            School *
          </label>
          <Controller
            name="schoolId"
            control={control}
            rules={{ required: "School is required" }}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Select a school"
                data={schools}
                searchable
                clearable
                size="lg"
              />
            )}
          />
          {errors.schoolId && (
            <p className="text-red-500 text-xs font-medium">
              {errors.schoolId.message}
            </p>
          )}
        </div>

        {/* Report Field */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Report
          </label>
          <textarea
            placeholder="Enter report details (optional)"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-vertical"
            {...register("report")}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
          >
            Cancel
          </button>
          {loadingAdd ? (
            <div className="flex items-center px-6 py-2.5 bg-blue-600 rounded-lg">
              <Loader color="white" size="sm" />
              <span className="ml-2 text-white font-medium">Adding...</span>
            </div>
          ) : (
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Add Phone Number
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default AddPhoneNumberModal;
