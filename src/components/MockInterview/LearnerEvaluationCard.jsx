import { BookOpen, Sparkles, Star, Target } from "lucide-react";
import { parseMockEvaluation, ratingBg, ratingColor } from "@/lib/parseMockEvaluation";

function BulletList({ items, bulletClass = "text-emerald-700" }) {
  if (!items?.length) return null;
  return (
    <ul className="mt-2 space-y-1.5">
      {items.map((item, index) => (
        <li key={index} className={`flex gap-2 text-sm leading-relaxed ${bulletClass}`}>
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-current opacity-60" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function LearnerEvaluationCard({ rating, evaluation }) {
  const parsed = parseMockEvaluation(evaluation);

  return (
    <div className="space-y-4">
      <div
        className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${ratingBg(rating)}`}
      >
        <div className="flex items-center gap-2">
          <Star className={ratingColor(rating)} size={18} />
          <p className="font-bold text-gray-900">Interview complete</p>
        </div>
        {rating != null && (
          <span className={`text-lg font-bold ${ratingColor(rating)}`}>{rating}/10</span>
        )}
      </div>

      {parsed.intro && (
        <p className="text-sm leading-relaxed text-gray-600">{parsed.intro}</p>
      )}

      {parsed.strengths.length > 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <Sparkles size={14} />
            What went well
          </p>
          <BulletList items={parsed.strengths} bulletClass="text-emerald-900/90" />
        </div>
      )}

      {parsed.areasToImprove.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
            <Target size={14} />
            Focus areas
          </p>
          <BulletList items={parsed.areasToImprove} bulletClass="text-amber-950/90" />
        </div>
      )}

      {parsed.nextSteps.length > 0 && (
        <div className="rounded-2xl border border-[#1387AE]/25 bg-[#1387AE]/8 p-4">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1387AE]">
            <BookOpen size={14} />
            Next steps
          </p>
          <BulletList items={parsed.nextSteps} bulletClass="text-gray-800" />
        </div>
      )}

      {!parsed.strengths.length &&
        !parsed.areasToImprove.length &&
        !parsed.nextSteps.length &&
        parsed.fullText && (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {parsed.fullText}
          </p>
        )}
    </div>
  );
}
