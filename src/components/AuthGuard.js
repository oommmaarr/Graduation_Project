import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";
import Navbar from "@/components/Navbar";

const PUBLIC_ROUTES = ["/signup", "/signin", "/auth/success", "/forgot-password", "/auth/reset-password"];

// ─── Loading Screen ───────────────────────────────────────────────────────────
function AppLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white gap-5">
      {/* Logo */}
      <div className="flex items-center gap-1 text-3xl font-bold">
        <span className="text-black">syntra</span>
        <span className="text-[#7E1487]">.ai</span>
      </div>

      {/* Animated bar */}
      <div className="w-48 h-1 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#1387AE] to-[#DC9DEE]"
          style={{ animation: "slide 1.2s ease-in-out infinite" }}
        />
      </div>

      <style>{`
        @keyframes slide {
          0%   { width: 0%;   margin-left: 0%; }
          50%  { width: 70%;  margin-left: 15%; }
          100% { width: 0%;   margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}

// ─── Auth Guard ───────────────────────────────────────────────────────────────
export default function AuthGuard({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  useEffect(() => {
    // استنى لحد ما الـ store يخلص يقرأ من localStorage
    if (!hasHydrated) return;

    if (!token && !isPublic) {
      navigate("/signup", { replace: true });
    } else if (token && isPublic) {
      navigate("/", { replace: true });
    }
  }, [token, pathname, navigate, isPublic, hasHydrated]);

  // لو الـ store لسه بيقرأ من localStorage → اعرض الـ loader
  if (!hasHydrated) {
    return <AppLoader />;
  }

  // الـ auth pages — بدون Navbar
  if (isPublic) {
    return <>{children}</>;
  }

  // الـ protected pages — مع Navbar
  return (
    <div className="relative isolate z-10 flex min-h-dvh flex-col overflow-x-hidden">
      <Navbar />
      <div className="min-h-0 flex-1 pt-[10vh]">{children}</div>
    </div>
  );
}
