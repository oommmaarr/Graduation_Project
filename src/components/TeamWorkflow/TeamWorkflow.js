import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  ArrowRight,
  CheckCircle2,
  User,
  Briefcase,
  Loader2,
  Wand2,
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Route,
  AlertTriangle,
} from "lucide-react";
import axios from "axios";

const PREDEFINED_SKILLS = [
  "React", "Node.js", "Python", "AWS", "HTML", 
  "CSS", "JavaScript", "Figma", "MongoDB", "Docker", "SQL"
];

// ─── Shared keyframes ─────────────────────────────────────────────────────────
const Keyframes = () => (
  <style>{`
    @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
    @keyframes slideQ { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
    @keyframes pathReveal { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
    @keyframes shimmer { 0% { background-position: 200% center } 100% { background-position: -200% center } }
  `}</style>
);

// ─── API Setup ────────────────────────────────────────────────────────────────
const TEAM_API_URL =
  import.meta.env.VITE_TEAM_API_URL ||
  "https://taskdistribution-production.up.railway.app";
const MINI_PATH_API_URL =
  import.meta.env.VITE_MINI_PATH_API_URL ||
  "https://syntra-ai-production.up.railway.app";

function normalizeSkill(skill) {
  return String(skill).trim().toLowerCase();
}

function memberHasSkill(memberSkills, skill) {
  const target = normalizeSkill(skill);
  return (memberSkills ?? []).some((s) => {
    const normalized = normalizeSkill(s);
    return (
      normalized === target ||
      normalized.includes(target) ||
      target.includes(normalized)
    );
  });
}

function computeLearningGaps(teamMembers, results) {
  const gapsByMember = {};

  for (const member of teamMembers) {
    const name = member.name.trim();
    if (!name) continue;
    gapsByMember[name] = new Set();
  }

  for (const item of results?.assigned_tasks ?? []) {
    const name = item.assigned_to;
    const member = teamMembers.find((m) => m.name.trim() === name);
    const memberSkills = member?.skills ?? [];

    for (const skill of item.task?.Required_Skills ?? []) {
      if (!memberHasSkill(memberSkills, skill)) {
        if (!gapsByMember[name]) gapsByMember[name] = new Set();
        gapsByMember[name].add(skill);
      }
    }
  }

  for (const task of results?.unassigned_tasks ?? []) {
    for (const skill of task.Required_Skills ?? []) {
      for (const member of teamMembers) {
        const name = member.name.trim();
        if (!name || memberHasSkill(member.skills, skill)) continue;
        if (!gapsByMember[name]) gapsByMember[name] = new Set();
        gapsByMember[name].add(skill);
      }
    }
  }

  return Object.fromEntries(
    Object.entries(gapsByMember).map(([name, skills]) => [
      name,
      [...skills].sort((a, b) => a.localeCompare(b)),
    ])
  );
}

function skillsMatch(a, b) {
  const left = normalizeSkill(a);
  const right = normalizeSkill(b);
  return left === right || left.includes(right) || right.includes(left);
}

function findTaskContextForGap(memberName, missingSkill, teamMembers, results, projectDescription) {
  const member = teamMembers.find((m) => m.name.trim() === memberName);
  const memberSkills = member?.skills ?? [];

  for (const item of results?.assigned_tasks ?? []) {
    if (item.assigned_to !== memberName) continue;
    const required = item.task?.Required_Skills ?? [];
    if (required.some((s) => skillsMatch(s, missingSkill))) {
      return {
        task_title: item.task.Task_Name,
        task_description: item.task.Description,
        member_skills: memberSkills,
        missing_skill: missingSkill,
      };
    }
  }

  for (const task of results?.unassigned_tasks ?? []) {
    const required = task.Required_Skills ?? [];
    if (required.some((s) => skillsMatch(s, missingSkill))) {
      return {
        task_title: task.Task_Name,
        task_description: task.Description,
        member_skills: memberSkills,
        missing_skill: missingSkill,
      };
    }
  }

  return {
    task_title: `Learn ${missingSkill}`,
    task_description:
      projectDescription.trim() ||
      `The team member needs to learn ${missingSkill} to complete assigned project work.`,
    member_skills: memberSkills,
    missing_skill: missingSkill,
  };
}

function miniPathKey(memberName, skill) {
  return `${memberName}::${skill}`;
}

function sumPathDuration(steps) {
  let total = 0;
  for (const step of steps ?? []) {
    const match = String(step.duration ?? "").match(/(\d+)/);
    if (match) total += Number.parseInt(match[1], 10);
  }
  return total > 0 ? `~${total}h` : null;
}

function MiniPathTimeline({ data }) {
  if (!data?.mini_path?.length) return null;

  const totalDuration = sumPathDuration(data.mini_path);

  return (
    <div className="relative px-4 pb-4 pt-1">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#1387AE]/10 pb-3">
        <div className="flex items-center gap-2">
          <Route size={14} className="text-[#7E1487]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Learning roadmap
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#7E1487]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#7E1487]">
            {data.mini_path.length} steps
          </span>
          {totalDuration && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#1387AE]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#1387AE]">
              <Clock size={10} />
              {totalDuration}
            </span>
          )}
        </div>
      </div>

      <ol className="relative space-y-0">
        {data.mini_path.map((step, index) => {
          const isLast = index === data.mini_path.length - 1;
          return (
            <li
              key={step.step}
              className="relative flex gap-4 pb-6 animate-[pathReveal_0.45s_ease_both]"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {!isLast && (
                <span
                  className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-px bg-gradient-to-b from-[#1387AE]/50 to-[#7E1487]/20"
                  aria-hidden
                />
              )}
              <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7E1487] to-[#1387AE] text-xs font-bold text-white shadow-md shadow-[#1387AE]/25">
                {step.step}
              </span>
              <div className="min-w-0 flex-1 rounded-2xl border border-gray-100 bg-white/90 p-3.5 shadow-sm transition-shadow hover:shadow-md">
                <p className="text-sm font-semibold leading-snug text-gray-900">{step.topic}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {step.duration && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500">
                      <Clock size={11} />
                      {step.duration}
                    </span>
                  )}
                  {step.resource && (
                    <a
                      href={step.resource}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#1387AE]/10 to-[#7E1487]/10 px-2.5 py-1 text-[11px] font-semibold text-[#1387AE] transition hover:from-[#1387AE]/20 hover:to-[#7E1487]/20"
                    >
                      <ExternalLink size={11} />
                      Open resource
                    </a>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function SkillGapPill({
  label,
  isExpanded,
  isLoading,
  hasPath,
  onGenerate,
  onToggle,
  activeStyle = false,
}) {
  return (
    <div
      className={`flex min-h-[76px] w-full flex-col rounded-xl border p-2 transition-all ${
        activeStyle || isExpanded
          ? "border-[#1387AE]/50 bg-[#1387AE]/10 shadow-sm"
          : "border-gray-200 bg-white hover:border-[#1387AE]/25"
      }`}
    >
      <div className="flex flex-1 items-center justify-center px-1 py-1.5 text-center">
        <span className="text-[11px] font-semibold leading-snug text-gray-800 break-words">
          {label}
        </span>
      </div>

      <div className="mt-auto flex h-7 w-full items-center justify-center">
        {isLoading && <Loader2 size={14} className="animate-spin text-[#1387AE]" />}

        {!hasPath && !isLoading && (
          <button
            type="button"
            onClick={onGenerate}
            className="h-7 w-full rounded-lg bg-gradient-to-r from-[#7E1487] to-[#1387AE] text-[10px] font-bold text-white transition hover:opacity-90"
          >
            Generate
          </button>
        )}

        {hasPath && !isLoading && (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Collapse path" : "Expand path"}
            className="flex h-7 w-full items-center justify-center gap-1 rounded-lg border border-[#1387AE]/25 bg-white/80 text-[10px] font-bold text-[#1387AE] transition hover:bg-[#1387AE]/10"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {isExpanded ? "Hide path" : "View path"}
          </button>
        )}
      </div>
    </div>
  );
}

function GapSkillsGroup({
  memberName,
  skills,
  miniPaths,
  miniPathLoading,
  miniPathErrors,
  onGenerate,
}) {
  const [expandedSkill, setExpandedSkill] = useState(null);

  const handleGenerate = (skill) => {
    setExpandedSkill(skill);
    onGenerate(memberName, skill);
  };

  const toggleSkill = (skill) => {
    const key = miniPathKey(memberName, skill);
    if (!miniPaths[key]?.mini_path?.length) return;
    setExpandedSkill((current) => (current === skill ? null : skill));
  };

  const activeKey = expandedSkill ? miniPathKey(memberName, expandedSkill) : null;
  const activeData = activeKey ? miniPaths[activeKey] : null;
  const activeLoading = activeKey && miniPathLoading === activeKey;
  const activeError = activeKey ? miniPathErrors[activeKey] : null;
  const showPanel = expandedSkill && (activeLoading || activeData || activeError);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {skills.map((skill) => {
          const key = miniPathKey(memberName, skill);
          const hasPath = Boolean(miniPaths[key]?.mini_path?.length);
          const isLoading = miniPathLoading === key;
          const isExpanded = expandedSkill === skill;

          return (
            <SkillGapPill
              key={skill}
              label={skill}
              isExpanded={isExpanded}
              isLoading={isLoading}
              hasPath={hasPath}
              onGenerate={() => handleGenerate(skill)}
              onToggle={() => toggleSkill(skill)}
              activeStyle={isExpanded}
            />
          );
        })}
      </div>

      {showPanel && (
        <div className="overflow-hidden rounded-2xl border border-[#1387AE]/20 bg-gradient-to-br from-white to-[#1387AE]/5 shadow-sm">
          {activeError && (
            <p className="border-b border-red-100 bg-red-50 px-4 py-2.5 text-[11px] text-red-600">
              {activeError}
            </p>
          )}

          {activeLoading && (
            <div className="space-y-3 px-4 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-8 w-8 animate-pulse rounded-xl bg-gray-200" />
                  <div className="h-14 flex-1 animate-pulse rounded-2xl bg-gray-100" />
                </div>
              ))}
            </div>
          )}

          {activeData && !activeLoading && (
            <>
              <MiniPathTimeline data={activeData} />
              <div className="flex justify-end border-t border-[#1387AE]/10 px-4 py-2.5">
                <button
                  type="button"
                  onClick={() => handleGenerate(expandedSkill)}
                  className="text-[11px] font-semibold text-[#1387AE] transition hover:text-[#0b6281]"
                >
                  Regenerate path
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function UnassignedSkillRow({
  skill,
  needers,
  task,
  miniPaths,
  miniPathLoading,
  miniPathErrors,
  onGenerate,
}) {
  const [activeMember, setActiveMember] = useState(null);

  const handleGenerate = (memberName) => {
    setActiveMember(memberName);
    onGenerate(memberName, skill, task);
  };

  const toggleMember = (memberName) => {
    const key = miniPathKey(memberName, skill);
    if (!miniPaths[key]?.mini_path?.length) return;
    setActiveMember((current) => (current === memberName ? null : memberName));
  };

  const activeKey = activeMember ? miniPathKey(activeMember, skill) : null;
  const activeData = activeKey ? miniPaths[activeKey] : null;
  const activeLoading = activeKey && miniPathLoading === activeKey;
  const activeError = activeKey ? miniPathErrors[activeKey] : null;
  const showPanel = activeMember && (activeLoading || activeData || activeError);

  return (
    <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-3">
      <p className="mb-2 text-xs font-bold text-orange-800">{skill}</p>
      {needers.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {needers.map((member) => {
              const memberName = member.name.trim();
              const key = miniPathKey(memberName, skill);
              const hasPath = Boolean(miniPaths[key]?.mini_path?.length);
              const isLoading = miniPathLoading === key;
              const isExpanded = activeMember === memberName;

              return (
                <SkillGapPill
                  key={member.id}
                  label={memberName.split(" ")[0]}
                  isExpanded={isExpanded}
                  isLoading={isLoading}
                  hasPath={hasPath}
                  onGenerate={() => handleGenerate(memberName)}
                  onToggle={() => toggleMember(memberName)}
                  activeStyle={isExpanded}
                />
              );
            })}
          </div>

          {showPanel && (
            <div className="mt-3 overflow-hidden rounded-xl border border-[#1387AE]/20 bg-white">
              {activeError && (
                <p className="px-3 py-2 text-[10px] text-red-600">{activeError}</p>
              )}
              {activeLoading && (
                <div className="space-y-2 px-3 py-3">
                  <div className="h-12 animate-pulse rounded-lg bg-gray-100" />
                  <div className="h-12 animate-pulse rounded-lg bg-gray-100" />
                </div>
              )}
              {activeData && !activeLoading && <MiniPathTimeline data={activeData} />}
            </div>
          )}
        </>
      ) : (
        <p className="text-xs text-gray-500">No members flagged for this skill.</p>
      )}
    </div>
  );
}

// ─── Progress Bar Component ───────────────────────────────────────────────────
function ProgressBar({ step }) {
  const pct = step === 1 ? 33 : step === 2 ? 66 : 100;
  return (
    <div className="flex flex-col gap-1.5 mb-7 w-full max-w-2xl mx-auto">
      <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#7E1487] via-[#1387AE] to-[#1387AE] transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 font-medium px-1">
        <span className={step >= 1 ? "text-[#7E1487]" : ""}>1. Team</span>
        <span className={step >= 2 ? "text-[#1387AE]" : ""}>2. Project</span>
        <span className={step >= 3 ? "text-[#1387AE]" : ""}>3. Tasks</span>
      </div>
    </div>
  );
}

export default function TeamWorkflow() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Persistent State (Survives Vite HMR)
  const [phase, setPhase] = useState(() => sessionStorage.getItem("tw_phase") || "setup_team");
  const [team, setTeam] = useState(() => JSON.parse(sessionStorage.getItem("tw_team")) || [{ id: Date.now(), name: "", skills: [] }]);
  const [projectDescription, setProjectDescription] = useState(() => sessionStorage.getItem("tw_desc") || "");
  const [results, setResults] = useState(() => JSON.parse(sessionStorage.getItem("tw_results")) || null);
  const [currentSkillInput, setCurrentSkillInput] = useState({});
  const [miniPaths, setMiniPaths] = useState({});
  const [miniPathLoading, setMiniPathLoading] = useState(null);
  const [miniPathErrors, setMiniPathErrors] = useState({});

  // Sync state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("tw_phase", phase);
    sessionStorage.setItem("tw_team", JSON.stringify(team));
    sessionStorage.setItem("tw_desc", projectDescription);
    if (results) sessionStorage.setItem("tw_results", JSON.stringify(results));
  }, [phase, team, projectDescription, results]);

  // ─── Phase 1 Handlers ───────────────────────────────────────────────────────
  const addMember = () => {
    setTeam([...team, { id: Date.now(), name: "", skills: [] }]);
  };

  const removeMember = (id) => {
    if (team.length === 1) return;
    setTeam(team.filter((m) => m.id !== id));
  };

  const updateMemberName = (id, name) => {
    setTeam(team.map((m) => (m.id === id ? { ...m, name } : m)));
  };

  const addSkill = (memberId, skill) => {
    if (!skill.trim()) return;
    setTeam(team.map((m) => {
      if (m.id === memberId && !m.skills.includes(skill.trim())) {
        return { ...m, skills: [...m.skills, skill.trim()] };
      }
      return m;
    }));
    setCurrentSkillInput({ ...currentSkillInput, [memberId]: "" });
  };

  const removeSkill = (memberId, skillToRemove) => {
    setTeam(team.map((m) => {
      if (m.id === memberId) {
        return { ...m, skills: m.skills.filter((s) => s !== skillToRemove) };
      }
      return m;
    }));
  };

  const submitTeam = async () => {
    // Validation
    if (team.some(m => !m.name.trim() || m.skills.length === 0)) {
      setError("Please ensure all members have a name and at least one skill.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const payload = team.map((m, index) => ({
        id: index,
        name: m.name.trim(),
        skills: m.skills,
        current_workload: 0
      }));

      await axios.post(`${TEAM_API_URL}/set-team`, payload);
      setPhase("setup_project");
    } catch (err) {
      setError(err.response?.data?.detail?.[0]?.msg || "Failed to set team. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Phase 2 Handlers ───────────────────────────────────────────────────────
  const generateTasks = async () => {
    if (projectDescription.trim().length < 20) {
      setError("Project description must be at least 20 characters long.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${TEAM_API_URL}/generate-and-assign`, {
        params: { project_description: projectDescription.trim() }
      });
      setResults(response.data);
      setPhase("results");
    } catch (err) {
      setError("Failed to generate and assign tasks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateMiniPath = async (memberName, missingSkill, taskOverride = null) => {
    const key = miniPathKey(memberName, missingSkill);
    setMiniPathLoading(key);
    setMiniPathErrors((prev) => ({ ...prev, [key]: null }));

    const member = team.find((m) => m.name.trim() === memberName);
    const payload = taskOverride
      ? {
          task_title: taskOverride.Task_Name,
          task_description: taskOverride.Description,
          member_skills: member?.skills ?? [],
          missing_skill: missingSkill,
        }
      : findTaskContextForGap(
          memberName,
          missingSkill,
          team,
          results,
          projectDescription
        );

    try {
      const response = await axios.post(`${MINI_PATH_API_URL}/api/ai/mini-path`, payload);
      setMiniPaths((prev) => ({ ...prev, [key]: response.data }));
    } catch (err) {
      const message =
        err.response?.data?.detail?.[0]?.msg ||
        err.response?.data?.message ||
        "Failed to generate mini path.";
      setMiniPathErrors((prev) => ({ ...prev, [key]: message }));
    } finally {
      setMiniPathLoading(null);
    }
  };

  // ─── Render Helpers ─────────────────────────────────────────────────────────
  const renderSetupTeam = () => (
    <div className="max-w-2xl mx-auto w-full animate-[slideQ_0.4s_ease_both]">
      <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-[0_4px_32px_rgba(19,135,174,0.1)]">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7E1487]/10 text-[#7E1487]">
            <User size={20} strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Define Your Team</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Add your team members and list their skills or domains of expertise.
        </p>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <div className="space-y-4 mb-6">
          {team.map((member, index) => (
            <div key={member.id} className="p-4 border border-gray-100 bg-gray-50/50 rounded-xl relative group">
              <div className="absolute -left-2 -top-2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-400 shadow-sm">
                {index + 1}
              </div>
              {team.length > 1 && (
                <button
                  onClick={() => removeMember(member.id)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Member Name
                  </label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => updateMemberName(member.id, e.target.value)}
                    placeholder="e.g. Ahmed Ali"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#7E1487] focus:ring-1 focus:ring-[#7E1487]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Specific Skills / Tools
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentSkillInput[member.id] || ""}
                      onChange={(e) => setCurrentSkillInput({ ...currentSkillInput, [member.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill(member.id, currentSkillInput[member.id] || "");
                        }
                      }}
                      placeholder="Type & press Enter"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#1387AE] focus:ring-1 focus:ring-[#1387AE]/20 outline-none transition-all"
                      list={`skills-list-${member.id}`}
                    />
                    <datalist id={`skills-list-${member.id}`}>
                      {PREDEFINED_SKILLS.map(skill => <option key={skill} value={skill} />)}
                    </datalist>
                    <button
                      onClick={() => addSkill(member.id, currentSkillInput[member.id] || "")}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Skills Tags */}
              {member.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {member.skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1387AE]/10 text-[#1387AE] text-xs font-semibold">
                      {skill}
                      <button onClick={() => removeSkill(member.id, skill)} className="hover:text-red-500 focus:outline-none">
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addMember}
          className="flex items-center gap-2 text-sm font-semibold text-[#1387AE] hover:text-[#0b6281] transition-colors mb-8"
        >
          <Plus size={16} /> Add Another Member
        </button>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            onClick={submitTeam}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-sm font-semibold bg-gradient-to-r from-[#7E1487] to-[#1387AE] shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Next Step"}
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSetupProject = () => (
    <div className="max-w-2xl mx-auto w-full animate-[slideQ_0.4s_ease_both]">
      <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-[0_4px_32px_rgba(19,135,174,0.1)]">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1387AE]/10 text-[#1387AE]">
            <Briefcase size={20} strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Describe the Project</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Explain what you want to build. The AI will break this down into tasks and assign them based on your team's skills.
        </p>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Project Description (min 20 chars)
          </label>
          <textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="e.g. We are building a modern e-commerce web application. We need a sleek UI, a robust Node.js backend with user authentication, and a recommendation engine using Python."
            rows={6}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-[#1387AE] focus:ring-2 focus:ring-[#1387AE]/20 outline-none transition-all resize-none"
          />
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <button
            onClick={() => setPhase("setup_team")}
            disabled={isLoading}
            className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
          >
            Back
          </button>
          <button
            onClick={generateTasks}
            disabled={isLoading || projectDescription.trim().length < 20}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-sm font-semibold bg-gradient-to-r from-[#7E1487] to-[#1387AE] shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Generating Tasks...
              </>
            ) : (
              <>
                <Wand2 size={16} />
                Generate & Assign
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!results) return null;

    const learningGaps = computeLearningGaps(team, results);

    // Group tasks by assigned member
    const groupedTasks = {};
    results.assigned_tasks.forEach((item) => {
      if (!groupedTasks[item.assigned_to]) {
        groupedTasks[item.assigned_to] = [];
      }
      groupedTasks[item.assigned_to].push(item);
    });

    const membersWithGaps = team.filter(
      (member) => (learningGaps[member.name.trim()] ?? []).length > 0
    );

    return (
      <div className="max-w-7xl mx-auto w-full animate-[slideQ_0.5s_ease_both]">
        <div className="bg-white border border-[#1387AE]/20 rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_48px_rgba(19,135,174,0.14)] flex flex-col gap-8">
          
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-widest w-fit mx-auto">
              <CheckCircle2 size={14} /> Assignment Complete
            </span>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-[#7E1487] to-[#1387AE] bg-clip-text text-transparent leading-tight mt-2">
              Generated {results.total_tasks} Tasks
            </h2>
            <p className="text-sm text-gray-500 max-w-lg mx-auto">
              Tasks were generated and assigned using your team&apos;s skills profile.
            </p>
          </div>

          {membersWithGaps.length > 0 && (
            <div className="relative overflow-hidden rounded-[2rem] border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-[#1387AE]/5 p-6 md:p-8 shadow-[0_12px_40px_rgba(245,158,11,0.08)]">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#7E1487]/5 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-[#1387AE]/10 blur-3xl" />

              <div className="relative mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-200/50">
                      <BookOpen size={18} />
                    </span>
                    Skill gaps & mini paths
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm text-gray-600">
                    Generate a personalized learning roadmap for each missing skill. Expand or collapse paths with the toggle.
                  </p>
                </div>
                <span className="rounded-full border border-amber-200 bg-white/80 px-4 py-1.5 text-xs font-bold text-amber-800 shadow-sm">
                  {membersWithGaps.length} member{membersWithGaps.length !== 1 ? "s" : ""} need upskilling
                </span>
              </div>

              <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {membersWithGaps.map((member) => {
                  const gaps = learningGaps[member.name.trim()] ?? [];
                  const memberName = member.name.trim();
                  return (
                    <div
                      key={member.id}
                      className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm ring-1 ring-amber-100/60"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{member.name}</p>
                          <p className="text-xs text-amber-700">
                            Needs to learn {gaps.length} skill{gaps.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <GapSkillsGroup
                        memberName={memberName}
                        skills={gaps}
                        miniPaths={miniPaths}
                        miniPathLoading={miniPathLoading}
                        miniPathErrors={miniPathErrors}
                        onGenerate={generateMiniPath}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mt-6">
            {Object.keys(groupedTasks).map((memberName) => {
              const gaps = learningGaps[memberName] ?? [];
              return (
              <div key={memberName} className="col-span-1 border border-gray-100 bg-gray-50/70 rounded-3xl p-6 md:p-7 shadow-sm ">
                <div className="flex items-center gap-4 mb-6 border-b border-gray-200 pb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7E1487] to-[#1387AE] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {memberName.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">{memberName}</h3>
                  <span className="ml-auto text-xs font-bold text-[#1387AE] bg-[#1387AE]/10 px-3 py-1 rounded-full">
                    {groupedTasks[memberName].length} tasks
                  </span>
                </div>

                {gaps.length > 0 && (
                  <div className="mb-5 rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/80 to-white p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-amber-800">
                      Upskill paths
                    </p>
                    <GapSkillsGroup
                      memberName={memberName}
                      skills={gaps}
                      miniPaths={miniPaths}
                      miniPathLoading={miniPathLoading}
                      miniPathErrors={miniPathErrors}
                      onGenerate={generateMiniPath}
                    />
                  </div>
                )}
                
                <div className="space-y-6">
                  {groupedTasks[memberName].map((assigned, idx) => {
                    const member = team.find((m) => m.name.trim() === memberName);
                    const missingForTask = (assigned.task.Required_Skills ?? []).filter(
                      (s) => !memberHasSkill(member?.skills, s)
                    );

                    return (
                    <div key={idx} className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#7E1487]" />
                      <h4 className="font-bold text-[15px] text-gray-800 mb-2.5 leading-snug">{assigned.task.Task_Name}</h4>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">{assigned.task.Description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {assigned.task.Required_Skills.map(s => (
                          <span key={s} className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md border border-gray-200/60">
                            {s}
                          </span>
                        ))}
                      </div>

                      {missingForTask.length > 0 && (
                        <div className="mb-4">
                          <GapSkillsGroup
                            memberName={memberName}
                            skills={missingForTask}
                            miniPaths={miniPaths}
                            miniPathLoading={miniPathLoading}
                            miniPathErrors={miniPathErrors}
                            onGenerate={(name, s) =>
                              generateMiniPath(name, s, assigned.task)
                            }
                          />
                        </div>
                      )}

                      <div className="bg-[#1387AE]/5 rounded-xl p-3.5 border border-[#1387AE]/10">
                        <p className="text-xs text-[#1387AE] font-semibold">
                          <span className="font-bold">Match Score:</span> {Math.round(assigned.match_score * 100)}%
                        </p>
                        <p className="text-[13px] text-gray-500 mt-1.5 italic leading-relaxed">
                          {assigned.reason}
                        </p>
                      </div>
                    </div>
                  );
                  })}
                </div>
              </div>
            );
            })}
          </div>

          {results.unassigned_tasks && results.unassigned_tasks.length > 0 && (
            <div className="mt-8 border border-orange-200 bg-orange-50 rounded-3xl p-6 md:p-8 shadow-sm">
              <h3 className="font-bold text-lg text-orange-800 flex items-center gap-2 mb-3">
                <AlertTriangle size={18} />
                Unassigned Tasks ({results.unassigned_tasks.length})
              </h3>
              <p className="text-sm text-orange-700 mb-6 font-medium">
                No team member had the required skills for these tasks. Consider upskilling in the skills listed below.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.unassigned_tasks.map((task, idx) => (
                  <div key={idx} className="bg-white p-5 md:p-6 rounded-2xl border border-orange-100 shadow-sm transition-all hover:shadow-md">
                    <h4 className="font-bold text-[15px] text-gray-800 mb-2.5 leading-snug">{task.Task_Name}</h4>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{task.Description}</p>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-orange-700 mb-2">
                      Required skills — generate path per member
                    </p>
                    <div className="space-y-3">
                      {(task.Required_Skills ?? []).map((skill) => {
                        const needers = team.filter(
                          (m) => m.name.trim() && !memberHasSkill(m.skills, skill)
                        );
                        return (
                          <UnassignedSkillRow
                            key={skill}
                            skill={skill}
                            needers={needers}
                            task={task}
                            miniPaths={miniPaths}
                            miniPathLoading={miniPathLoading}
                            miniPathErrors={miniPathErrors}
                            onGenerate={generateMiniPath}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center pt-6 mt-2 border-t border-gray-100">
            <button
              onClick={() => {
                setProjectDescription("");
                setPhase("setup_project");
              }}
              className="px-6 py-2.5 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-all font-semibold"
            >
              Start New Project
            </button>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-[calc(100vh-10vh)] py-8 px-4 font-sans">
      <Keyframes />
      {phase !== "results" && <ProgressBar step={phase === "setup_team" ? 1 : 2} />}
      {phase === "results" && <ProgressBar step={3} />}
      
      {phase === "setup_team" && renderSetupTeam()}
      {phase === "setup_project" && renderSetupProject()}
      {phase === "results" && renderResults()}
    </div>
  );
}
