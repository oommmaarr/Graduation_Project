import React from "react";
import Lottie from "lottie-react";
import RobotAnimation from "@/animation/Robot.json";
import useInterviewStore from "@/store/useInterviewStore";
import RoadmapView from "@/components/Roadmap/RoadmapView";

// ─── Shared keyframes (injected once) ─────────────────────────────────────────
const Keyframes = () => (
  <style>{`
    @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
    @keyframes popIn  { from { opacity:0; transform:scale(0.88) translateY(18px) } to { opacity:1; transform:scale(1) translateY(0) } }
    @keyframes slideQ { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
  `}</style>
);

// ─── Welcome Popup ─────────────────────────────────────────────────────────────
function WelcomePopup() {
  const { startSession, closeWelcome, setTrackDirectly, isLoading, error } = useInterviewStore();
  const [showTrackInput, setShowTrackInput] = React.useState(false);
  const [trackValue, setTrackValue] = React.useState("");

  const handleDirectTrack = () => {
    const trimmed = trackValue.trim();
    if (!trimmed) return;
    setTrackDirectly(trimmed);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-[fadeIn_0.35s_ease_both]">
      <Keyframes />

      {/* Card */}
      <div className="relative flex flex-col items-center gap-5 w-[min(90vw,460px)] rounded-3xl bg-white border border-[#1387AE]/20 shadow-[0_8px_48px_rgba(19,135,174,0.18)] px-8 pt-10 pb-8 animate-[popIn_0.45s_cubic-bezier(0.34,1.56,0.64,1)_both]">

        {/* Close X */}
        <button
          onClick={closeWelcome}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Lottie Robot */}
        <div className="w-44 h-44 md:w-90 md:h-60 drop-shadow-lg">
          <Lottie animationData={RobotAnimation} loop autoplay />
        </div>

        {/* Text */}
        <div className="text-center space-y-2 px-2">
          <h2 className="text-2xl font-bold text-gray-900 leading-snug">
            Welcome to the{" "}
            <span className="bg-gradient-to-r from-[#7E1487] to-[#1387AE] bg-clip-text text-transparent">
              Recommendation System
            </span>
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Answer <span className="font-semibold text-gray-700">10 quick questions</span> and
            we&apos;ll find the perfect learning track tailored just for you.
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 w-full text-center">
            {error}
          </p>
        )}

        {/* CTA */}
        <button
          id="tq-start-btn"
          onClick={startSession}
          disabled={isLoading}
          className="flex items-center gap-2 px-8 py-3 rounded-full text-white font-semibold text-sm bg-gradient-to-r from-[#7E1487] to-[#1387AE] shadow-[0_4px_20px_rgba(19,135,174,0.35)] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(19,135,174,0.45)] active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-1 cursor-pointer"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Starting…
            </>
          ) : (
            <>
              Let&apos;s Begin
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Already know your track? */}
        {!showTrackInput ? (
          <button
            onClick={() => setShowTrackInput(true)}
            className="md:text-sm text-xs text-[#7E1487] font-medium hover:underline underline-offset-2 cursor-pointer transition-colors"
          >
            Already know your track? Enter it directly →
          </button>
        ) : (
          <div className="flex flex-col gap-2 w-full animate-[slideQ_0.25s_ease_both]">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Your preferred track
            </label>
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={trackValue}
                onChange={(e) => setTrackValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDirectTrack()}
                placeholder="e.g. Cybersecurity, ML, Backend…"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#7E1487] focus:ring-2 focus:ring-[#7E1487]/20 transition-all"
              />
              <button
                onClick={handleDirectTrack}
                disabled={!trackValue.trim()}
                className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-[#7E1487] to-[#1387AE] disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                Go
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar() {
  const questionNumber = useInterviewStore((s) => s.questionNumber);
  const pct = Math.round((questionNumber / 10) * 100);

  return (
    <div className="flex flex-col gap-1.5 mb-7">
      <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#7E1487] via-[#1387AE] to-[#1387AE] transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 text-right">
        Question {questionNumber} / 10
      </span>
    </div>
  );
}

// ─── Option Button ─────────────────────────────────────────────────────────────
function OptionBtn({ letter, text }) {
  const selectedAnswer = useInterviewStore((s) => s.selectedAnswer);
  const isLoading = useInterviewStore((s) => s.isLoading);
  const selectAnswer = useInterviewStore((s) => s.selectAnswer);

  const selected = selectedAnswer === letter;

  return (
    <button
      onClick={() => selectAnswer(letter)}
      disabled={isLoading}
      className={`flex items-start gap-3 w-full px-4 py-3 rounded-xl border text-left transition-all duration-150 cursor-pointer
        ${selected
          ? "border-[#7E1487] bg-[#7E1487]/[0.08] shadow-[0_0_0_1px_rgba(126,20,135,0.3)] translate-x-1"
          : "border-gray-200 bg-white hover:border-[#1387AE]/40 hover:bg-[#1387AE]/[0.05] hover:translate-x-1"
        }
        ${isLoading ? "opacity-60 cursor-not-allowed" : ""}
      `}
    >
      <span className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold transition-colors
        ${selected ? "bg-[#7E1487] border-[#7E1487] text-white" : "border-gray-300 text-gray-400"}`}>
        {letter}
      </span>
      <span className={`text-sm leading-relaxed pt-0.5 ${selected ? "text-gray-900 font-medium" : "text-gray-600"}`}>
        {text}
      </span>
    </button>
  );
}

// ─── Interview Screen ──────────────────────────────────────────────────────────
function InterviewScreen() {
  const { question, options, questionNumber, selectedAnswer, isLoading, error, submitAnswer } =
    useInterviewStore();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full animate-[slideQ_0.4s_ease_both]">
      <Keyframes />
      <ProgressBar />

      {/* Question Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-[0_4px_32px_rgba(19,135,174,0.1)]">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#7E1487] mb-2">
          Question {questionNumber}
        </p>
        <h3 className="text-[1.05rem] font-extrabold text-gray-900 leading-relaxed mb-6">
          {question}
        </h3>

        {/* Options */}
        <div className="flex flex-col text-gray-700 font-bold gap-2.5 mb-6">
          {Object.entries(options).map(([letter, text]) => (
            <OptionBtn key={letter} letter={letter} text={text} />
          ))}
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        {/* Next button */}
        <div className="flex justify-end">
          <button
            id="tq-next-btn"
            onClick={submitAnswer}
            disabled={!selectedAnswer || isLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-sm font-semibold bg-gradient-to-r from-[#7E1487] to-[#1387AE] shadow-[0_4px_16px_rgba(19,135,174,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(19,135,174,0.45)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading…
              </>
            ) : (
              <>
                Next
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Result Screen ─────────────────────────────────────────────────────────────
function ResultScreen() {
  const recommendation = useInterviewStore((s) => s.recommendation);
  const reset = useInterviewStore((s) => s.reset);
  const hoursPerWeek = useInterviewStore((s) => s.hoursPerWeek);
  const setHoursPerWeek = useInterviewStore((s) => s.setHoursPerWeek);
  const generateRoadmap = useInterviewStore((s) => s.generateRoadmap);
  const hasCachedRoadmap = useInterviewStore((s) => s.hasCachedRoadmap);
  const roadmapLoading = useInterviewStore((s) => s.roadmapLoading);
  const roadmapError = useInterviewStore((s) => s.roadmapError);

  const { track_name, reasoning, confidence_score, suggested_courses } = recommendation || {};
  const pct = confidence_score != null ? Math.round(confidence_score * 100) : null;
  const hasSavedRoadmap = hasCachedRoadmap(track_name, hoursPerWeek);

  return (
    <div className="max-w-xl mx-auto px-4 py-10 animate-[slideQ_0.5s_ease_both]">
      <Keyframes />
      <div className="bg-white border border-[#1387AE]/20 rounded-3xl p-8 shadow-[0_8px_48px_rgba(19,135,174,0.14)] flex flex-col gap-5">

        {/* Badge */}
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#7E1487]/10 border border-[#7E1487]/25 text-[#7E1487] text-xs font-bold uppercase tracking-widest w-fit">
          Your Track
        </span>

        {/* Track name */}
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-[#7E1487] to-[#1387AE] bg-clip-text text-transparent leading-tight">
          {track_name || "–"}
        </h2>

        {/* Confidence bar */}
        {pct != null && (
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>Match confidence</span>
            <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#7E1487] to-[#1387AE] transition-all duration-1000"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="font-bold text-[#7E1487]">{pct}%</span>
          </div>
        )}

        {/* Reasoning */}
        {reasoning && (
          <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
            {reasoning}
          </p>
        )}

        {/* Suggested courses */}
        {suggested_courses?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
              Suggested Courses
            </h4>
            <ul className="flex flex-col gap-2">
              {suggested_courses.map((c, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7E1487] flex-shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Roadmap generator */}
        <div className="border-t border-gray-100 pt-5 flex flex-col gap-4">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
              Build Your Roadmap
            </h4>
            <p className="text-sm text-gray-500">
              How many hours can you study per week?
            </p>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={40}
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className="flex-1 accent-[#7E1487] cursor-pointer"
            />
            <span className="min-w-[52px] text-center text-lg font-bold text-[#1387AE]">
              {hoursPerWeek}h
            </span>
          </div>

          {roadmapError && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {roadmapError}
            </p>
          )}

          {hasSavedRoadmap && (
            <p className="text-xs text-[#0094BD] bg-[#0094BD]/8 border border-[#0094BD]/20 rounded-lg px-3 py-2">
              A saved roadmap for this track ({hoursPerWeek}h/week) is on your device — open it instantly without calling the AI again.
            </p>
          )}

          {/* Actions — stack on mobile, side by side on sm+ */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <button
              onClick={reset}
              className="w-full sm:w-auto px-5 py-3 rounded-full border border-gray-200 text-sm font-medium text-gray-500 hover:border-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
            >
              Retake the quiz
            </button>
            <button
              type="button"
              onClick={() => generateRoadmap()}
              disabled={roadmapLoading}
              className="flex w-full sm:flex-1 items-center justify-center gap-2 px-6 py-3 rounded-full text-white text-sm font-semibold whitespace-nowrap bg-gradient-to-r from-[#7E1487] to-[#1387AE] shadow-[0_4px_20px_rgba(19,135,174,0.35)] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(19,135,174,0.45)] active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {roadmapLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {hasSavedRoadmap ? "Opening roadmap…" : "Generating roadmap…"}
                </>
              ) : (
                <>
                  {hasSavedRoadmap ? "Open Saved Roadmap" : "Generate My Roadmap"}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {hasSavedRoadmap && (
            <button
              type="button"
              onClick={() => generateRoadmap({ force: true })}
              disabled={roadmapLoading}
              className="self-center text-xs font-medium text-gray-400 underline-offset-2 transition hover:text-[#1387AE] hover:underline disabled:opacity-50 cursor-pointer"
            >
              Regenerate with AI (uses API quota)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Closed State ──────────────────────────────────────────────────────────────
function ClosedState() {
  const openWelcome = useInterviewStore((s) => s.openWelcome);
  return (
    <div className="text-center space-y-4 p-8">
      <p className="text-gray-500 text-sm">Ready to find your track?</p>
      <button
        onClick={openWelcome}
        className="px-6 py-2.5 rounded-full text-white text-sm font-semibold bg-gradient-to-r from-[#7E1487] to-[#1387AE] shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
      >
        Start Assessment
      </button>
    </div>
  );
}

// ─── TechQuestions (root) ──────────────────────────────────────────────────────
const TechQuestions = () => {
  const phase = useInterviewStore((s) => s.phase);

  if (phase === "roadmap") {
    return <RoadmapView />;
  }

  return (
    <div className="w-full min-h-[calc(100vh-10vh)] flex items-center justify-center">
      {phase === "welcome"  && <WelcomePopup />}
      {phase === "closed"   && <ClosedState />}
      {phase === "interview" && <InterviewScreen />}
      {phase === "done"     && <ResultScreen />}
    </div>
  );
};

export default TechQuestions;