import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Modal, Loader } from "@mantine/core";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

const EditProfileModal = ({ opened, onClose, user, queryClient, userId }) => {
  const axios = useAxiosPrivate();
  const [skillsInput, setSkillsInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  // Set default values when modal opens
  useEffect(() => {
    if (user && opened) {
      setValue("firstName", user?.profile?.firstName || "");
      setValue("lastName", user?.profile?.lastName || "");
      setValue("department", user?.profile?.department || "");
      setValue("phoneExtension", user?.profile?.phoneExtension || "");

      // Handle skills array
      const skillsString = user?.profile?.skills?.join(", ") || "";
      setSkillsInput(skillsString);
    }
  }, [user, opened, setValue]);

  // Update profile mutation
  const updateProfile = (data) => {
    return axios.patch(`/auth/profile`, data);
  };

  const { mutate: updateProfileMutate, isLoading: loadingUpdate } = useMutation(
    {
      mutationFn: updateProfile,
      onSuccess: (response) => {
        toast.success(
          response?.data?.message || "Profile updated successfully"
        );
        queryClient.invalidateQueries([`user-profile`, userId]);
        onClose();
        reset();
        setSkillsInput("");
      },
      onError: (err) => {
        console.log(err);
        const text = err?.response?.data?.message || "Something went wrong";
        toast.error(text);
      },
    }
  );

  const submitProfile = (data) => {
    // Process skills string into array
    const skillsArray = skillsInput
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    const profileData = {
      userId: userId,
      profile: {
        firstName: data.firstName,
        lastName: data.lastName,
        department: data.department,
        phoneExtension: data.phoneExtension,
        skills: skillsArray,
      },
    };

    updateProfileMutate(profileData);
  };

  const handleClose = () => {
    reset();
    setSkillsInput("");
    onClose();
  };

  if (!user) return null;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900">Edit Profile</span>
        </div>
      }
      centered
      size="lg"
      styles={{
        content: { borderRadius: "12px" },
        header: { borderBottom: "1px solid #e5e7eb", paddingBottom: "16px" },
      }}
    >
      <form onSubmit={handleSubmit(submitProfile)} className="space-y-6">
        {/* Current User Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-600"
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
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-800">
                Editing Profile
              </h3>
              <p className="text-lg font-bold text-blue-900">
                {user?.username || "Unknown User"}
              </p>
              <p className="text-sm text-blue-700">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              First Name
            </label>
            <input
              type="text"
              placeholder="Enter first name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              {...register("firstName", {
                required: "First name is required",
                minLength: {
                  value: 2,
                  message: "First name must be at least 2 characters",
                },
              })}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs font-medium">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              placeholder="Enter last name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              {...register("lastName", {
                required: "Last name is required",
                minLength: {
                  value: 2,
                  message: "Last name must be at least 2 characters",
                },
              })}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs font-medium">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Work Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Department
            </label>
            <input
              type="text"
              placeholder="Enter department"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              {...register("department")}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Phone Extension
            </label>
            <input
              type="text"
              placeholder="Enter phone extension"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              {...register("phoneExtension", {
                pattern: {
                  value: /^[0-9+\-\s()]*$/,
                  message: "Please enter a valid phone extension",
                },
              })}
            />
            {errors.phoneExtension && (
              <p className="text-red-500 text-xs font-medium">
                {errors.phoneExtension.message}
              </p>
            )}
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Skills
          </label>
          <textarea
            placeholder="Enter skills separated by commas (e.g., JavaScript, Customer Service, Project Management)"
            rows={3}
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-vertical"
          />
          <p className="text-xs text-gray-500">
            Separate multiple skills with commas. Current skills will be
            replaced with the new list.
          </p>
        </div>

        {/* Preview Skills */}
        {skillsInput && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Skills Preview:
            </p>
            <div className="flex flex-wrap gap-2">
              {skillsInput
                .split(",")
                .map((skill) => skill.trim())
                .filter((skill) => skill.length > 0)
                .map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {skill}
                  </span>
                ))}
            </div>
          </div>
        )}

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
            <div className="flex items-center px-6 py-2.5 bg-blue-600 rounded-lg">
              <Loader color="white" size="sm" />
              <span className="ml-2 text-white font-medium">Updating...</span>
            </div>
          ) : (
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Update Profile
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
