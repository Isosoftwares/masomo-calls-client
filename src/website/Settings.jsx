// ================================
// PAGES/SETTINGS.JS - Settings Page
// ================================
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI, notificationsAPI } from "../services/api";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const queryClient = useQueryClient();

  const tabs = [
    { id: "profile", name: "Profile", icon: UserIcon },
    // { id: "notifications", name: "Notifications", icon: BellIcon },
    { id: "security", name: "Security", icon: ShieldCheckIcon },
    // { id: "preferences", name: "Preferences", icon: Cog6ToothIcon },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all duration-200
                  ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6">
          {activeTab === "profile" && <ProfileSettings />}
          {/* {activeTab === "notifications" && <NotificationSettings />} */}
          {activeTab === "security" && <SecuritySettings />}
          {/* {activeTab === "preferences" && <PreferencesSettings />} */}
        </div>
      </div>
    </div>
  );
};

// Profile Settings Component
const ProfileSettings = () => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: authAPI.getProfile,
    retry: 1,
  });

  const updateProfileMutation = useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries(["profile"]);
    },
    onError: (error) => {
      toast.error(error.error?.message || "Failed to update profile");
    },
  });

  const onSubmit = (data) => {
    updateProfileMutation.mutate({ profile: data });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  const profileData = profile?.data?.profile || {};

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            First Name
          </label>
          <input
            type="text"
            {...register("firstName", { required: "First name is required" })}
            defaultValue={profileData.firstName}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-white hover:border-gray-400 transition-all duration-200"
          />
          {errors.firstName && (
            <p className="mt-2 text-sm text-red-600">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Last Name
          </label>
          <input
            type="text"
            {...register("lastName", { required: "Last name is required" })}
            defaultValue={profileData.lastName}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-white hover:border-gray-400 transition-all duration-200"
          />
          {errors.lastName && (
            <p className="mt-2 text-sm text-red-600">
              {errors.lastName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Department
          </label>
          <select
            {...register("department")}
            defaultValue={profileData.department}
            className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-white hover:border-gray-400 transition-all duration-200"
          >
            <option value="">Select Department</option>
            <option value="Customer Service">Customer Service</option>
            <option value="Sales">Sales</option>
            <option value="Technical Support">Technical Support</option>
            <option value="Billing">Billing</option>
            <option value="Management">Management</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Phone Extension
          </label>
          <input
            type="text"
            {...register("phoneExtension")}
            defaultValue={profileData.phoneExtension}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-white hover:border-gray-400 transition-all duration-200"
            placeholder="e.g., 1234"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Skills (comma-separated)
        </label>
        <input
          type="text"
          {...register("skills")}
          defaultValue={profileData.skills?.join(", ")}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-white hover:border-gray-400 transition-all duration-200"
          placeholder="customer_service, technical_support, billing"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={updateProfileMutation.isPending}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md transition-all duration-200"
        >
          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

// Notification Settings Component
const NotificationSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["notification-settings"],
    queryFn: notificationsAPI.getSettings,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: notificationsAPI.updateSettings,
    onSuccess: () => {
      toast.success("Notification settings updated");
      queryClient.invalidateQueries(["notification-settings"]);
    },
    onError: (error) => {
      toast.error(error.error?.message || "Failed to update settings");
    },
  });

  const handleToggle = (setting) => {
    const newSettings = {
      ...settings?.data,
      [setting]: !settings?.data?.[setting],
    };
    updateSettingsMutation.mutate(newSettings);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  const settingsData = settings?.data || {};

  const notificationOptions = [
    {
      id: "incomingCalls",
      label: "Incoming Calls",
      description: "Get notified when you receive incoming calls",
    },
    {
      id: "queueUpdates",
      label: "Queue Updates",
      description: "Notifications about queue status changes",
    },
    {
      id: "systemMessages",
      label: "System Messages",
      description: "Important system announcements and alerts",
    },
    {
      id: "emailNotifications",
      label: "Email Notifications",
      description: "Receive notifications via email",
    },
    {
      id: "soundAlerts",
      label: "Sound Alerts",
      description: "Play sounds for important notifications",
    },
  ];

  return (
    <div className="space-y-6">
      {notificationOptions.map((option) => (
        <div
          key={option.id}
          className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0"
        >
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">
              {option.label}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{option.description}</p>
          </div>
          <button
            onClick={() => handleToggle(option.id)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              settingsData[option.id] ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settingsData[option.id] ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );
};

// Security Settings Component
const SecuritySettings = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const changePasswordMutation = useMutation({
    mutationFn: (data) => {
      // This would need to be implemented in the API
      return Promise.resolve();
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error) => {
      toast.error("Failed to change password");
    },
  });

  const onSubmit = (data) => {
    changePasswordMutation.mutate(data);
  };

  const newPassword = watch("newPassword");

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Change Password
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Current Password
            </label>
            <input
              type="password"
              {...register("currentPassword", {
                required: "Current password is required",
              })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-white hover:border-gray-400 transition-all duration-200"
            />
            {errors.currentPassword && (
              <p className="mt-2 text-sm text-red-600">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              New Password
            </label>
            <input
              type="password"
              {...register("newPassword", {
                required: "New password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-white hover:border-gray-400 transition-all duration-200"
            />
            {errors.newPassword && (
              <p className="mt-2 text-sm text-red-600">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === newPassword || "Passwords do not match",
              })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-white hover:border-gray-400 transition-all duration-200"
            />
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {changePasswordMutation.isPending
              ? "Changing..."
              : "Change Password"}
          </button>
        </form>
      </div>

      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Two-Factor Authentication
        </h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-700">
            Two-factor authentication is not yet enabled. This feature will be
            available in a future update.
          </p>
        </div>
      </div>
    </div>
  );
};

// Preferences Settings Component
const PreferencesSettings = () => {
  const [preferences, setPreferences] = useState({
    theme: "light",
    language: "en",
    timezone: "UTC",
    callVolume: 50,
    autoAnswer: false,
    defaultQueue: "",
  });

  const handlePreferenceChange = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    // In a real app, this would save to the backend
    toast.success("Preference updated");
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Display Preferences
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Theme
            </label>
            <select
              value={preferences.theme}
              onChange={(e) => handlePreferenceChange("theme", e.target.value)}
              className="w-full max-w-xs px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-white hover:border-gray-400 transition-all duration-200"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Language
            </label>
            <select
              value={preferences.language}
              onChange={(e) =>
                handlePreferenceChange("language", e.target.value)
              }
              className="w-full max-w-xs px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-white hover:border-gray-400 transition-all duration-200"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Timezone
            </label>
            <select
              value={preferences.timezone}
              onChange={(e) =>
                handlePreferenceChange("timezone", e.target.value)
              }
              className="w-full max-w-xs px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-white hover:border-gray-400 transition-all duration-200"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Call Preferences
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Call Volume
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={preferences.callVolume}
              onChange={(e) =>
                handlePreferenceChange("callVolume", e.target.value)
              }
              className="w-full max-w-xs h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            />
            <div className="text-sm text-gray-600 mt-2">
              {preferences.callVolume}%
            </div>
          </div>

          <div className="flex items-center justify-between py-4 border border-gray-200 rounded-lg px-4 bg-gray-50">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Auto Answer
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                Automatically answer incoming calls
              </p>
            </div>
            <button
              onClick={() =>
                handlePreferenceChange("autoAnswer", !preferences.autoAnswer)
              }
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                preferences.autoAnswer ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  preferences.autoAnswer ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
