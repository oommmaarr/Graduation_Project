import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Mic, MicOff, Send, X, MessageSquare } from "lucide-react";
import useMockInterviewStore from "@/store/useMockInterviewStore";
import LearnerEvaluationCard from "@/components/MockInterview/LearnerEvaluationCard";
import PulseRings from "@/components/MockInterview/PulseRings";

const VOICE_UI = {
  en: {
    interviewerSpeaking: "Listening to the interviewer…",
    speakAnswer: "Speak your answer…",
    processing: "Processing your answer…",
    tapMic: "Tap the mic when you're ready to answer",
    micOn: "Microphone is on — speak clearly.",
    micError: "Could not capture audio. Tap the mic to try again.",
    notSupported: "Speech recognition is not supported in this browser.",
    voiceOnly: "Voice interview",
  },
  ar: {
    interviewerSpeaking: "جاري الاستماع للمحاور…",
    speakAnswer: "تحدّث بإجابتك…",
    processing: "جاري معالجة إجابتك…",
    tapMic: "اضغط على الميكروفون عندما تكون جاهزاً",
    micOn: "الميكروفون شغّال — تحدّث بوضوح.",
    micError: "تعذّر التقاط الصوت. اضغط الميكروفون للمحاولة مرة أخرى.",
    notSupported: "التعرف على الصوت غير مدعوم في هذا المتصفح.",
    voiceOnly: "مقابلة صوتية",
  },
};

function MessageBubble({ role, text }) {
  const isInterviewer = role === "interviewer";
  return (
    <div className={`flex ${isInterviewer ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isInterviewer
            ? "rounded-bl-md border border-[#1387AE]/20 bg-[#1387AE]/8 text-gray-800"
            : "rounded-br-md bg-gradient-to-r from-[#7E1487] to-[#1387AE] text-white"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

function VoiceInterviewControls({
  listening,
  ttsLoading,
  loading,
  statusText,
  hintText,
  onToggleMic,
}) {
  const isActive = listening || ttsLoading;

  return (
    <div className="flex min-h-[min(52vh,480px)] flex-col items-center justify-center py-8">
      <PulseRings
        active={isActive}
        color={ttsLoading ? "teal" : listening ? "purple" : "mixed"}
        size="lg"
      />

      <p className="mt-8 text-base font-semibold text-gray-800">{statusText}</p>
      {hintText && <p className="mt-2 text-sm text-gray-500">{hintText}</p>}

      <button
        type="button"
        onClick={onToggleMic}
        disabled={loading || ttsLoading}
        className={`mt-8 flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition ${
          listening
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-gradient-to-r from-[#7E1487] to-[#1387AE] text-white hover:opacity-90"
        } disabled:opacity-50`}
        aria-label={listening ? "Stop microphone" : "Start microphone"}
      >
        {listening ? <MicOff size={32} /> : <Mic size={32} />}
      </button>
    </div>
  );
}

export default function MockInterviewPanel() {
  const {
    sessionId,
    trackLabel,
    interactionMode,
    language,
    messages,
    done,
    rating,
    evaluation,
    loading,
    ttsLoading,
    error,
    loadTracks,
    restoreSession,
    submitAnswer,
    playQuestionTts,
    endSession,
  } = useMockInterviewStore();

  const isVoice = interactionMode === "voice";
  const ui = language?.startsWith("ar") ? VOICE_UI.ar : VOICE_UI.en;

  const [answer, setAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceHint, setVoiceHint] = useState("");
  const recognitionRef = useRef(null);
  const bottomRef = useRef(null);
  const spokenForCountRef = useRef(0);
  const voiceBusyRef = useRef(false);

  const voiceStatusText = ttsLoading
    ? ui.interviewerSpeaking
    : listening
      ? ui.speakAnswer
      : loading
        ? ui.processing
        : ui.tapMic;

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop?.();
    setListening(false);
  }, []);

  const startVoiceListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceHint(ui.notSupported);
      return;
    }

    stopListening();

    const recognition = new SpeechRecognition();
    recognition.lang = language || "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setVoiceHint(ui.micOn);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = (event) => {
      setListening(false);
      if (event.error !== "aborted") {
        setVoiceHint(ui.micError);
      }
    };
    recognition.onresult = async (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (!transcript) return;
      setVoiceHint(ui.processing);
      stopListening();
      await submitAnswer(transcript);
      setVoiceHint("");
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [language, stopListening, submitAnswer, ui]);

  const runVoiceQuestionFlow = useCallback(async () => {
    if (!isVoice || done || loading || voiceBusyRef.current) return;

    const interviewerMessages = messages.filter((m) => m.role === "interviewer");
    const count = interviewerMessages.length;
    if (count <= spokenForCountRef.current) return;

    const latest = interviewerMessages[interviewerMessages.length - 1]?.text;
    if (!latest) return;

    voiceBusyRef.current = true;
    spokenForCountRef.current = count;

    try {
      stopListening();
      setVoiceHint("");
      await playQuestionTts(latest);
      if (!useMockInterviewStore.getState().done) {
        startVoiceListening();
      }
    } finally {
      voiceBusyRef.current = false;
    }
  }, [isVoice, done, loading, messages, playQuestionTts, startVoiceListening, stopListening]);

  useEffect(() => {
    if (!isVoice) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, done, isVoice]);

  useEffect(() => {
    loadTracks();
    if (sessionId) restoreSession();
  }, [sessionId, loadTracks, restoreSession]);

  useEffect(() => {
    if (!isVoice || done) return;
    runVoiceQuestionFlow();
  }, [isVoice, done, messages, runVoiceQuestionFlow]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
    };
  }, []);

  const handleSend = async () => {
    const text = answer.trim();
    if (!text || loading || done) return;
    setAnswer("");
    await submitAnswer(text);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_8px_48px_rgba(19,135,174,0.12)]">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-[#1387AE]/8 to-[#7E1487]/8 px-5 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#7E1487]">
              {isVoice ? ui.voiceOnly : "Chat"} ·{" "}
              {language?.startsWith("ar") ? "العربية" : "English"}
            </p>
            <h2 className="text-lg font-bold text-gray-900">{trackLabel}</h2>
          </div>
          <button
            type="button"
            onClick={endSession}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close interview"
          >
            <X size={18} />
          </button>
        </div>

        {!done && isVoice && (
          <VoiceInterviewControls
            listening={listening}
            ttsLoading={ttsLoading}
            loading={loading}
            statusText={voiceStatusText}
            hintText={voiceHint}
            onToggleMic={() => (listening ? stopListening() : startVoiceListening())}
          />
        )}

        {(!isVoice || done) && (
          <div
            className={`space-y-3 overflow-y-auto px-5 py-5 ${
              isVoice ? "max-h-none" : "max-h-[min(52vh,520px)]"
            }`}
          >
            {!isVoice &&
              messages.map((msg, index) => (
                <MessageBubble key={`${msg.role}-${index}`} role={msg.role} text={msg.text} />
              ))}

            {done && (
              <div className="rounded-2xl border border-gray-100 bg-white p-1">
                <LearnerEvaluationCard rating={rating} evaluation={evaluation} />
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {error && (
          <p className="mx-5 mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </p>
        )}

        {!done && !isVoice && (
          <div className="border-t border-gray-100 px-5 py-4">
            <div className="flex gap-2">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={3}
                placeholder={
                  language?.startsWith("ar") ? "اكتب إجابتك…" : "Type your answer…"
                }
                className="min-h-[72px] flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#1387AE] focus:ring-1 focus:ring-[#1387AE]/20"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={loading || !answer.trim()}
                className="flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-xl bg-gradient-to-r from-[#7E1487] to-[#1387AE] text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
        )}

        {done && (
          <div className="border-t border-gray-100 px-5 py-4">
            <button
              type="button"
              onClick={endSession}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7E1487] to-[#1387AE] px-6 py-2.5 text-sm font-semibold text-white"
            >
              <MessageSquare size={16} />
              {language?.startsWith("ar") ? "العودة إلى Tech" : "Back to Tech"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
