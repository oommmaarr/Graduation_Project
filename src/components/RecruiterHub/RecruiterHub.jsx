import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  BadgeCheck,
  Mail,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  RefreshCw,
  Video,
  Star,
  FileText,
} from "lucide-react";
import { api } from "@/store/useAuthStore";
import InviteInterviewModal from "@/components/MockInterview/InviteInterviewModal";
import InterviewResultModal from "@/components/MockInterview/InterviewResultModal";
import useMockInterviewStore, {
  RESULT_SAVED_EVENT,
} from "@/store/useMockInterviewStore";
import { ratingColor } from "@/lib/parseMockEvaluation";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return "—";
  }
}

function UserAvatar({ user }) {
  const src = user.imageUrl || user.avatar;
  const initial = (user.name || "?").charAt(0).toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={user.name}
        className="size-14 shrink-0 rounded-2xl object-cover ring-2 ring-white shadow-md"
      />
    );
  }

  return (
    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1387AE] to-[#7E1487] text-xl font-bold text-white shadow-md">
      {initial}
    </div>
  );
}

function ReadonlySkillPill({ label }) {
  return (
    <div className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-2.5 py-2.5 transition-all hover:border-[#1387AE]/25">
      <span className="text-center text-[11px] font-semibold leading-snug text-gray-800 break-words">
        {label}
      </span>
    </div>
  );
}

function CandidateCard({ user, interviewResult, expanded, onToggleExpanded }) {
  const skills = user.skills ?? [];
  const finishedTracks = user.finishedTracks ?? [];
  const previewCount = 6;
  const hasMore = skills.length > previewCount;
  const visibleSkills = expanded || !hasMore ? skills : skills.slice(0, previewCount);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);

  const parsed = interviewResult?.parsed;

  return (
    <article className="flex h-fit flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_4px_32px_rgba(19,135,174,0.08)] transition hover:border-[#1387AE]/30 hover:shadow-lg">
      <div className="border-b border-gray-100 bg-gradient-to-r from-[#1387AE]/5 to-[#7E1487]/5 px-5 py-4">
        <div className="flex items-start gap-4">
          <UserAvatar user={user} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-bold text-gray-900">{user.name}</h3>
              {user.trackFinished && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
                  <BadgeCheck size={12} />
                  Track complete
                </span>
              )}
            </div>
            <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-gray-500">
              <Mail size={14} className="shrink-0 text-gray-400" />
              {user.email}
            </p>
            <p className="mt-2 text-[11px] text-gray-400">
              Finished {formatDate(user.updatedAt)}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-[#7E1487]/10 px-3 py-1 text-xs font-bold text-[#7E1487]">
            {skills.length} skills
          </span>
        </div>
      </div>

      {finishedTracks.length > 0 && (
        <div className="border-b border-gray-100 bg-emerald-50/40 px-5 py-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-emerald-800/70">
            Completed tracks
          </p>
          <div className="flex flex-wrap gap-2.5">
            {finishedTracks.map((track) => (
              <span
                key={track}
                className="inline-flex max-w-full items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-bold text-emerald-900 shadow-sm"
                title={track}
              >
                <GraduationCap size={16} className="shrink-0 text-emerald-600" />
                <span className="truncate">{track}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className={`px-5 py-4 ${expanded ? "" : "min-h-[13rem]"}`}>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Verified skills
        </p>
        {skills.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              {visibleSkills.map((skill, index) => (
                <ReadonlySkillPill
                  key={`${user.id}-skill-${index}-${skill}`}
                  label={skill}
                />
              ))}
            </div>
            {hasMore && (
              <button
                type="button"
                onClick={onToggleExpanded}
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#1387AE] transition hover:text-[#0b6281]"
              >
                {expanded ? (
                  <>
                    Show less <ChevronUp size={14} />
                  </>
                ) : (
                  <>
                    Show all {skills.length} skills <ChevronDown size={14} />
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500">No skills listed.</p>
        )}

        {interviewResult && (
          <div className="mt-4 rounded-xl border border-[#1387AE]/25 bg-gradient-to-br from-[#1387AE]/8 to-[#7E1487]/5 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#1387AE]">
                <Star size={13} />
                Mock interview result
              </p>
              <span className={`text-base font-bold ${ratingColor(interviewResult.rating)}`}>
                {interviewResult.rating}/10
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {interviewResult.trackLabel ?? interviewResult.track} ·{" "}
              {formatDate(interviewResult.completedAt)}
            </p>
            {parsed?.strengths?.[0] && (
              <p className="mt-2 text-xs leading-relaxed text-gray-700">
                <span className="font-semibold text-emerald-800">Strength: </span>
                {parsed.strengths[0]}
              </p>
            )}
            {parsed?.areasToImprove?.[0] && (
              <p className="mt-1 text-xs leading-relaxed text-gray-700">
                <span className="font-semibold text-amber-800">Concern: </span>
                {parsed.areasToImprove[0]}
              </p>
            )}
            <button
              type="button"
              onClick={() => setResultOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#7E1487] transition hover:text-[#1387AE]"
            >
              <FileText size={13} />
              View full report
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#7E1487]/25 bg-gradient-to-r from-[#7E1487]/8 to-[#1387AE]/8 px-4 py-2.5 text-sm font-semibold text-[#7E1487] transition hover:from-[#7E1487]/12 hover:to-[#1387AE]/12"
        >
          <Video size={16} />
          {inviteSent ? "Invite sent" : "Send mock interview invite"}
        </button>
      </div>

      {inviteOpen && (
        <InviteInterviewModal
          user={user}
          onClose={() => setInviteOpen(false)}
          onSent={() => {
            setInviteSent(true);
            setInviteOpen(false);
          }}
        />
      )}

      {resultOpen && interviewResult && (
        <InterviewResultModal
          result={interviewResult}
          onClose={() => setResultOpen(false)}
        />
      )}
    </article>
  );
}

export default function RecruiterHub() {
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [expandedUserIds, setExpandedUserIds] = useState(() => new Set());
  const fetchInterviewResults = useMockInterviewStore((s) => s.fetchInterviewResults);
  const getLatestResultForCandidate = useMockInterviewStore(
    (s) => s.getLatestResultForCandidate
  );

  const toggleUserSkills = (userId) => {
    setExpandedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const loadCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get("user/finished-tracks");
      setUsers(Array.isArray(data?.users) ? data.users : []);
      setCount(data?.count ?? data?.users?.length ?? 0);
      setExpandedUserIds(new Set());
    } catch (err) {
      setError(err.message || "Failed to load completed learners.");
      setUsers([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
    fetchInterviewResults();

    const refreshResults = () => fetchInterviewResults();
    window.addEventListener(RESULT_SAVED_EVENT, refreshResults);
    window.addEventListener("focus", refreshResults);

    return () => {
      window.removeEventListener(RESULT_SAVED_EVENT, refreshResults);
      window.removeEventListener("focus", refreshResults);
    };
  }, [fetchInterviewResults]);

  const allSkills = useMemo(() => {
    const set = new Set();
    for (const user of users) {
      for (const skill of user.skills ?? []) {
        if (skill) set.add(skill);
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !q ||
        user.name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        (user.skills ?? []).some((s) => s.toLowerCase().includes(q));

      const matchesSkill =
        !skillFilter ||
        (user.skills ?? []).some(
          (s) => s.toLowerCase() === skillFilter.toLowerCase()
        );

      return matchesSearch && matchesSkill;
    });
  }, [users, search, skillFilter]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <style>{`
        @keyframes slideQ { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#7E1487]/25 bg-[#7E1487]/8 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#7E1487]">
            <GraduationCap size={14} />
            Recruiter Hub
          </div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Completed track talent
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Browse learners who finished their roadmaps — with verified skills
            pulled from their profiles.
          </p>
        </div>

        <button
          type="button"
          onClick={loadCandidates}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="mb-6 grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or skill…"
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#1387AE] focus:ring-1 focus:ring-[#1387AE]/20"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users size={18} className="text-[#1387AE]" />
          <span className="font-semibold text-gray-900">{filteredUsers.length}</span>
          <span>of {count} candidates</span>
        </div>
      </div>

      {allSkills.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSkillFilter("")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              !skillFilter
                ? "bg-[#1387AE] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All skills
          </button>
          {allSkills.slice(0, 12).map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => setSkillFilter(skillFilter === skill ? "" : skill)}
              className={`max-w-[200px] truncate rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                skillFilter === skill
                  ? "bg-[#7E1487] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title={skill}
            >
              {skill}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-500">
          <Loader2 size={32} className="animate-spin text-[#1387AE]" />
          <p className="text-sm">Loading completed learners…</p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center">
          <AlertCircle size={28} className="mx-auto mb-3 text-red-500" />
          <p className="text-sm font-medium text-red-700">{error}</p>
          <button
            type="button"
            onClick={loadCandidates}
            className="mt-4 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && filteredUsers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-16 text-center">
          <Users size={36} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-700">No candidates found</p>
          <p className="mt-1 text-xs text-gray-500">
            {users.length === 0
              ? "No learners have finished their track yet."
              : "Try adjusting your search or skill filter."}
          </p>
        </div>
      )}

      {!loading && !error && filteredUsers.length > 0 && (
        <div className="grid items-start gap-5 md:grid-cols-2">
          {filteredUsers.map((user) => (
            <CandidateCard
              key={user.id ?? user.email}
              user={user}
              interviewResult={getLatestResultForCandidate(user)}
              expanded={expandedUserIds.has(user.id)}
              onToggleExpanded={() => toggleUserSkills(user.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
