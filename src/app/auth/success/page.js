import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore, { api } from "@/store/useAuthStore";

export default function AuthSuccessPage() {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Completing sign-in…");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("Authentication failed. No token received.");
      setTimeout(() => navigate("/signin", { replace: true }), 2000);
      return;
    }

    // احفظ الـ token مؤقتاً في localStorage عشان الـ interceptor يلقيه
    const tempStore = { state: { token, user: null }, version: 0 };
    localStorage.setItem("syntra-auth", JSON.stringify(tempStore));

    // اجيب بيانات الـ user من الـ API
    api
      .get("auth/me")
      .then((data) => {
        // حدّث الـ Zustand store بالـ user والـ token الحقيقيين
        useAuthStore.setState({
          user: data.user,
          token,
          isLoading: false,
          error: null,
        });

        // حدّث الـ localStorage بالبيانات الكاملة
        const fullStore = { state: { token, user: data.user }, version: 0 };
        localStorage.setItem("syntra-auth", JSON.stringify(fullStore));

        setStatus("Signed in successfully! Redirecting…");
        navigate("/", { replace: true });
      })
      .catch(() => {
        setStatus("Failed to fetch user info. Please try again.");
        localStorage.removeItem("syntra-auth");
        setTimeout(() => navigate("/signin", { replace: true }), 2000);
      });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-6">
      {/* Spinner */}
      <div className="w-14 h-14 rounded-full border-4 border-[#C7F3FF] border-t-[#1387AE] animate-spin" />
      <p className="text-gray-600 font-medium text-base">{status}</p>
    </div>
  );
}
