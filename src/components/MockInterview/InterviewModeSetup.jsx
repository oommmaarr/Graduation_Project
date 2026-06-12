import { useEffect, useState } from "react";
import { Globe, Loader2, MessageSquare, Mic, X } from "lucide-react";
import useMockInterviewStore from "@/store/useMockInterviewStore";
import PulseRings from "@/components/MockInterview/PulseRings";

export default function InterviewModeSetup() {
  const pendingInvite = useMockInterviewStore((s) => s.pendingInvite);
  const languages = useMockInterviewStore((s) => s.languages);
  const languagesLoading = useMockInterviewStore((s) => s.languagesLoading);
  const loading = useMockInterviewStore((s) => s.loading);
  const error = useMockInterviewStore((s) => s.error);
  const loadLanguages = useMockInterviewStore((s) => s.loadLanguages);
  const confirmInterviewMode = useMockInterviewStore((s) => s.confirmInterviewMode);
  const cancelModeSetup = useMockInterviewStore((s) => s.cancelModeSetup);
  const clearError = useMockInterviewStore((s) => s.clearError);

  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [selecting, setSelecting] = useState(null);

  useEffect(() => {
    loadLanguages();
  }, [loadLanguages]);

  useEffect(() => {
    if (languages.length > 0 && !languages.some((l) => l.code === selectedLanguage)) {
      setSelectedLanguage(languages[0].code);
    }
  }, [languages, selectedLanguage]);

  if (!pendingInvite) return null;

  const trackLabel = pendingInvite.trackLabel ?? pendingInvite.track;
  const isArabic = selectedLanguage.startsWith("ar");

  const handleSelect = async (mode) => {
    clearError();
    setSelecting(mode);
    await confirmInterviewMode(mode, selectedLanguage);
    setSelecting(null);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gradient-to-br from-[#7E1487]/10 via-white to-[#1387AE]/10 p-4 backdrop-blur-md">
      <div className="relative max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#1387AE]/20 bg-white shadow-[0_24px_80px_rgba(19,135,174,0.18)]">
        <button
          type="button"
          onClick={cancelModeSetup}
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          aria-label="Cancel"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center px-6 pb-8 pt-10 text-center">
          <PulseRings active size="lg" />

          <p className="mt-6 text-[11px] font-bold uppercase tracking-widest text-[#7E1487]">
            Mock interview
          </p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">{trackLabel}</h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
            {isArabic
              ? "اختر اللغة وطريقة الرد — وضع الصوت يحتاج إذن الميكروفون."
              : "Pick a language and how you want to respond. Voice mode needs microphone access."}
          </p>

          <div className="mt-6 w-full text-left">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <Globe size={14} />
              {isArabic ? "اللغة" : "Language"}
            </p>
            {languagesLoading ? (
              <div className="flex items-center gap-2 py-3 text-sm text-gray-500">
                <Loader2 size={16} className="animate-spin" />
                Loading languages…
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                      selectedLanguage === lang.code
                        ? "border-[#7E1487] bg-[#7E1487]/10 text-[#7E1487]"
                        : "border-gray-200 bg-white text-gray-700 hover:border-[#1387AE]/30"
                    }`}
                  >
                    {lang.label_en}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="mt-4 w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          <div className="mt-6 grid w-full gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={loading || languagesLoading}
              onClick={() => handleSelect("chat")}
              className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-5 py-6 transition hover:border-[#1387AE]/40 hover:bg-[#1387AE]/5 disabled:opacity-60"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1387AE]/10 text-[#1387AE] transition group-hover:scale-105">
                {selecting === "chat" && loading ? (
                  <Loader2 size={26} className="animate-spin" />
                ) : (
                  <MessageSquare size={26} />
                )}
              </span>
              <div>
                <p className="font-bold text-gray-900">{isArabic ? "كتابة" : "Chat"}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {isArabic ? "ردود نصية فقط" : "Text answers only"}
                </p>
              </div>
            </button>

            <button
              type="button"
              disabled={loading || languagesLoading}
              onClick={() => handleSelect("voice")}
              className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-[#7E1487]/25 bg-gradient-to-br from-[#7E1487]/8 to-[#1387AE]/8 px-5 py-6 transition hover:border-[#7E1487]/45 hover:shadow-md disabled:opacity-60"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7E1487]/15 text-[#7E1487] transition group-hover:scale-105">
                {selecting === "voice" && loading ? (
                  <Loader2 size={26} className="animate-spin" />
                ) : (
                  <Mic size={26} />
                )}
              </span>
              <div>
                <p className="font-bold text-gray-900">{isArabic ? "صوت" : "Voice"}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {isArabic ? "صوت فقط · ميكروفون" : "Voice only · mic required"}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
