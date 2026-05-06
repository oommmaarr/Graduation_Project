import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, CheckCircle2 } from "lucide-react";
import Lottie from "lottie-react";
import useAuthStore from "@/store/useAuthStore";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const { forgotPassword, isLoading, error: storeError, clearError } = useAuthStore();
  const [localError, setLocalError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setLocalError("Please enter a valid email address.");
      return;
    }

    clearError();
    setLocalError("");

    const result = await forgotPassword(email);
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
                Forgot Password?
              </h1>
              <p className="lg:text-base text-sm text-[#1B1B1B] mt-3">
                No worries, we'll send you reset instructions.
              </p>
            </div>

            <div className="lg:px-12 space-y-10">
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center bg-[#F0F8FA] rounded-2xl border border-[#C7F3FF]">
                  <CheckCircle2 size={48} className="text-[#1387AE]" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">Email Sent!</h3>
                    <p className="text-sm text-gray-600 px-4">
                      Check your email ({email}) and follow the instructions to reset your password.
                    </p>
                  </div>
                  <Link
                    to="/signin"
                    className="mt-4 text-[#1387AE] font-bold hover:underline text-sm"
                  >
                    Back to Sign In
                  </Link>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label
                      className="text-sm font-semibold leading-none text-gray-900"
                      htmlFor="email"
                    >
                      Email address
                    </label>
                    <div className="relative mt-2">
                      <div className="absolute left-3 top-[15px] text-gray-900">
                        <Mail size={20} />
                      </div>
                      <input
                        className="flex h-12 w-full rounded-md border-0 bg-[#F0F8FA] px-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0094BD] placeholder:text-gray-400 font-medium text-gray-900"
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setLocalError("");
                          clearError();
                        }}
                      />
                    </div>
                    {(localError || storeError) && <p className="text-red-500 text-sm mt-2">{localError || storeError}</p>}
                  </div>

                  <button
                    className="relative inline-flex lg:gap-3 gap-1 h-12 w-full items-center justify-center cursor-pointer rounded-lg bg-linear-to-r from-[#1387AE] to-[#DC9DEE] px-8 text-base font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none shadow-md mt-2 disabled:opacity-60"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Reset Password"}
                  </button>

                  <div className="text-center text-sm font-medium text-black pt-4">
                    Remember your password?{" "}
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
