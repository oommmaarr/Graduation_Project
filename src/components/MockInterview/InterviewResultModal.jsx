import { Star, X } from "lucide-react";
import { parseMockEvaluation, ratingBg, ratingColor } from "@/lib/parseMockEvaluation";

function Section({ title, items, className }) {
  if (!items?.length) return null;
  return (
    <div className={className}>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">{title}</p>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2 text-sm leading-relaxed text-gray-800">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#7E1487]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function InterviewResultModal({ result, onClose }) {
  const parsed = parseMockEvaluation(result.evaluation);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-6 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#7E1487]">
              Interview report
            </p>
            <h3 className="text-lg font-bold text-gray-900">{result.learnerName}</h3>
            <p className="text-sm text-gray-500">
              {result.trackLabel ?? result.track} · {new Date(result.completedAt).toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${ratingBg(result.rating)}`}
          >
            <Star className={ratingColor(result.rating)} size={20} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Score</p>
              <p className={`text-2xl font-bold ${ratingColor(result.rating)}`}>
                {result.rating != null ? `${result.rating}/10` : "—"}
              </p>
            </div>
          </div>

          <Section
            title="Strengths"
            items={parsed.strengths}
            className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4"
          />

          <Section
            title="Areas of concern"
            items={parsed.areasToImprove}
            className="rounded-xl border border-amber-100 bg-amber-50/50 p-4"
          />

          <Section
            title="Suggested next steps"
            items={parsed.nextSteps}
            className="rounded-xl border border-gray-100 bg-gray-50 p-4"
          />

          {result.evaluation && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                Full evaluation
              </p>
              <p className="whitespace-pre-wrap rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm leading-relaxed text-gray-800">
                {result.evaluation}
              </p>
            </div>
          )}

          {result.messages?.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                Transcript
              </p>
              <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-4">
                {result.messages.map((msg, index) => (
                  <div key={index} className="text-sm">
                    <span
                      className={`font-semibold ${
                        msg.role === "interviewer" ? "text-[#1387AE]" : "text-[#7E1487]"
                      }`}
                    >
                      {msg.role === "interviewer" ? "Interviewer" : "Candidate"}:
                    </span>{" "}
                    <span className="text-gray-700">{msg.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-gradient-to-r from-[#7E1487] to-[#1387AE] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
