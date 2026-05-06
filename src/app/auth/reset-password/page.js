import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Lottie from "lottie-react";
import useAuthStore from "@/store/useAuthStore";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { resetPassword, isLoading, error: storeError, clearError } = useAuthStore();
  const [form, setForm] = useState({
    password: "",
    passwordConfirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setLocalError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLocalError("");
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    if (!form.password || !form.passwordConfirm) {
      setLocalError("Please fill out all fields.");
      return;
    }

    if (form.password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.passwordConfirm) {
      setLocalError("Passwords do not match.");
      return;
    }

    clearError();
    setLocalError("");

    const result = await resetPassword(token, form.password, form.passwordConfirm);
    if (result.success) {
      setIsSuccess(true);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row font-sans">
      {/* Left Side - Image/Illustration */}
      <div className="relative flex w-full items-center justify-center bg-[#D6EAF0] lg:w-[50%] lg:p-0">
        <div className="relative w-full h-full bg-[#C7F3FF] flex items-end justify-center overflow-hidden">
          <div className="relative w-full h-full">
            <img
              src="/robot.svg"
              alt="Robot Illustration"
              className="object-contain absolute bottom-0"
            />
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full min-h-screen flex-col items-center justify-center bg-white lg:w-[50%] xl:px-12 lg:px-8 p-6">
        <div className="w-full h-full space-y-6 lg:space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-start">
            <div className="flex">
              <Lottie
                path="/animation/DeepLearning.json"
                loop={true}
                className="lg:w-[90px] lg:h-[90px] w-[60px] h-[60px]"
              />
            </div>
            <div className="text-2xl tracking-tight text-gray-900 flex items-center lg:-ml-4 -ml-1 justify-start gap-1">
              <span className="text-black text-3xl">syntra</span>
              <span className="text-[#7E1487] text-3xl font-semibold">.ai</span>
            </div>
          </div>

          {/* Header */}
          <div className="xl:px-22 px-1 space-y-10">
            <div className="space-y-2">
              <h1 className="lg:text-4xl text-2xl font-semibold tracking-tight text-gray-900">
                New Password
              </h1>
              <p className="lg:text-base text-sm text-[#1B1B1B] mt-3">
                Create a new strong password for your account.
              </p>
            </div>

            <div className="lg:px-12 space-y-10">
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center bg-[#F0F8FA] rounded-2xl border border-[#C7F3FF]">
                  <CheckCircle2 size={48} className="text-[#1387AE]" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">Password Reset Complete!</h3>
                    <p className="text-sm text-gray-600 px-4">
                      Your password has been successfully changed.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/signin")}
                    className="mt-4 relative inline-flex lg:gap-3 gap-1 h-12 w-full max-w-[200px] items-center justify-center cursor-pointer rounded-lg bg-linear-to-r from-[#1387AE] to-[#DC9DEE] px-8 text-base font-semibold text-white transition-opacity hover:opacity-90 shadow-md"
                  >
                    Go to Sign In
                  </button>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label
                        className="text-sm font-semibold leading-none text-gray-900"
                        htmlFor="password"
                      >
                        New Password
                      </label>
                      <div className="relative mt-2">
                        <div className="absolute left-3 text-gray-900 top-[15px]">
                          <Lock size={20} />
                        </div>
                        <input
                          className="flex h-12 w-full rounded-md border-0 bg-[#F0F8FA] pl-10 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#0094BD] placeholder:text-gray-400 font-medium text-gray-900"
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••••••"
                          value={form.password}
                          onChange={handleFormChange}
                          disabled={!token}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-[15px] text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        className="text-sm font-semibold leading-none text-gray-900"
                        htmlFor="passwordConfirm"
                      >
                        Confirm New Password
                      </label>
                      <div className="relative mt-2">
                        <div className="absolute left-3 text-gray-900 top-[15px]">
                          <Lock size={20} />
                        </div>
                        <input
                          className="flex h-12 w-full rounded-md border-0 bg-[#F0F8FA] pl-10 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#0094BD] placeholder:text-gray-400 font-medium text-gray-900"
                          id="passwordConfirm"
                          name="passwordConfirm"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••••••"
                          value={form.passwordConfirm}
                          onChange={handleFormChange}
                          disabled={!token}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-[15px] text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {(localError || storeError) && (
                    <p className="text-red-500 text-sm mt-2 text-center">{localError || storeError}</p>
                  )}

                  <button
                    className="relative inline-flex lg:gap-3 gap-1 h-12 w-full items-center justify-center cursor-pointer rounded-lg bg-linear-to-r from-[#1387AE] to-[#DC9DEE] px-8 text-base font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none shadow-md mt-4 disabled:opacity-60"
                    type="submit"
                    disabled={isLoading || !token}
                  >
                    {isLoading ? "Saving..." : "Change Password"}
                  </button>

                  <div className="text-center text-sm font-medium text-black pt-4">
                    Remembered it?{" "}
                    <Link
                      to="/signin"
                      className="font-bold text-[#1387AE] hover:underline"
                    >
                      Sign In
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
          
          <div className="text-center text-xs text-gray-600 flex flex-col items-center justify-end">
            <p className="border-t w-full border-gray-300 mb-4"></p>
            Syntra.AI © 2026. Secure Encrypted Connection.
          </div>
        </div>
      </div>
    </div>
  );
}
