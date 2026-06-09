import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Rocket,
  RefreshCw,
  Send,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import useInterviewStore from "@/store/useInterviewStore";
import useAuthStore from "@/store/useAuthStore";

const DIFFICULTY_STYLE = {
  Beginner: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Intermediate: "bg-amber-100 text-amber-800 border-amber-200",
  Advanced: "bg-red-100 text-red-700 border-red-200",
};

function buildProjectDescription(project) {
  if (!project) return "";
  const features = project.core_features?.length
    ? `\n\nCore features:\n- ${project.core_features.join("\n- ")}`
    : "";
  return `${project.project_title}\n\n${project.overview || ""}${features}`.trim();
}

function EvaluationResults({ results, loading }) {
  if (loading && results?.status === "Processing") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[#1387AE]/20 bg-[#1387AE]/5 px-4 py-4">
        <Loader2 size={20} className="animate-spin text-[#1387AE]" />
        <div>
          <p className="text-sm font-semibold text-gray-900">Evaluating your project…</p>
          <p className="text-xs text-gray-500">This may take a minute. We&apos;ll update automatically.</p>
        </div>
      </div>
    );
  }

  if (!results || results.status === "Processing") return null;

  const { score, status, feedback, requirements_met } = results;
  const passed = status === "Passed" || (typeof score === "number" && score >= 70);
  const strengths = feedback?.strengths ?? [];
  const weaknesses = feedback?.weaknesses ?? [];
  const suggestions = feedback?.suggestions;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Score header */}
      <div
        className={`flex flex-wrap items-center justify-between gap-4 px-5 py-4
          ${passed ? "bg-gradient-to-r from-[#0094BD]/10 to-emerald-50" : "bg-gradient-to-r from-red-50 to-orange-50"}`}
      >
        <div className="flex items-center gap-3">
          {passed ? (
            <CheckCircle2 size={28} className="text-[#0094BD]" />
          ) : (
            <XCircle size={28} className="text-red-500" />
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Evaluation results
            </p>
            <p className={`text-lg font-extrabold ${passed ? "text-[#0094BD]" : "text-red-600"}`}>
              {status ?? (passed ? "Passed" : "Failed")}
            </p>
          </div>
        </div>
        {score != null && (
          <div className="text-center">
            <p className={`text-3xl font-extrabold tabular-nums ${passed ? "text-[#0094BD]" : "text-red-500"}`}>
              {score}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Score</p>
          </div>
        )}
      </div>

      <div className="space-y-5 p-5">
        {/* Requirements checklist */}
        {requirements_met?.length > 0 && (
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Requirements met
            </p>
            <ul className="space-y-2">
              {requirements_met.map((req) => (
                <li
                  key={req.feature}
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm
                    ${req.status
                      ? "border-[#0094BD]/20 bg-[#0094BD]/5 text-gray-800"
                      : "border-red-100 bg-red-50/50 text-gray-700"
                    }`}
                >
                  {req.status ? (
                    <CheckCircle2 size={16} className="shrink-0 text-[#0094BD]" />
                  ) : (
                    <XCircle size={16} className="shrink-0 text-red-400" />
                  )}
                  <span className={req.status ? "font-medium" : ""}>{req.feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Strengths */}
        {strengths.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
              Strengths
            </p>
            <ul className="space-y-2">
              {strengths.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-gray-700">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {weaknesses.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-amber-700">
              Weaknesses
            </p>
            <ul className="space-y-2">
              {weaknesses.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-gray-700">
                  <AlertCircle size={15} className="mt-0.5 shrink-0 text-amber-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {suggestions && (
          <div className="rounded-xl border border-[#7E1487]/15 bg-[#7E1487]/5 px-4 py-3">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#7E1487]">
              Suggestions
            </p>
            <p className="text-sm leading-relaxed text-gray-700">{suggestions}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectEvaluationForm({ trackName, projects }) {
  const user = useAuthStore((s) => s.user);
  const submitProjectEvaluation = useInterviewStore((s) => s.submitProjectEvaluation);
  const stopEvaluationPolling = useInterviewStore((s) => s.stopEvaluationPolling);
  const evaluationLoading = useInterviewStore((s) => s.evaluationLoading);
  const evaluationError = useInterviewStore((s) => s.evaluationError);
  const evaluationResults = useInterviewStore((s) => s.evaluationResults);
  const evaluationStatus = useInterviewStore((s) => s.evaluationStatus);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [projectLink, setProjectLink] = useState("");
  const [description, setDescription] = useState("");

  const selectedProject = projects[selectedIndex];

  useEffect(() => {
    if (selectedProject) {
      setDescription(buildProjectDescription(selectedProject));
    }
  }, [selectedProject]);

  useEffect(() => () => stopEvaluationPolling(), [stopEvaluationPolling]);

  const studentId = user?._id || user?.id;

  const handleSubmit = (e) => {
    e.preventDefault();
    submitProjectEvaluation({
      projectLink,
      trackId: trackName,
      studentId,
      project_description: description,
    });
  };

  const isBusy =
    evaluationLoading ||
    evaluationStatus === "submitting" ||
    evaluationStatus === "processing";

  return (
    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1387AE]">
          Capstone evaluation
        </p>
        <h4 className="mt-1 text-lg font-bold text-gray-900">Submit your finished project</h4>
        <p className="mt-1 text-sm text-gray-500">
          Pick one of the suggested ideas, share your repo link, and get AI feedback on your work.
        </p>
      </div>

      {!studentId && (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Sign in to submit your project for evaluation.
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">
            Which project did you build?
          </label>
          <select
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#1387AE]/50 focus:ring-2 focus:ring-[#1387AE]/15"
          >
            {projects.map((p, i) => (
              <option key={`${p.project_title}-${i}`} value={i}>
                {p.project_title} ({p.difficulty})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">
            Project link (GitHub, demo, etc.)
          </label>
          <input
            type="url"
            required
            value={projectLink}
            onChange={(e) => setProjectLink(e.target.value)}
            placeholder="https://github.com/username/project"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#1387AE]/50 focus:ring-2 focus:ring-[#1387AE]/15"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">
            Project description
          </label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-y rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#1387AE]/50 focus:ring-2 focus:ring-[#1387AE]/15"
          />
        </div>

        {evaluationError && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {evaluationError}
          </p>
        )}

        <button
          type="submit"
          disabled={!studentId || isBusy}
          className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7E1487] to-[#1387AE] px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(19,135,174,0.35)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {isBusy ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {evaluationStatus === "processing" ? "Evaluating…" : "Submitting…"}
            </>
          ) : (
            <>
              <Send size={16} />
              Submit for evaluation
            </>
          )}
        </button>
      </form>

      {(evaluationResults || isBusy) && (
        <div className="mt-5">
          <EvaluationResults results={evaluationResults} loading={isBusy} />
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, index }) {
  const diffClass =
    DIFFICULTY_STYLE[project.difficulty] ?? "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_8px_32px_rgba(19,135,174,0.08)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h4 className="text-base font-bold text-gray-900">{project.project_title}</h4>
        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${diffClass}`}>
          {project.difficulty}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-gray-600">{project.overview}</p>

      {project.core_features?.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#7E1487]">
            Core features
          </p>
          <ul className="space-y-1.5">
            {project.core_features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1387AE]" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {project.tech_stack_usage && (
        <div className="rounded-xl bg-gray-50 px-3 py-2.5">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Tech stack
          </p>
          <p className="text-xs leading-relaxed text-gray-600">{project.tech_stack_usage}</p>
        </div>
      )}

      {project.implementation_steps?.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Implementation steps
          </p>
          <ol className="space-y-1.5">
            {project.implementation_steps.map((step, i) => (
              <li key={step} className="flex gap-2 text-sm text-gray-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1387AE]/10 text-[10px] font-bold text-[#1387AE]">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </motion.article>
  );
}

export default function ProjectSuggestionsPanel({ trackName, technologies }) {
  const projects = useInterviewStore((s) => s.projectSuggestions);
  const loading = useInterviewStore((s) => s.projectLoading);
  const error = useInterviewStore((s) => s.projectError);
  const generateProjectSuggestions = useInterviewStore((s) => s.generateProjectSuggestions);

  const projectList = useMemo(() => projects ?? [], [projects]);

  return (
    <div className="border-t border-[#7E1487]/15 bg-gradient-to-br from-[#FDF8FF] via-white to-[#F8FCFF] px-6 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7E1487] to-[#1387AE] shadow-[0_8px_24px_rgba(126,20,135,0.25)]">
            <Trophy size={22} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E1487]">
              Track complete
            </p>
            <h3 className="mt-0.5 text-xl font-extrabold text-gray-900">
              Your capstone project ideas
            </h3>
            <p className="mt-1 max-w-xl text-sm text-gray-500">
              Based on <span className="font-semibold text-gray-700">{trackName}</span> and the
              skills you mastered across all weeks.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => generateProjectSuggestions({ force: true })}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:border-[#1387AE]/40 hover:text-gray-800 disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Refresh ideas
        </button>
      </div>

      {technologies.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-[#1387AE]/20 bg-[#1387AE]/8 px-3 py-1 text-xs font-medium text-[#1387AE]"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {loading && !projectList.length && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <Loader2 size={36} className="animate-spin text-[#7E1487]" />
          <p className="text-sm font-medium text-gray-600">
            Generating tailored project ideas for your stack…
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {projectList.length > 0 && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {projectList.map((project, i) => (
              <ProjectCard key={`${project.project_title}-${i}`} project={project} index={i} />
            ))}
          </div>

          <ProjectEvaluationForm trackName={trackName} projects={projectList} />
        </>
      )}

      {!loading && !error && projectList.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Sparkles size={32} className="text-[#7E1487]" />
          <button
            type="button"
            onClick={() => generateProjectSuggestions()}
            className="rounded-full bg-gradient-to-r from-[#7E1487] to-[#1387AE] px-6 py-2.5 text-sm font-semibold text-white cursor-pointer"
          >
            Generate project ideas
          </button>
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
        <Rocket size={14} className="text-[#1387AE]" />
        Build one, submit it, and get evaluated
        <ExternalLink size={12} className="opacity-60" />
      </div>
    </div>
  );
}
