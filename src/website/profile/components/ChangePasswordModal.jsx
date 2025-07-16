import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Modal, Loader } from "@mantine/core";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

const ChangePasswordModal = ({ opened, onClose, userId }) => {
  const axios = useAxiosPrivate();
  const [visiblePassword, setVisiblePassword] = useState(false);

  // Password form validation rules
  const validationSchema = Yup.object().shape({
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: Yup.string()
      .required("Confirm Password is required")
      .oneOf([Yup.ref("password")], "Passwords must match"),
  });

  const formOptions = { resolver: yupResolver(validationSchema) };

  // Get functions to build form with useForm() hook
  const { register, handleSubmit, reset, formState } = useForm(formOptions);
  const { errors } = formState;

  // Change password mutation
  const changePassword = (data) => {
    return axios.patch(`/auth/change-pass`, data);
  };

  const {
    mutate: changePassMutate,
    isLoading: loadingChangePass,
  } = useMutation({
    mutationFn: changePassword,
    onSuccess: (response) => {
      const text = response?.data?.message || "Password changed successfully";
      toast.success(text);
      handleClose();
    },
    onError: (err) => {
      const text = err?.response?.data?.message || "Something went wrong";
      toast.error(text);
    },
  });

  const handlePasswordChange = (data) => {
    data.userId = userId;
    changePassMutate(data);
  };

  const handleClose = () => {
    reset();
    setVisiblePassword(false);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900">
            Change Password
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
      <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-6">
        {/* Security Notice */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 text-orange-600 mt-0.5">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.351 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-orange-800">
                Security Reminder
              </h3>
              <p className="text-sm text-orange-700 mt-1">
                Use a strong, memorable password with at least 6 characters.
              </p>
            </div>
          </div>
        </div>

        {/* New Password Field */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            New Password
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div
            className={`flex items-center border rounded-lg transition-colors duration-200 ${
              errors?.password
                ? "border-red-500 focus-within:border-red-500"
                : "border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
            } ${loadingChangePass ? "bg-gray-100" : "bg-white"}`}
          >
            <input
              type={visiblePassword ? "text" : "password"}
              {...register("password")}
              placeholder="Enter new password"
              disabled={loadingChangePass}
              className="flex-1 px-4 py-3 outline-none bg-transparent disabled:cursor-not-allowed disabled:text-gray-500"
            />
            <button
              type="button"
              onClick={() => setVisiblePassword(!visiblePassword)}
              disabled={loadingChangePass}
              className="px-3 py-3 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
            >
              {visiblePassword ? (
                <AiOutlineEyeInvisible className="w-5 h-5" />
              ) : (
                <AiOutlineEye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Confirm Password
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div
            className={`flex items-center border rounded-lg transition-colors duration-200 ${
              errors?.confirmPassword
                ? "border-red-500 focus-within:border-red-500"
                : "border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
            } ${loadingChangePass ? "bg-gray-100" : "bg-white"}`}
          >
            <input
              type={visiblePassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Repeat new password"
              disabled={loadingChangePass}
              className="flex-1 px-4 py-3 outline-none bg-transparent disabled:cursor-not-allowed disabled:text-gray-500"
            />
            <button
              type="button"
              onClick={() => setVisiblePassword(!visiblePassword)}
              disabled={loadingChangePass}
              className="px-3 py-3 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
            >
              {visiblePassword ? (
                <AiOutlineEyeInvisible className="w-5 h-5" />
              ) : (
                <AiOutlineEye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs font-medium">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={loadingChangePass}
            className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          {loadingChangePass ? (
            <div className="flex items-center px-6 py-2.5 bg-orange-600 rounded-lg">
              <Loader color="white" size="sm" />
              <span className="ml-2 text-white font-medium">Updating...</span>
            </div>
          ) : (
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Change Password
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;
