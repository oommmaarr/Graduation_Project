import { create } from "zustand";
import { persist } from "zustand/middleware";

const RECOMMENDATION_API_BASE =
  "https://recommendationsystem-production-9a13.up.railway.app";
const ROADMAP_API_BASE =
  import.meta.env.VITE_ROADMAP_API_URL ||
  "https://roadmapgeneration-production.up.railway.app";
const QUIZ_API_BASE =
  import.meta.env.VITE_QUIZ_API_URL ||
  "https://syntra-ai-quiz-service-production.up.railway.app";
const PROGRESS_API_BASE =
  import.meta.env.VITE_PROGRESS_API_URL ||
  "https://progresstracking-production.up.railway.app";
const PROJECT_API_BASE =
  import.meta.env.VITE_PROJECT_API_URL ||
  "https://syntra-ai-projectrecommend-production.up.railway.app";
const EVALUATION_API_BASE =
  import.meta.env.VITE_EVALUATION_API_URL ||
  "https://syntraai-production-08b1.up.railway.app";

const PASS_THRESHOLD = 0.7;

let evaluationPollTimer = null;

export function extractRoadmapCourses(roadmap) {
  const courses = [];
  for (const week of roadmap?.roadmap ?? []) {
    for (const skill of week.skills ?? []) {
      if (skill.skill_name) courses.push(skill.skill_name);
    }
  }
  return [...new Set(courses)];
}

export function getCompletedSkillNames(roadmap, passedWeeks) {
  const completed = new Set();
  for (const idx of passedWeeks) {
    for (const skill of roadmap?.roadmap?.[idx]?.skills ?? []) {
      if (skill.skill_name) completed.add(skill.skill_name);
    }
  }
  return completed;
}

export function computeTrackProgress(roadmap, passedWeeks, courseWeights) {
  const totalWeeks = roadmap?.roadmap?.length ?? 0;
  if (totalWeeks === 0) return 0;

  if (!courseWeights || Object.keys(courseWeights).length === 0) {
    return Math.round((passedWeeks.length / totalWeeks) * 100);
  }

  const completed = getCompletedSkillNames(roadmap, passedWeeks);
  let weighted = 0;
  for (const name of completed) {
    weighted += courseWeights[name] ?? 0;
  }
  return Math.round(Math.min(1, weighted) * 100);
}

export function isTrackComplete(roadmap, passedWeeks) {
  const weeks = roadmap?.roadmap ?? [];
  if (weeks.length === 0) return false;
  return weeks.every((_, i) => passedWeeks.includes(i));
}

export function collectWeekUrls(week) {
  const urls = [];
  for (const skill of week?.skills ?? []) {
    const r = skill.resources ?? {};
    for (const key of ["youtube_link", "article_link", "book_reference"]) {
      const val = r[key];
      if (val && /^https?:\/\//i.test(String(val).trim())) {
        urls.push(val.trim());
      }
    }
  }
  return [...new Set(urls)];
}

function resetWeekQuizState() {
  return {
    weekQuizOpen: false,
    weekQuizWeekIndex: null,
    weekQuizStep: null,
    weekQuizKeyPoints: [],
    weekQuizData: null,
    weekQuizAnswers: {},
    weekQuizLoading: false,
    weekQuizError: null,
    weekQuizScore: null,
    weekQuizPassed: null,
  };
}

function resetWeekProgress(trackName) {
  return {
    unlockedWeekIndex: 0,
    passedWeeks: [],
    progressTrackName: trackName ?? null,
    courseWeights: null,
    courseWeightsError: null,
    ...resetWeekQuizState(),
  };
}

export function getRoadmapCacheKey(trackName, hoursPerWeek) {
  const normalized = String(trackName || "").trim().toLowerCase();
  return `${normalized}::${hoursPerWeek}`;
}

function persistProgressForKey(progressByRoadmapKey, cacheKey, progress) {
  if (!cacheKey) return progressByRoadmapKey;
  return {
    ...progressByRoadmapKey,
    [cacheKey]: {
      unlockedWeekIndex: progress.unlockedWeekIndex,
      passedWeeks: progress.passedWeeks,
      courseWeights: progress.courseWeights,
    },
  };
}

// ─── Interview Store ───────────────────────────────────────────────────────────
const useInterviewStore = create(
  persist(
    (set, get) => ({
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

      // ── Week progress (persisted) ───────────────────────────────────────────
      unlockedWeekIndex: 0,
      passedWeeks: [],
      progressTrackName: null,
      courseWeights: null,
      courseWeightsLoading: false,
      courseWeightsError: null,

      // ── Saved roadmaps cache (persisted) ────────────────────────────────────
      activeRoadmapKey: null,
      savedRoadmaps: {},
      progressByRoadmapKey: {},
      roadmapFromCache: false,
      savedProjectsByKey: {},
      projectSuggestions: null,
      projectLoading: false,
      projectError: null,
      evaluationLoading: false,
      evaluationError: null,
      evaluationStatus: null,
      evaluationResults: null,

      // ── Week quiz session (transient) ───────────────────────────────────────
      weekQuizOpen: false,
      weekQuizWeekIndex: null,
      weekQuizStep: null,
      weekQuizKeyPoints: [],
      weekQuizData: null,
      weekQuizAnswers: {},
      weekQuizLoading: false,
      weekQuizError: null,
      weekQuizScore: null,
      weekQuizPassed: null,

      closeWelcome: () => set({ phase: "closed" }),
      openWelcome: () => set({ phase: "welcome", error: null }),
      selectAnswer: (letter) => set({ selectedAnswer: letter }),

      setTrackDirectly: (trackName) =>
        set({
          recommendation: { track_name: trackName },
          phase: "done",
          error: null,
        }),

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

      hasCachedRoadmap: (trackName, hoursPerWeek) => {
        const key = getRoadmapCacheKey(
          trackName ?? get().recommendation?.track_name,
          hoursPerWeek ?? get().hoursPerWeek
        );
        return !!get().savedRoadmaps[key];
      },

      syncProgressCache: () => {
        const {
          activeRoadmapKey,
          unlockedWeekIndex,
          passedWeeks,
          courseWeights,
          progressByRoadmapKey,
        } = get();
        if (!activeRoadmapKey) return;
        set({
          progressByRoadmapKey: persistProgressForKey(progressByRoadmapKey, activeRoadmapKey, {
            unlockedWeekIndex,
            passedWeeks,
            courseWeights,
          }),
        });
      },

      applyRoadmapFromCache: (cacheKey, cached) => {
        const savedProgress = get().progressByRoadmapKey[cacheKey];
        set({
          roadmap: cached.roadmap,
          roadmapLoading: false,
          roadmapError: null,
          phase: "roadmap",
          activeRoadmapKey: cacheKey,
          roadmapFromCache: true,
          progressTrackName: cached.roadmap.track_name,
          unlockedWeekIndex: savedProgress?.unlockedWeekIndex ?? 0,
          passedWeeks: savedProgress?.passedWeeks ?? [],
          courseWeights: savedProgress?.courseWeights ?? null,
          courseWeightsError: null,
        });
        if (!savedProgress?.courseWeights) {
          get().fetchCourseWeights();
        }
      },

      generateRoadmap: async ({ force = false } = {}) => {
        const { recommendation, hoursPerWeek, savedRoadmaps } = get();
        const trackName = recommendation?.track_name;
        if (!trackName) {
          set({ roadmapError: "No track selected. Complete the quiz first." });
          return;
        }

        const cacheKey = getRoadmapCacheKey(trackName, hoursPerWeek);
        const cached = savedRoadmaps[cacheKey];

        if (cached && !force) {
          get().applyRoadmapFromCache(cacheKey, cached);
          return;
        }

        set({ roadmapLoading: true, roadmapError: null, roadmapFromCache: false });
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

          const freshProgress = {
            unlockedWeekIndex: 0,
            passedWeeks: [],
            courseWeights: null,
          };

          set((s) => ({
            roadmap: data,
            roadmapLoading: false,
            roadmapError: null,
            phase: "roadmap",
            activeRoadmapKey: cacheKey,
            roadmapFromCache: false,
            progressTrackName: data.track_name,
            ...freshProgress,
            courseWeightsError: null,
            ...resetWeekQuizState(),
            savedRoadmaps: {
              ...s.savedRoadmaps,
              [cacheKey]: {
                roadmap: data,
                trackName,
                hoursPerWeek,
                savedAt: Date.now(),
              },
            },
            progressByRoadmapKey: persistProgressForKey(
              s.progressByRoadmapKey,
              cacheKey,
              freshProgress
            ),
          }));
          get().fetchCourseWeights();
        } catch (err) {
          set({ roadmapLoading: false, roadmapError: err.message });
        }
      },

      fetchCourseWeights: async () => {
        const { roadmap } = get();
        const trackName = roadmap?.track_name;
        const courses = extractRoadmapCourses(roadmap);
        if (!trackName || courses.length === 0) return;

        set({ courseWeightsLoading: true, courseWeightsError: null });
        try {
          const res = await fetch(`${PROGRESS_API_BASE}/calculate-weights`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
            body: JSON.stringify({
              track_name: trackName,
              roadmap_courses: courses,
            }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const detail = err.detail?.[0]?.msg || err.detail || `Server error: ${res.status}`;
            throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
          }
          const data = await res.json();
          set((s) => ({
            courseWeights: data.all_courses_weights ?? {},
            courseWeightsLoading: false,
            courseWeightsError: null,
            progressByRoadmapKey: persistProgressForKey(
              s.progressByRoadmapKey,
              s.activeRoadmapKey,
              {
                unlockedWeekIndex: s.unlockedWeekIndex,
                passedWeeks: s.passedWeeks,
                courseWeights: data.all_courses_weights ?? {},
              }
            ),
          }));
        } catch (err) {
          set({
            courseWeightsLoading: false,
            courseWeightsError: err.message,
          });
        }
      },

      generateProjectSuggestions: async ({ force = false } = {}) => {
        const { roadmap, activeRoadmapKey, savedProjectsByKey } = get();
        const track = roadmap?.track_name;
        if (!track) return;

        if (activeRoadmapKey && savedProjectsByKey[activeRoadmapKey] && !force) {
          set({
            projectSuggestions: savedProjectsByKey[activeRoadmapKey].projects,
            projectLoading: false,
            projectError: null,
          });
          return;
        }

        const technologies = extractRoadmapCourses(roadmap);
        if (technologies.length === 0) {
          set({ projectError: "No skills found in your roadmap." });
          return;
        }

        set({ projectLoading: true, projectError: null });
        try {
          const res = await fetch(`${PROJECT_API_BASE}/api/projects/generate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
            body: JSON.stringify({ track, technologies }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const detail = err.detail?.[0]?.msg || err.detail || `Server error: ${res.status}`;
            throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
          }
          const data = await res.json();
          const projects = data.projects ?? [];

          set((s) => ({
            projectSuggestions: projects,
            projectLoading: false,
            projectError: null,
            savedProjectsByKey: activeRoadmapKey
              ? {
                  ...s.savedProjectsByKey,
                  [activeRoadmapKey]: { projects, generatedAt: Date.now() },
                }
              : s.savedProjectsByKey,
          }));
        } catch (err) {
          set({ projectLoading: false, projectError: err.message });
        }
      },

      stopEvaluationPolling: () => {
        if (evaluationPollTimer) {
          clearTimeout(evaluationPollTimer);
          evaluationPollTimer = null;
        }
      },

      pollEvaluationResults: (studentId) => {
        get().stopEvaluationPolling();

        const poll = async (attempt = 0) => {
          if (attempt > 40) {
            set({
              evaluationLoading: false,
              evaluationError: "Evaluation is taking longer than expected. Try again later.",
              evaluationStatus: "timeout",
            });
            return;
          }

          try {
            const res = await fetch(
              `${EVALUATION_API_BASE}/results/${encodeURIComponent(studentId)}`,
              { headers: { accept: "application/json" } }
            );
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              console.log(
                `%c[/results/${studentId}] error response`,
                "color:red;font-weight:bold",
                err
              );
              const detail = err.detail?.[0]?.msg || err.detail || `Server error: ${res.status}`;
              throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
            }
            const data = await res.json();
            console.log(
              `%c[/results/${studentId}] poll #${attempt + 1} response`,
              "color:#0094BD;font-weight:bold",
              data
            );

            if (data.status === "Processing") {
              set({
                evaluationResults: data,
                evaluationLoading: true,
                evaluationStatus: "processing",
                evaluationError: null,
              });
              evaluationPollTimer = setTimeout(() => poll(attempt + 1), 3000);
            } else {
              set({
                evaluationResults: data,
                evaluationLoading: false,
                evaluationStatus: "complete",
                evaluationError: null,
              });
            }
          } catch (err) {
            set({
              evaluationLoading: false,
              evaluationError: err.message,
              evaluationStatus: "error",
            });
          }
        };

        poll();
      },

      submitProjectEvaluation: async ({
        projectLink,
        trackId,
        studentId,
        project_description,
      }) => {
        if (!projectLink?.trim()) {
          set({ evaluationError: "Please enter your project link." });
          return;
        }
        if (!studentId) {
          set({ evaluationError: "You must be logged in to submit a project." });
          return;
        }

        get().stopEvaluationPolling();
        set({
          evaluationLoading: true,
          evaluationError: null,
          evaluationStatus: "submitting",
          evaluationResults: null,
        });

        try {
          const res = await fetch(`${EVALUATION_API_BASE}/evaluate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
            body: JSON.stringify({
              projectLink: projectLink.trim(),
              trackId: String(trackId),
              studentId: String(studentId),
              project_description: project_description?.trim() || "",
            }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.log(
              "%c[/evaluate] error response",
              "color:red;font-weight:bold",
              err
            );
            const detail = err.detail?.[0]?.msg || err.detail || `Server error: ${res.status}`;
            throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
          }

          const data = await res.json();
          console.log(
            "%c[/evaluate] response",
            "color:#7E1487;font-weight:bold",
            data
          );
          set({ evaluationStatus: "processing" });
          get().pollEvaluationResults(studentId);
        } catch (err) {
          set({
            evaluationLoading: false,
            evaluationError: err.message,
            evaluationStatus: "error",
          });
        }
      },

      clearRoadmap: () => {
        get().stopEvaluationPolling();
        get().syncProgressCache();
        set({
          roadmap: null,
          roadmapError: null,
          phase: "done",
          activeRoadmapKey: null,
          roadmapFromCache: false,
        });
      },

      reset: () => {
        get().syncProgressCache();
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
          activeRoadmapKey: null,
          roadmapFromCache: false,
          ...resetWeekProgress(null),
        });
      },

      // ── Week quiz actions ───────────────────────────────────────────────────

      openWeekQuiz: (weekIndex) =>
        set({
          weekQuizOpen: true,
          weekQuizWeekIndex: weekIndex,
          weekQuizStep: "extract",
          weekQuizKeyPoints: [],
          weekQuizData: null,
          weekQuizAnswers: {},
          weekQuizLoading: false,
          weekQuizError: null,
          weekQuizScore: null,
          weekQuizPassed: null,
        }),

      closeWeekQuiz: () => set(resetWeekQuizState()),

      setWeekQuizKeyPoints: (points) => set({ weekQuizKeyPoints: points }),

      updateWeekQuizKeyPoint: (index, value) =>
        set((s) => {
          const next = [...s.weekQuizKeyPoints];
          next[index] = value;
          return { weekQuizKeyPoints: next };
        }),

      addWeekQuizKeyPoint: (value = "") =>
        set((s) => ({ weekQuizKeyPoints: [...s.weekQuizKeyPoints, value] })),

      removeWeekQuizKeyPoint: (index) =>
        set((s) => ({
          weekQuizKeyPoints: s.weekQuizKeyPoints.filter((_, i) => i !== index),
        })),

      setWeekQuizAnswer: (questionId, answer) =>
        set((s) => ({
          weekQuizAnswers: { ...s.weekQuizAnswers, [questionId]: answer },
        })),

      extractWeekKeyPoints: async () => {
        const { roadmap, weekQuizWeekIndex } = get();
        const weeks = roadmap?.roadmap ?? [];
        const week = weeks[weekQuizWeekIndex];
        const trackName = roadmap?.track_name;
        if (!week || !trackName) return;

        const urls = collectWeekUrls(week);

        set({ weekQuizLoading: true, weekQuizError: null, weekQuizStep: "extract" });

        if (urls.length === 0) {
          set({
            weekQuizLoading: false,
            weekQuizStep: "review",
            weekQuizKeyPoints: week.skills.map((s) => s.skill_name),
            weekQuizError: null,
          });
          return;
        }

        try {
          const res = await fetch(`${QUIZ_API_BASE}/quiz/extract-key-points`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
            body: JSON.stringify({ track_name: trackName, urls }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `Server error: ${res.status}`);
          }
          const data = await res.json();
          set({
            weekQuizKeyPoints: data.key_points ?? [],
            weekQuizStep: "review",
            weekQuizLoading: false,
            weekQuizError: null,
          });
        } catch (err) {
          set({
            weekQuizLoading: false,
            weekQuizStep: "review",
            weekQuizKeyPoints: week.skills.map((s) => s.skill_name),
            weekQuizError: `Could not extract key points: ${err.message}. Edit the list below and continue.`,
          });
        }
      },

      generateWeekQuiz: async () => {
        const { roadmap, weekQuizKeyPoints } = get();
        const trackName = roadmap?.track_name;
        const keyPoints = weekQuizKeyPoints.map((p) => p.trim()).filter(Boolean);

        if (!trackName || keyPoints.length === 0) {
          set({ weekQuizError: "Add at least one key point before generating the quiz." });
          return;
        }

        set({ weekQuizLoading: true, weekQuizError: null, weekQuizStep: "generating" });

        try {
          const res = await fetch(`${QUIZ_API_BASE}/quiz/generate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
            body: JSON.stringify({ track_name: trackName, key_points: keyPoints }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `Server error: ${res.status}`);
          }
          const data = await res.json();
          set({
            weekQuizData: data,
            weekQuizStep: "quiz",
            weekQuizAnswers: {},
            weekQuizLoading: false,
            weekQuizError: null,
          });
        } catch (err) {
          set({
            weekQuizLoading: false,
            weekQuizStep: "review",
            weekQuizError: err.message,
          });
        }
      },

      submitWeekQuiz: () => {
        const {
          weekQuizData,
          weekQuizAnswers,
          weekQuizWeekIndex,
          unlockedWeekIndex,
          passedWeeks,
          roadmap,
        } = get();

        const questions = weekQuizData?.questions ?? [];
        if (questions.length === 0) return;

        let correct = 0;
        for (const q of questions) {
          if (weekQuizAnswers[q.id] === q.correct_answer) correct += 1;
        }

        const score = correct / questions.length;
        const passed = score >= PASS_THRESHOLD;

        if (passed) {
          const nextPassed = passedWeeks.includes(weekQuizWeekIndex)
            ? passedWeeks
            : [...passedWeeks, weekQuizWeekIndex];
          const totalWeeks = roadmap?.roadmap?.length ?? 1;
          const nextUnlocked = Math.min(
            totalWeeks - 1,
            Math.max(unlockedWeekIndex, weekQuizWeekIndex + 1)
          );

          set((s) => ({
            weekQuizScore: score,
            weekQuizPassed: true,
            weekQuizStep: "result",
            passedWeeks: nextPassed,
            unlockedWeekIndex: nextUnlocked,
            progressByRoadmapKey: persistProgressForKey(
              s.progressByRoadmapKey,
              s.activeRoadmapKey,
              {
                unlockedWeekIndex: nextUnlocked,
                passedWeeks: nextPassed,
                courseWeights: s.courseWeights,
              }
            ),
          }));

          if (isTrackComplete(roadmap, nextPassed)) {
            get().generateProjectSuggestions();
          }
        } else {
          set({
            weekQuizScore: score,
            weekQuizPassed: false,
            weekQuizStep: "result",
          });
        }
      },

      isWeekLocked: (index) => index > get().unlockedWeekIndex,
      isWeekPassed: (index) => get().passedWeeks.includes(index),
    }),
    {
      name: "syntra-week-progress",
      partialize: (state) => ({
        phase: state.phase,
        recommendation: state.recommendation,
        hoursPerWeek: state.hoursPerWeek,
        roadmap: state.roadmap,
        activeRoadmapKey: state.activeRoadmapKey,
        savedRoadmaps: state.savedRoadmaps,
        progressByRoadmapKey: state.progressByRoadmapKey,
        savedProjectsByKey: state.savedProjectsByKey,
        unlockedWeekIndex: state.unlockedWeekIndex,
        passedWeeks: state.passedWeeks,
        progressTrackName: state.progressTrackName,
        courseWeights: state.courseWeights,
      }),
    }
  )
);

export default useInterviewStore;
