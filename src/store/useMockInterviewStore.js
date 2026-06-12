import { create } from "zustand";
import { persist } from "zustand/middleware";
import useAuthStore from "./useAuthStore";
import {
  fetchMockTracks,
  fetchMockLanguages,
  startMockInterview,
  sendMockInterviewMessage,
  fetchMockSession,
  endMockInterview,
  synthesizeSpeech,
} from "@/lib/mockInterviewApi";
import { parseMockEvaluation } from "@/lib/parseMockEvaluation";

const LOCAL_INVITES_KEY = "syntra-interview-invites";
const LOCAL_RESULTS_KEY = "syntra-interview-results";
export const INVITE_SENT_EVENT = "syntra-invite-sent";
export const RESULT_SAVED_EVENT = "syntra-interview-result-saved";

function resolveUserIdentity(user) {
  if (!user) return { id: "", email: "" };
  return {
    id: String(user.id ?? user._id ?? "").trim(),
    email: String(user.email ?? "")
      .trim()
      .toLowerCase(),
  };
}

function inviteMatchesUser(invite, user) {
  const { id, email } = resolveUserIdentity(user);
  const inviteEmail = String(invite.learnerEmail ?? "")
    .trim()
    .toLowerCase();

  if (email && inviteEmail && inviteEmail === email) return true;
  if (id && invite.learnerId != null && String(invite.learnerId).trim() === id) {
    return true;
  }
  return false;
}

function readLocalInvites() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_INVITES_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocalInvites(invites) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_INVITES_KEY, JSON.stringify(invites));
}

function upsertLocalInvite(invite) {
  writeLocalInvites([...readLocalInvites(), invite]);
}

function markLocalInviteStatus(inviteId, status) {
  writeLocalInvites(
    readLocalInvites().map((item) =>
      item.id === inviteId ? { ...item, status } : item
    )
  );
}

function readLocalResults() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_RESULTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocalResults(results) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(results));
}

function saveLocalInterviewResult(record) {
  const existing = readLocalResults();
  if (existing.some((item) => item.sessionId === record.sessionId)) return;

  writeLocalResults([record, ...existing]);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(RESULT_SAVED_EVENT));
  }
}

function persistCompletedInterview(state) {
  const user = useAuthStore.getState().user;
  if (!user || !state.sessionId || state.rating == null && !state.evaluation) return;

  const invite = state.activeInviteId
    ? readLocalInvites().find((item) => item.id === state.activeInviteId)
    : null;
  const { id, email } = resolveUserIdentity(user);

  saveLocalInterviewResult({
    id: crypto.randomUUID(),
    sessionId: state.sessionId,
    inviteId: state.activeInviteId,
    learnerId: id || null,
    learnerEmail: email || null,
    learnerName: user.name ?? null,
    recruiterId: invite?.recruiterId ?? null,
    recruiterName: invite?.recruiterName ?? null,
    track: state.track,
    trackLabel: state.trackLabel,
    language: state.language,
    rating: state.rating,
    evaluation: state.evaluation,
    parsed: parseMockEvaluation(state.evaluation),
    messages: state.messages,
    completedAt: new Date().toISOString(),
  });
}

function resultMatchesCandidate(result, candidate) {
  return inviteMatchesUser(
    { learnerId: result.learnerId, learnerEmail: result.learnerEmail },
    candidate
  );
}

const useMockInterviewStore = create(
  persist(
    (set, get) => ({
      tracks: [],
      tracksLoading: false,
      languages: [],
      languagesLoading: false,
      pendingInvites: [],
      invitesLoading: false,
      interviewResults: [],
      resultsLoading: false,

      active: false,
      activeInviteId: null,
      pendingInvite: null,
      interactionMode: null,
      sessionId: null,
      track: null,
      trackLabel: null,
      language: "en-US",
      messages: [],
      done: false,
      rating: null,
      evaluation: null,
      loading: false,
      ttsLoading: false,
      error: null,

      loadTracks: async () => {
        set({ tracksLoading: true });
        try {
          const tracks = await fetchMockTracks();
          set({ tracks, tracksLoading: false });
          return tracks;
        } catch (err) {
          set({ tracksLoading: false, error: err.message });
          return [];
        }
      },

      loadLanguages: async () => {
        set({ languagesLoading: true });
        try {
          const languages = await fetchMockLanguages();
          set({ languages, languagesLoading: false });
          return languages;
        } catch (err) {
          set({ languagesLoading: false, error: err.message });
          return [];
        }
      },

      fetchPendingInvites: async () => {
        const user = useAuthStore.getState().user;
        if (!user) {
          set({ pendingInvites: [], invitesLoading: false });
          return [];
        }

        set({ invitesLoading: true, error: null });
        const invites = readLocalInvites().filter(
          (invite) => invite.status === "pending" && inviteMatchesUser(invite, user)
        );
        set({ pendingInvites: invites, invitesLoading: false });
        return invites;
      },

      sendInvite: async ({ learnerId, learnerName, learnerEmail, track, trackLabel }) => {
        set({ loading: true, error: null });

        const recruiter = useAuthStore.getState().user;
        upsertLocalInvite({
          id: crypto.randomUUID(),
          learnerId: learnerId ?? learnerEmail ?? null,
          learnerEmail: learnerEmail ?? null,
          learnerName,
          track,
          trackLabel,
          recruiterId: recruiter?.id ?? recruiter?._id ?? null,
          recruiterName: recruiter?.name ?? null,
          status: "pending",
          createdAt: new Date().toISOString(),
        });

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent(INVITE_SENT_EVENT));
        }

        set({ loading: false });
        return { success: true, local: true };
      },

      fetchInterviewResults: async () => {
        const recruiter = useAuthStore.getState().user;
        const recruiterId = resolveUserIdentity(recruiter).id;

        set({ resultsLoading: true });
        const results = readLocalResults().filter(
          (result) =>
            !recruiterId ||
            !result.recruiterId ||
            String(result.recruiterId) === recruiterId
        );
        set({ interviewResults: results, resultsLoading: false });
        return results;
      },

      getLatestResultForCandidate: (candidate) => {
        const results = get()
          .interviewResults.filter((result) => resultMatchesCandidate(result, candidate))
          .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
        return results[0] ?? null;
      },

      dismissInvite: async (inviteId) => {
        markLocalInviteStatus(inviteId, "dismissed");
        set({
          pendingInvites: get().pendingInvites.filter((i) => i.id !== inviteId),
        });
      },

      beginFromInvite: async (invite) => {
        if (!get().tracks.length) {
          await get().loadTracks();
        }

        set({
          pendingInvite: invite,
          activeInviteId: invite.id,
          track: invite.track,
          trackLabel: invite.trackLabel ?? invite.track,
          interactionMode: null,
          error: null,
        });
        return { success: true, awaitingMode: true };
      },

      cancelModeSetup: () => {
        set({
          pendingInvite: null,
          activeInviteId: null,
          track: null,
          trackLabel: null,
          interactionMode: null,
          error: null,
        });
      },

      confirmInterviewMode: async (mode, language) => {
        const invite = get().pendingInvite;
        if (!invite) return { success: false, error: "No pending interview." };

        const lang = language || get().language || "en-US";

        if (mode === "voice") {
          if (!navigator.mediaDevices?.getUserMedia) {
            set({ error: "Voice mode is not supported in this browser." });
            return { success: false, error: "Unsupported browser" };
          }
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach((track) => track.stop());
          } catch {
            set({
              error: "Microphone access is required for voice mode. Please allow the mic and try again.",
            });
            return { success: false, error: "Microphone denied" };
          }
        }

        set({
          loading: true,
          error: null,
          interactionMode: mode,
          language: lang,
          pendingInvite: null,
        });

        const result = await get().startSession(invite.track);
        if (!result.success) {
          set({
            loading: false,
            interactionMode: null,
            pendingInvite: invite,
          });
          return result;
        }
        set({ loading: false });
        return result;
      },

      /** Sync local session with GET /api/interview/{session_id} after page refresh */
      restoreSession: async () => {
        const { sessionId, active } = get();
        if (!sessionId || !active) return { success: false };

        try {
          const data = await fetchMockSession(sessionId);
          const trackMeta = get().tracks.find((t) => t.id === data.track);

          set({
            sessionId: data.session_id ?? sessionId,
            track: data.track ?? get().track,
            trackLabel: trackMeta?.label_en ?? get().trackLabel ?? data.track,
            done: Boolean(data.done),
            rating: data.rating ?? get().rating,
            evaluation: data.evaluation ?? get().evaluation,
            error: null,
          });

          if (data.done) {
            persistCompletedInterview(get());
          }

          return { success: true, data };
        } catch (err) {
          const expired =
            /unknown|expired/i.test(err.message) && get().sessionId === sessionId;

          if (expired) {
            set({
              active: false,
              activeInviteId: null,
              sessionId: null,
              track: null,
              trackLabel: null,
              messages: [],
              done: false,
              rating: null,
              evaluation: null,
              error: "Interview session expired. Please start again.",
            });
          } else {
            set({ error: err.message });
          }

          return { success: false, error: err.message };
        }
      },

      startSession: async (trackId) => {
        set({ loading: true, error: null });
        try {
          const data = await startMockInterview(trackId, get().language);
          const trackMeta = get().tracks.find((t) => t.id === trackId);

          set({
            active: true,
            sessionId: data.session_id,
            track: data.track ?? trackId,
            trackLabel: trackMeta?.label_en ?? get().trackLabel ?? trackId,
            messages: [{ role: "interviewer", text: data.message }],
            done: Boolean(data.done),
            rating: null,
            evaluation: null,
            loading: false,
          });

          return { success: true, data };
        } catch (err) {
          set({ loading: false, error: err.message });
          return { success: false, error: err.message };
        }
      },

      submitAnswer: async (message) => {
        const text = message?.trim();
        const { sessionId, loading, done } = get();
        if (!text || !sessionId || loading || done) return;

        set({
          loading: true,
          error: null,
          messages: [...get().messages, { role: "candidate", text }],
        });

        try {
          const data = await sendMockInterviewMessage(sessionId, text);
          const nextMessages = [...get().messages];

          if (data.message) {
            nextMessages.push({ role: "interviewer", text: data.message });
          }

          set({
            messages: nextMessages,
            done: Boolean(data.done),
            rating: data.rating ?? get().rating,
            evaluation: data.evaluation ?? get().evaluation,
            loading: false,
          });

          if (data.done) {
            persistCompletedInterview(get());
          }

          if (data.done && get().activeInviteId) {
            markLocalInviteStatus(get().activeInviteId, "completed");
            set({
              pendingInvites: get().pendingInvites.filter(
                (i) => i.id !== get().activeInviteId
              ),
            });
          }

          return { success: true, data };
        } catch (err) {
          set({ loading: false, error: err.message });
          return { success: false, error: err.message };
        }
      },

      playQuestionTts: async (text) => {
        const content = text?.trim();
        if (!content) return;

        set({ ttsLoading: true, error: null });
        try {
          const blob = await synthesizeSpeech(content);
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);

          await new Promise((resolve, reject) => {
            audio.onended = () => {
              URL.revokeObjectURL(url);
              resolve();
            };
            audio.onerror = () => {
              URL.revokeObjectURL(url);
              reject(new Error("Could not play audio."));
            };
            audio.play().catch(reject);
          });

          set({ ttsLoading: false });
        } catch (err) {
          set({ ttsLoading: false, error: err.message });
        }
      },

      endSession: async () => {
        const { sessionId, done } = get();
        if (sessionId && !done) {
          try {
            await endMockInterview(sessionId);
          } catch {
            /* ignore */
          }
        }

        set({
          active: false,
          activeInviteId: null,
          pendingInvite: null,
          interactionMode: null,
          sessionId: null,
          track: null,
          trackLabel: null,
          messages: [],
          done: false,
          rating: null,
          evaluation: null,
          loading: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "syntra-mock-interview",
      partialize: (state) => ({
        sessionId: state.sessionId,
        track: state.track,
        trackLabel: state.trackLabel,
        interactionMode: state.interactionMode,
        language: state.language,
        messages: state.messages,
        done: state.done,
        rating: state.rating,
        evaluation: state.evaluation,
        active: state.active,
        activeInviteId: state.activeInviteId,
      }),
    }
  )
);

export default useMockInterviewStore;
