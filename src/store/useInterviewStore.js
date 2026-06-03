import { create } from "zustand";

const RECOMMENDATION_API_BASE =
  "https://recommendationsystem-production-9a13.up.railway.app";
const ROADMAP_API_BASE =
  import.meta.env.VITE_ROADMAP_API_URL ||
  "https://roadmapgeneration-production.up.railway.app";

// ─── Interview Store ───────────────────────────────────────────────────────────
// Manages the full lifecycle of a recommendation-system interview session.
// Phases: "welcome" → "interview" → "done" | "closed"
const useInterviewStore = create((set, get) => ({
  // ── UI Phase ──────────────────────────────────────────────────────────────
  phase: "welcome", // "welcome" | "interview" | "done" | "closed"

  // ── Session ───────────────────────────────────────────────────────────────
  sessionId: null,

  // ── Current Question ──────────────────────────────────────────────────────
  question: null,
  options: {},
  questionNumber: 0,
  isFinished: false,
  recommendation: null,

  // ── Roadmap ───────────────────────────────────────────────────────────────
  roadmap: null,
  hoursPerWeek: 10,
  roadmapLoading: false,
  roadmapError: null,

  // ── UI State ──────────────────────────────────────────────────────────────
  selectedAnswer: null,
  isLoading: false,
  error: null,

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Close the welcome popup without starting */
  closeWelcome: () => set({ phase: "closed" }),

  /** Reopen the welcome popup */
  openWelcome: () => set({ phase: "welcome", error: null }),

  /** Select an answer option (letter: "A" | "B" | "C" | "D") */
  selectAnswer: (letter) => set({ selectedAnswer: letter }),

  /** Skip the quiz — user already knows their track */
  setTrackDirectly: (trackName) =>
    set({
      recommendation: { track_name: trackName },
      phase: "done",
      error: null,
    }),

  /** POST /start — create a new session and load the first question */
  startSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${RECOMMENDATION_API_BASE}/start`, {
        method: "POST",
        headers: { accept: "application/json" },
        body: "",
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      console.log("%c[/start] response", "color:#1387AE;font-weight:bold", data);

      set({
        sessionId: data.session_id,
        question: data.question,
        options: data.options,
        questionNumber: data.question_number,
        isFinished: data.is_finished,
        recommendation: data.recommendation,
        phase: "interview",
        selectedAnswer: null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      set({ isLoading: false, error: err.message });
    }
  },

  /** POST /answer — submit the selected answer and advance to next question */
  submitAnswer: async () => {
    const { sessionId, selectedAnswer, isLoading } = get();
    if (!selectedAnswer || isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${RECOMMENDATION_API_BASE}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_answer: selectedAnswer,
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      console.log(
        `%c[/answer] Q${data.question_number} response`,
        "color:#7E1487;font-weight:bold",
        data
      );
      if (data.is_finished) {
        console.log("%c✅ FINAL recommendation object:", "color:green;font-weight:bold", data.recommendation);
      }

      set({
        question: data.question,
        options: data.options,
        questionNumber: data.question_number,
        isFinished: data.is_finished,
        recommendation: data.recommendation,
        phase: data.is_finished ? "done" : "interview",
        selectedAnswer: null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      set({ isLoading: false, error: err.message });
    }
  },

  setHoursPerWeek: (hours) =>
    set({ hoursPerWeek: Math.min(40, Math.max(1, Number(hours) || 1)) }),

  /** POST /generate-roadmap — build a time-scaled learning path */
  generateRoadmap: async () => {
    const { recommendation, hoursPerWeek } = get();
    const trackName = recommendation?.track_name;
    if (!trackName) {
      set({ roadmapError: "No track selected. Complete the quiz first." });
      return;
    }

    set({ roadmapLoading: true, roadmapError: null });
    try {
      const res = await fetch(`${ROADMAP_API_BASE}/generate-roadmap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          track_name: trackName,
          hours_per_week: hoursPerWeek,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail?.[0]?.msg || `Server error: ${res.status}`);
      }
      const data = await res.json();
      console.log(
        "%c[/generate-roadmap] response",
        "color:#1387AE;font-weight:bold",
        data
      );

      set({
        roadmap: data,
        roadmapLoading: false,
        roadmapError: null,
        phase: "roadmap",
      });
    } catch (err) {
      set({ roadmapLoading: false, roadmapError: err.message });
    }
  },

  clearRoadmap: () =>
    set({ roadmap: null, roadmapError: null, phase: "done" }),

  /** Full reset — go back to welcome screen */
  reset: () =>
    set({
      phase: "welcome",
      sessionId: null,
      question: null,
      options: {},
      questionNumber: 0,
      isFinished: false,
      recommendation: null,
      roadmap: null,
      hoursPerWeek: 10,
      roadmapLoading: false,
      roadmapError: null,
      selectedAnswer: null,
      isLoading: false,
      error: null,
    }),
}));

export default useInterviewStore;
