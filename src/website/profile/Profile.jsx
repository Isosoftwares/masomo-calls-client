import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import ChangePasswordModal from "./components/ChangePasswordModal";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import EditProfileModal from "./components/EditProfileModal";

function Profile() {
  const { auth } = useAuth();
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();

  // Modal states
  const [editModal, { open: editOpen, close: editClose }] = useDisclosure(
    false
  );
  const [
    passwordModal,
    { open: passwordOpen, close: passwordClose },
  ] = useDisclosure(false);

  // Fetch user data
  const getUser = async () => {
    return await axios.get(`/auth/profile/${auth?.userId}`);
  };

  const {
    isLoading: loadingUser,
    data: userData,
    error: userError,
    isError: isUserError,
  } = useQuery({
    queryFn: getUser,
    queryKey: [`user-profile`, auth?.userId],
    keepPreviousData: true,
    retry: 2,
    enabled: !!auth?.userId,
  });

  const user = userData?.data?.data;

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get initials for avatar
  const getInitials = () => {
    const firstName = user?.profile?.firstName || "";
    const lastName = user?.profile?.lastName || "";
    const username = user?.username || "";

    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return username.charAt(0).toUpperCase();
  };

  // Format skills array
  const formatSkills = (skills) => {
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return "No skills listed";
    }
    return skills.join(", ");
  };

  // Get role color
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "supervisor":
        return "bg-purple-100 text-purple-800";
      case "agent":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader color="blue" size="lg" />
          <span className="text-lg text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (isUserError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="mx-auto h-16 w-16 text-red-400 mb-4"
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Failed to load profile
          </h2>
          <p className="text-gray-600 mb-4">
            {userError?.response?.data?.message ||
              userError?.message ||
              "Unable to fetch profile data"}
          </p>
          <button
            onClick={() =>
              queryClient.invalidateQueries([`user-profile`, auth?.userId])
            }
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4">
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="text-center">
                {/* Avatar */}
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">
                    {getInitials()}
                  </span>
                </div>

                {/* Name and Role */}
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {user?.profile?.firstName && user?.profile?.lastName
                    ? `${user.profile.firstName} ${user.profile.lastName}`
                    : user?.username || "Unknown User"}
                </h2>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                    user?.role
                  )}`}
                >
                  {user?.role?.charAt(0)?.toUpperCase() +
                    user?.role?.slice(1) || "Unknown Role"}
                </span>

                {/* Status */}
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      user?.isActive ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {user?.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={editOpen}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={passwordOpen}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    First Name
                  </label>
                  <p className="text-gray-900 mt-1">
                    {user?.profile?.firstName || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Last Name
                  </label>
                  <p className="text-gray-900 mt-1">
                    {user?.profile?.lastName || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Username
                  </label>
                  <p className="text-gray-900 mt-1">
                    {user?.username || "Not available"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Email
                  </label>
                  <p className="text-gray-900 mt-1">
                    {user?.email || "Not available"}
                  </p>
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z"
                  />
                </svg>
                Work Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Department
                  </label>
                  <p className="text-gray-900 mt-1">
                    {user?.profile?.department || "Not assigned"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Phone No
                  </label>
                  <p className="text-gray-900 mt-1">
                    {user?.profile?.phoneExtension || "Not provided"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">
                    Skills
                  </label>
                  <p className="text-gray-900 mt-1">
                    {formatSkills(user?.profile?.skills)}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Account Activity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Last Login
                  </label>
                  <p className="text-gray-900 mt-1">
                    {formatDate(user?.lastLogin)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Account Created
                  </label>
                  <p className="text-gray-900 mt-1">
                    {formatDate(user?.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <EditProfileModal
          opened={editModal}
          onClose={editClose}
          user={user}
          queryClient={queryClient}
          userId={auth?.userId}
        />

        <ChangePasswordModal
          opened={passwordModal}
          onClose={passwordClose}
          userId={auth?.userId}
        />
      </div>
    </div>
  );
}

export default Profile;
