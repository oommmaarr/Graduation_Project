import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Eye, EyeOff } from "lucide-react";
import Lottie from "lottie-react";
import useAuthStore from "@/store/useAuthStore";
export default function SignInPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithGithub, isLoading, error, clearError } = useAuthStore();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleValidation = () => {
    let newErrors = {};

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!form.email.includes("@")) {
      newErrors.email = "Invalid email format";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handleValidation()) return;
    clearError();
    const result = await login(form.email, form.password);
    if (result.success) {
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row font-sans">
      {/* Left Side - Image/Illustration */}
      <div className="relative flex w-full items-center justify-center bg-[#D6EAF0] lg:w-[50%]  lg:p-0">
        <div className="relative w-full h-full bg-[#C7F3FF] flex items-end justify-center overflow-hidden">
          <div className="relative w-full h-full ">
            <img
              src="/robot.svg"
              alt="Robot Illustration"
              className="object-contain absolute bottom-0"
            />
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full min-h-screen flex-col items-center justify-center bg-white  lg:w-[50%] xl:px-12 lg:px-8 p-6">
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
            <div className="space-y-2 ">
              <h1 className="lg:text-4xl text-2xl font-semibold tracking-tight text-gray-900">
                Welcome Back
              </h1>
              <p className="lg:text-base text-sm text-[#1B1B1B] mt-3">
                Enter your details to access your workspace.
              </p>
            </div>

            <div className="lg:px-12 space-y-10">
              {/* Form Fields */}
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label
                      className="text-sm font-semibold leading-none text-gray-900"
                      htmlFor="email"
                    >
                      Email address
                    </label>
                    <div className="relative mt-2">
                      <div className="absolute left-3 top-[15px] text-gray-900">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            width="20"
                            height="16"
                            x="2"
                            y="4"
                            rx="2"
                          ></rect>
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                        </svg>
                      </div>
                      <input
                        className="flex h-12 w-full rounded-md border-0 bg-[#F0F8FA] px-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0094BD] placeholder:text-gray-400 font-medium text-gray-900"
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        value={form.email}
                        onChange={handleFormChange}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      className="text-sm font-semibold leading-none text-gray-900"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <div className="relative mt-2">
                      <div className="absolute left-3 text-gray-900 top-[15px]">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            width="18"
                            height="11"
                            x="3"
                            y="11"
                            rx="2"
                            ry="2"
                          ></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      </div>
                      <input
                        className="flex h-12 w-full rounded-md border-0 bg-[#F0F8FA] pl-10 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#0094BD] placeholder:text-gray-400 font-medium text-gray-900"
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        value={form.password}
                        onChange={handleFormChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-[15px] text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-end justify-end space-x-3 pt-2">
                  <Link
                    to="/forgot-password"
                    className="text-[#1387AE] font-bold hover:underline text-sm"
                  >
                    Forget Password?
                  </Link>{" "}
                </div>

                {/* API-level error */}
                {error && (
                  <p className="text-red-500 text-sm text-center -mb-2">{error}</p>
                )}
                <button
                  className="relative inline-flex lg:gap-3 gap-1 h-12 w-full items-center justify-center cursor-pointer rounded-lg bg-linear-to-r from-[#1387AE] to-[#DC9DEE] px-8 text-base font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring shadow-md mt-2 disabled:opacity-60"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in…" : "Sign In"}
                  {!isLoading && (
                    <span>
                      <LogIn />
                    </span>
                  )}
                </button>
              </form>
              <div className="w-full flex items-center justify-center gap-4">
                <hr className="text-gray-300 inline-block 2xl:w-55 w-30 " />
                <span className="text-black 2xl:text-base xl:text-sm text-xs whitespace-nowrap">
                  or continue with
                </span>
                <hr className="text-gray-300 inline-block 2xl:w-55 w-30" />
              </div>
              <div className="w-full flex items-center justify-between gap-4">
                <div
                  onClick={loginWithGoogle}
                  className="card-google flex items-center justify-center w-6/12 border border-[#1387AE] rounded-lg xl:h-[60px] h-[50px] cursor-pointer gap-2 hover:bg-gray-100  "
                >
                  <img
                    src={"/icons8-google-60.png"}
                    alt="google-logo"
                    className="xl:w-6 xl:h-6 w-5 h-5"
                  />
                  <span className="text-gray-600 font-semibold xl:text-base text-sm">
                    Google
                  </span>
                </div>
                <div
                  onClick={loginWithGithub}
                  className="card-github flex items-center justify-center w-6/12 border border-[#1387AE] rounded-lg xl:h-[60px] h-[50px] cursor-pointer gap-2 hover:bg-gray-100"
                >
                  <img
                    src={"/icons8-github-64.png"}
                    alt="github-logo"
                    className="xl:w-6 xl:h-6 w-5 h-5"
                  />
                  <span className="text-gray-600 font-semibold xl:text-base text-sm">
                    GitHub
                  </span>
                </div>
              </div>
            </div>
            <div className="text-center text-sm font-medium text-black pt-2">
              Already have an account?{" "}
              <Link
                to="/signup"
                className="font-bold text-[#1387AE] hover:underline"
              >
                Create One
              </Link>
            </div>
          </div>
          <div className="text-center text-xs text-gray-600 flex flex-col items-center justify-end ">
            <p className="border-t w-full border-gray-300 mb-4"></p>
            Syntra.AI © 2026. Secure Encrypted Connection.
          </div>
        </div>
      </div>
    </div>
  );
}
