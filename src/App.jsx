import { Navigate, Route, Routes } from "react-router-dom";
import AuthGuard from "@/components/AuthGuard";
import HomePage from "@/app/page";
import SigninPage from "@/app/signin/page";
import SignupPage from "@/app/signup/page";
import ProfilePage from "@/app/profile/page";
import ForgotPasswordPage from "@/app/forgot-password/page";
import ResetPasswordPage from "@/app/auth/reset-password/page";
import AuthSuccessPage from "@/app/auth/success/page";
import RolesPage from "@/app/roles/page";
import WorkflowPage from "@/app/workflow/page";
import Tech from "@/app/tech/page";

export default function App() {
  return (
    <div className="antialiased min-h-screen text-black bg-gradient-to-b from-[#FEFFFF] via-[#FFFFFF] to-[#C8E5FF] overflow-x-hidden">
      <AuthGuard>
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signin" element={<SigninPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/success" element={<AuthSuccessPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/workflow" element={<WorkflowPage />} />
            <Route path="/tech" element={<Tech />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </AuthGuard>
    </div>
  );
}
