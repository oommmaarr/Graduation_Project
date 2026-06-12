import TechQuestions from "@/components/TechQuestions/TechQuestions";
import TeamWorkflow from "@/components/TeamWorkflow/TeamWorkflow";
import RecruiterHub from "@/components/RecruiterHub/RecruiterHub";
import useAuthStore from "@/store/useAuthStore";
import { Navigate } from "react-router-dom";

export default function Tech() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (user.role === "team") {
    return (
      <div className="tq-page">
        <TeamWorkflow />
      </div>
    );
  }

  if (user.role === "recruiter") {
    return (
      <div className="tq-page">
        <RecruiterHub />
      </div>
    );
  }

  if (user.role === "learner") {
    return (
      <div className="tq-page">
        <TechQuestions />
      </div>
    );
  }

  // Fallback for any other unhandled roles
  return <Navigate to="/" replace />;
}