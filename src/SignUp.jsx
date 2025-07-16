import React, { useState } from "react";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Helmet } from "react-helmet-async";
import axios from "./api/axios";
import { Loader } from "@mantine/core";
import useAuth from "./hooks/useAuth";

function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [visiblePassword, setVisiblePassword] = useState(false);
  const navigate = useNavigate();

  const signUp = (loginData) => {
    return axios.post("/client", loginData);
  };

  const { mutate: loginMutate, isPending: loadingSignup, error } = useMutation({
    mutationFn: signUp,

    onSuccess: (response) => {
      reset();
      const text = response.data.message || "Account created successfully";
      toast.success(text);

      navigate("/login");
    },
    onError: (err) => {
      const response = err.response;
      const text = response?.data?.message || "Something went wrong";
      toast.error(text);
    },
  });

  const onSubmitting = async (data) => {
    loginMutate(data);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F5F5" }}>
      <Helmet>
        <title>Create Account | Febwin Agencies</title>
      </Helmet>

      <NavBar />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen px-4  pt-[90px]">
        <div className="w-full max-w-6xl">
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden"
            style={{
              backgroundColor: "#FFF",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
          >
            {/* Left Side - Registration Form */}
            <div className="p-12 lg:p-16 flex items-center">
              <div className="w-full max-w-md mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                  <div
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: "rgba(50, 100, 255, 0.1)",
                      color: "#3264ff",
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full mr-3"
                      style={{ backgroundColor: "#3264ff" }}
                    ></div>
                    Join Febwin Today
                  </div>

                  <h2
                    className="text-3xl font-bold"
                    style={{ color: "#343a40" }}
                  >
                    Create Your Account
                  </h2>
                </div>

                {/* Form */}
                <form
                  onSubmit={handleSubmit(onSubmitting)}
                  className="space-y-6"
                >
                  {/* Email Field */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-3"
                      style={{ color: "#343a40" }}
                    >
                      Email Address
                    </label>
                    <input
                      className={`w-full px-4 py-2 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                        errors.email
                          ? "border-red-500 focus:border-red-500"
                          : "focus:border-blue-500"
                      }`}
                      style={{
                        backgroundColor: errors.email ? "#fef2f2" : "#F5F5F5",
                        borderColor: errors.email ? "#ef4444" : "#cdc7ecea",
                      }}
                      type="email"
                      placeholder="Enter your email address"
                      {...register("email", { required: true })}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-2">
                        Email is required
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-3"
                      style={{ color: "#343a40" }}
                    >
                      Password
                    </label>
                    <div
                      className={`flex items-center border-2 rounded-xl transition-all duration-300 ${
                        errors.password
                          ? "border-red-500"
                          : "focus-within:border-blue-500"
                      }`}
                      style={{
                        backgroundColor: errors.password
                          ? "#fef2f2"
                          : "#F5F5F5",
                        borderColor: errors.password ? "#ef4444" : "#cdc7ecea",
                      }}
                    >
                      <input
                        type={visiblePassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        className="flex-1 px-4 py-2 bg-transparent outline-none"
                        disabled={loadingSignup}
                        {...register("password", { required: true })}
                      />
                      <button
                        type="button"
                        onClick={() => setVisiblePassword(!visiblePassword)}
                        className="px-4 transition-colors duration-300"
                        style={{ color: "#343a40", opacity: 0.7 }}
                        disabled={loadingSignup}
                      >
                        {visiblePassword ? (
                          <AiOutlineEyeInvisible size={20} />
                        ) : (
                          <AiOutlineEye size={20} />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-2">
                        Password is required
                      </p>
                    )}
                  </div>

                  {/* Terms and Privacy */}
                  <div
                    className="text-sm text-center"
                    style={{ color: "#343a40", opacity: 0.7 }}
                  >
                    By creating an account, you agree to our{" "}
                    <Link
                      to="/terms"
                      className="font-medium transition-colors duration-300"
                      style={{ color: "#3264ff" }}
                      onMouseEnter={(e) => (e.target.style.color = "#2451cc")}
                      onMouseLeave={(e) => (e.target.style.color = "#3264ff")}
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="font-medium transition-colors duration-300"
                      style={{ color: "#3264ff" }}
                      onMouseEnter={(e) => (e.target.style.color = "#2451cc")}
                      onMouseLeave={(e) => (e.target.style.color = "#3264ff")}
                    >
                      Privacy Policy
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loadingSignup}
                    className="w-full py-2 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{ backgroundColor: "#3264ff" }}
                    onMouseEnter={(e) =>
                      !loadingSignup &&
                      (e.target.style.backgroundColor = "#2451cc")
                    }
                    onMouseLeave={(e) =>
                      !loadingSignup &&
                      (e.target.style.backgroundColor = "#3264ff")
                    }
                  >
                    {loadingSignup ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Account...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative py-6">
                    <div className="absolute inset-0 flex items-center">
                      <div
                        className="w-full border-t"
                        style={{ borderColor: "#cdc7ecea" }}
                      ></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span
                        className="px-4 bg-white"
                        style={{ color: "#343a40", opacity: 0.6 }}
                      >
                        Already have an account?
                      </span>
                    </div>
                  </div>

                  {/* Sign In Link */}
                  <Link
                    to="/login"
                    className="w-full py-2 border-2 font-semibold rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center"
                    style={{
                      color: "#3264ff",
                      borderColor: "#cdc7ecea",
                      backgroundColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = "#3264ff";
                      e.target.style.backgroundColor =
                        "rgba(50, 100, 255, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = "#cdc7ecea";
                      e.target.style.backgroundColor = "transparent";
                    }}
                  >
                    Sign In Instead
                  </Link>
                </form>
              </div>
            </div>

            {/* Right Side - Welcome Section */}
            <div
              className="relative p-12 lg:p-16 flex items-center justify-center"
              style={{ backgroundColor: "#3264ff" }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 right-10 w-20 h-20 border-2 border-white rounded-full"></div>
                <div className="absolute top-32 left-16 w-16 h-16 border-2 border-white rounded-full"></div>
                <div className="absolute bottom-20 right-20 w-12 h-12 border-2 border-white rounded-full"></div>
                <div className="absolute bottom-32 left-10 w-8 h-8 border-2 border-white rounded-full"></div>
              </div>

              <div className="relative z-10 text-center space-y-8">
                {/* Logo */}
                <div className="flex items-center justify-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: "#FFF" }}
                  >
                    <span
                      className="text-2xl font-bold"
                      style={{ color: "#3264ff" }}
                    >
                      F
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                    Join Our
                    <span className="block" style={{ color: "#F5F5F5" }}>
                      Real Estate Hub
                    </span>
                  </h1>
                  <p className="text-xl text-white/90 leading-relaxed max-w-md mx-auto">
                    Connect with thousands of satisfied clients who use Febwin
                    for rentals, holiday bookings, property sales, and
                    management services.
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-4 text-left max-w-sm mx-auto">
                  <div className="flex items-center space-x-3 text-white/90">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "#F5F5F5" }}
                    >
                      <span className="text-xs" style={{ color: "#3264ff" }}>
                        🔍
                      </span>
                    </div>
                    <span>Advanced rental search tools</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white/90">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "#F5F5F5" }}
                    >
                      <span className="text-xs" style={{ color: "#3264ff" }}>
                        🏖️
                      </span>
                    </div>
                    <span>Exclusive holiday stays & Airbnbs</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white/90">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "#F5F5F5" }}
                    >
                      <span className="text-xs" style={{ color: "#3264ff" }}>
                        💰
                      </span>
                    </div>
                    <span>Property sales & investment advice</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white/90">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "#F5F5F5" }}
                    >
                      <span className="text-xs" style={{ color: "#3264ff" }}>
                        ⚙️
                      </span>
                    </div>
                    <span>Professional property management</span>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="pt-6 border-t border-white/20">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">5000+</div>
                      <div className="text-sm text-white/80">
                        Properties Listed
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">98%</div>
                      <div className="text-sm text-white/80">
                        Client Satisfaction
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default SignUp;
