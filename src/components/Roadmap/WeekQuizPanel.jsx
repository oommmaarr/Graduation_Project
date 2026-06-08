import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import useInterviewStore from "@/store/useInterviewStore";

function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <Loader2 size={36} className="animate-spin text-[#1387AE]" />
      <p className="text-sm font-medium text-gray-600">{label}</p>
    </div>
  );
}

function KeyPointsReview() {
  const keyPoints = useInterviewStore((s) => s.weekQuizKeyPoints);
  const error = useInterviewStore((s) => s.weekQuizError);
  const loading = useInterviewStore((s) => s.weekQuizLoading);
  const updatePoint = useInterviewStore((s) => s.updateWeekQuizKeyPoint);
  const addPoint = useInterviewStore((s) => s.addWeekQuizKeyPoint);
  const removePoint = useInterviewStore((s) => s.removeWeekQuizKeyPoint);
  const generateQuiz = useInterviewStore((s) => s.generateWeekQuiz);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Review key points</h3>
        <p className="mt-1 text-sm text-gray-500">
          Edit, add, or remove points before generating your week quiz.
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {error}
        </p>
      )}

      <ul className="max-h-[40vh] space-y-2 overflow-y-auto pr-1">
        {keyPoints.map((point, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7E1487]" />
            <input
              type="text"
              value={point}
              onChange={(e) => updatePoint(i, e.target.value)}
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#1387AE]/50 focus:ring-2 focus:ring-[#1387AE]/15"
            />
            <button
              type="button"
              onClick={() => removePoint(i)}
              className="mt-1 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 cursor-pointer"
              aria-label="Remove point"
            >
              <Trash2 size={15} />
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => addPoint("")}
        className="flex items-center gap-1.5 self-start rounded-full border border-dashed border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:border-[#1387AE]/40 hover:text-[#1387AE] cursor-pointer"
      >
        <Plus size={14} />
        Add point
      </button>

      <button
        type="button"
        onClick={generateQuiz}
        disabled={loading || keyPoints.every((p) => !p.trim())}
        className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7E1487] to-[#1387AE] px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(19,135,174,0.35)] transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        Generate quiz
      </button>
    </div>
  );
}

function QuizQuestions() {
  const quiz = useInterviewStore((s) => s.weekQuizData);
  const answers = useInterviewStore((s) => s.weekQuizAnswers);
  const setAnswer = useInterviewStore((s) => s.setWeekQuizAnswer);
  const submitQuiz = useInterviewStore((s) => s.submitWeekQuiz);

  const questions = quiz?.questions ?? [];
  const allAnswered = questions.every((q) => answers[q.id]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900">{quiz?.quiz_title ?? "Week Quiz"}</h3>
        <p className="mt-1 text-sm text-gray-500">
          Answer all {questions.length} questions. You need 70% to unlock the next week.
        </p>
      </div>

      <div className="max-h-[50vh] space-y-5 overflow-y-auto pr-1">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4"
          >
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#7E1487]">
              Question {idx + 1}
              <span className="ml-2 font-normal normal-case tracking-normal text-gray-400">
                {q.type === "true_false" ? "True / False" : "Multiple choice"}
              </span>
            </p>
            <p className="mb-3 text-sm font-semibold leading-relaxed text-gray-900">
              {q.question_text}
            </p>
            <div className="flex flex-col gap-2">
              {q.options.map((opt) => {
                const selected = answers[q.id] === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAnswer(q.id, opt)}
                    className={`rounded-xl border px-3 py-2.5 text-left text-sm transition cursor-pointer
                      ${selected
                        ? "border-[#1387AE] bg-[#1387AE]/10 font-semibold text-[#1387AE]"
                        : "border-gray-200 bg-white text-gray-700 hover:border-[#1387AE]/30"
                      }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={submitQuiz}
        disabled={!allAnswered}
        className="rounded-full bg-gradient-to-r from-[#7E1487] to-[#1387AE] px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(19,135,174,0.35)] transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        Submit quiz
      </button>
    </div>
  );
}

function QuizResult() {
  const score = useInterviewStore((s) => s.weekQuizScore);
  const passed = useInterviewStore((s) => s.weekQuizPassed);
  const weekIndex = useInterviewStore((s) => s.weekQuizWeekIndex);
  const closeWeekQuiz = useInterviewStore((s) => s.closeWeekQuiz);
  const openWeekQuiz = useInterviewStore((s) => s.openWeekQuiz);
  const extractKeyPoints = useInterviewStore((s) => s.extractWeekKeyPoints);

  const pct = Math.round((score ?? 0) * 100);

  const handleRetry = () => {
    openWeekQuiz(weekIndex);
    extractWeekKeyPoints();
  };

  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center">
      {passed ? (
        <CheckCircle2 size={56} className="text-[#0094BD]" />
      ) : (
        <XCircle size={56} className="text-red-400" />
      )}

      <div>
        <h3 className="text-xl font-bold text-gray-900">
          {passed ? "Week completed!" : "Not quite yet"}
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          You scored <span className="font-bold text-gray-800">{pct}%</span>
          {passed
            ? ` — Week ${weekIndex + 1} is done. The next week is now unlocked!`
            : " — You need 70% to unlock the next week. Review the material and try again."}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {!passed && (
          <button
            type="button"
            onClick={handleRetry}
            className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:border-[#1387AE]/40 hover:text-gray-900 cursor-pointer"
          >
            Try again
          </button>
        )}
        <button
          type="button"
          onClick={closeWeekQuiz}
          className="rounded-full bg-gradient-to-r from-[#7E1487] to-[#1387AE] px-6 py-2.5 text-sm font-semibold text-white cursor-pointer"
        >
          {passed ? "Continue learning" : "Close"}
        </button>
      </div>
    </div>
  );
}

export default function WeekQuizPanel() {
  const open = useInterviewStore((s) => s.weekQuizOpen);
  const step = useInterviewStore((s) => s.weekQuizStep);
  const weekIndex = useInterviewStore((s) => s.weekQuizWeekIndex);
  const loading = useInterviewStore((s) => s.weekQuizLoading);
  const closeWeekQuiz = useInterviewStore((s) => s.closeWeekQuiz);
  const extractKeyPoints = useInterviewStore((s) => s.extractWeekKeyPoints);

  useEffect(() => {
    if (open && step === "extract" && !loading) {
      extractKeyPoints();
    }
  }, [open, step, loading, extractKeyPoints]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={closeWeekQuiz}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="relative w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_24px_80px_rgba(19,135,174,0.2)] sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeWeekQuiz}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
              aria-label="Close quiz"
            >
              <X size={18} />
            </button>

            <p className="mb-5 pr-8 text-sm font-extrabold uppercase tracking-[0.18em] text-[#1387AE] sm:text-base">
              Week {weekIndex != null ? weekIndex + 1 : ""} Quiz
            </p>

            {(step === "extract" || step === "generating") && (
              <Spinner
                label={
                  step === "generating"
                    ? "Generating your quiz…"
                    : "Extracting key points from resources…"
                }
              />
            )}

            {step === "review" && <KeyPointsReview />}
            {step === "quiz" && <QuizQuestions />}
            {step === "result" && <QuizResult />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
