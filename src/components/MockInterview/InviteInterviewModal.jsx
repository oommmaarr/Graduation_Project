import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Send, X, XCircle } from "lucide-react";
import useMockInterviewStore from "@/store/useMockInterviewStore";

export default function InviteInterviewModal({ user, onClose, onSent }) {
  const tracks = useMockInterviewStore((s) => s.tracks);
  const tracksLoading = useMockInterviewStore((s) => s.tracksLoading);
  const loading = useMockInterviewStore((s) => s.loading);
  const error = useMockInterviewStore((s) => s.error);
  const loadTracks = useMockInterviewStore((s) => s.loadTracks);
  const sendInvite = useMockInterviewStore((s) => s.sendInvite);
  const clearError = useMockInterviewStore((s) => s.clearError);

  const [selectedTrack, setSelectedTrack] = useState("");
  const [step, setStep] = useState("form");
  const [sentTrackLabel, setSentTrackLabel] = useState("");

  useEffect(() => {
    clearError();
    loadTracks();
  }, [loadTracks, clearError]);

  const trackOptions = useMemo(
    () =>
      tracks.map((track) => ({
        value: track.id,
        label: track.label_en,
      })),
    [tracks]
  );

  useEffect(() => {
    if (trackOptions.length > 0 && !selectedTrack) {
      setSelectedTrack(trackOptions[0].value);
    }
  }, [trackOptions, selectedTrack]);

  const handleSend = async () => {
    if (!selectedTrack) return;
    const option = trackOptions.find((o) => o.value === selectedTrack);
    const trackLabel = option?.label ?? selectedTrack;

    const result = await sendInvite({
      learnerId: user.id ?? user._id ?? null,
      learnerEmail: user.email,
      learnerName: user.name,
      track: selectedTrack,
      trackLabel,
    });

    if (result.success) {
      setSentTrackLabel(trackLabel);
      setStep("success");
    } else {
      setStep("error");
    }
  };

  const handleDone = () => {
    onSent?.({ success: true, trackLabel: sentTrackLabel });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        {step === "success" ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="text-emerald-600" size={36} />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
              Success
            </p>
            <h3 className="mt-2 text-xl font-bold text-gray-900">Invite sent!</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              <span className="font-semibold text-gray-900">{user.name}</span> will see a mock
              interview invitation for{" "}
              <span className="font-semibold text-[#7E1487]">{sentTrackLabel}</span> on their Tech
              page.
            </p>
            <button
              type="button"
              onClick={handleDone}
              className="mt-6 w-full rounded-full bg-gradient-to-r from-[#7E1487] to-[#1387AE] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Done
            </button>
          </div>
        ) : step === "error" ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <XCircle className="text-red-600" size={36} />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-red-600">
              Failed
            </p>
            <h3 className="mt-2 text-xl font-bold text-gray-900">Could not send invite</h3>
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error || "Something went wrong. Please try again."}
            </p>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearError();
                  setStep("form");
                }}
                className="flex-1 rounded-full bg-gradient-to-r from-[#7E1487] to-[#1387AE] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Try again
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#7E1487]">
                  Send invite
                </p>
                <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Interview track
            </label>
            {tracksLoading ? (
              <div className="flex items-center gap-2 py-6 text-sm text-gray-500">
                <Loader2 size={16} className="animate-spin" />
                Loading tracks…
              </div>
            ) : trackOptions.length === 0 ? (
              <p className="py-4 text-sm text-gray-500">No tracks available.</p>
            ) : (
              <select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#1387AE] focus:ring-1 focus:ring-[#1387AE]/20"
              >
                {trackOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}

            {(user.finishedTracks?.length ?? 0) > 0 && (
              <p className="mt-2 text-xs text-gray-500">
                Completed: {user.finishedTracks.join(", ")}
              </p>
            )}

            {error && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={loading || !selectedTrack || tracksLoading || trackOptions.length === 0}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7E1487] to-[#1387AE] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Send invite
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
