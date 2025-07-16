import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Send, Loader } from "lucide-react";
import { toast } from "react-toastify";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

function AddCallReport({ callId, closeModal, TwilioNumber }) {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      comment: "",
    },
  });

  // Mutation for submitting call report
  const submitCallReportMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("/record-calls/add-comment", {
        callId,
        comment: data.comment,
        twilioNumber: TwilioNumber,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Call report submitted successfully");
      reset();
      queryClient.invalidateQueries(["call-history", TwilioNumber]);
      closeModal();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to submit call report. Please try again."
      );
    },
  });

  const onSubmit = (data) => {
    submitCallReportMutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    closeModal();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Add Call Report</h2>
        <button
          onClick={handleClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={submitCallReportMutation.isPending}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Call ID Display */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Call ID
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
            {callId}
          </div>
        </div>

        {/* Comment Field */}
        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Comment <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment"
            rows={4}
            placeholder="Enter your call report comments..."
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors ${
              errors.comment
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300"
            }`}
            disabled={submitCallReportMutation.isPending}
            {...register("comment", {
              required: "Comment is required",
              minLength: {
                value: 10,
                message: "Comment must be at least 10 characters long",
              },
              maxLength: {
                value: 1000,
                message: "Comment cannot exceed 1000 characters",
              },
            })}
          />
          {errors.comment && (
            <p className="mt-1 text-sm text-red-600">
              {errors.comment.message}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            disabled={submitCallReportMutation.isPending}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitCallReportMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {submitCallReportMutation.isPending ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Submit Report</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddCallReport;
