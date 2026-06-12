import { useEffect } from "react";
import { Bell, Loader2, X, Video } from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import useMockInterviewStore, {
  INVITE_SENT_EVENT,
} from "@/store/useMockInterviewStore";

export default function InterviewInviteBanner({ className = "" }) {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const user = useAuthStore((s) => s.user);
  const pendingInvites = useMockInterviewStore((s) => s.pendingInvites);
  const invitesLoading = useMockInterviewStore((s) => s.invitesLoading);
  const loading = useMockInterviewStore((s) => s.loading);
  const fetchPendingInvites = useMockInterviewStore((s) => s.fetchPendingInvites);
  const beginFromInvite = useMockInterviewStore((s) => s.beginFromInvite);
  const dismissInvite = useMockInterviewStore((s) => s.dismissInvite);
  const loadTracks = useMockInterviewStore((s) => s.loadTracks);

  useEffect(() => {
    if (!hasHydrated || user?.role !== "learner") return undefined;

    const refresh = () => {
      loadTracks();
      fetchPendingInvites();
    };

    refresh();

    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener(INVITE_SENT_EVENT, refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener(INVITE_SENT_EVENT, refresh);
    };
  }, [
    hasHydrated,
    user?.role,
    user?.id,
    user?._id,
    user?.email,
    loadTracks,
    fetchPendingInvites,
  ]);

  if (!hasHydrated || user?.role !== "learner") {
    return null;
  }

  if (invitesLoading) {
    return (
      <div className={`mx-auto w-full max-w-3xl px-4 ${className}`}>
        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin" />
          Checking for interview invitations…
        </div>
      </div>
    );
  }

  if (pendingInvites.length === 0) {
    return null;
  }

  const invite = pendingInvites[0];

  return (
    <div className={`mx-auto w-full max-w-3xl px-4 ${className}`}>
      <div className="relative overflow-hidden rounded-2xl border-2 border-[#7E1487]/35 bg-gradient-to-r from-[#7E1487]/12 via-white to-[#1387AE]/12 p-5 shadow-[0_8px_32px_rgba(126,20,135,0.15)]">
        <button
          type="button"
          onClick={() => dismissInvite(invite.id)}
          className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 transition hover:bg-white/80 hover:text-gray-600"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>

        <div className="flex flex-wrap items-start gap-4 pr-8">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#7E1487]/15 text-[#7E1487]">
            <Bell size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#7E1487]">
              Interview invitation
            </p>
            <h3 className="mt-1 text-base font-bold text-gray-900">
              Mock interview: {invite.trackLabel ?? invite.track}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {invite.recruiterName
                ? `${invite.recruiterName} invited you to a mock interview for this track.`
                : "A recruiter invited you to a live mock interview for this track."}
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={() => beginFromInvite(invite)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7E1487] to-[#1387AE] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Video size={16} />
              )}
              Join interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
