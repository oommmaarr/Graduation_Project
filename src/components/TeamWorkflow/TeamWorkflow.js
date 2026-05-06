import React, { useState, useEffect } from "react";
import { Plus, Trash2, ArrowRight, CheckCircle2, User, Briefcase, FileText, Loader2, Wand2 } from "lucide-react";
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
  `}</style>
);

// ─── API Setup ────────────────────────────────────────────────────────────────
const TEAM_API_URL = "https://taskdistribution-production.up.railway.app";

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

    // Group tasks by assigned member
    const groupedTasks = {};
    results.assigned_tasks.forEach((item) => {
      if (!groupedTasks[item.assigned_to]) {
        groupedTasks[item.assigned_to] = [];
      }
      groupedTasks[item.assigned_to].push(item);
    });

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
              Here is the AI-generated task distribution based on your team's skill profile.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mt-6">
            {Object.keys(groupedTasks).map((memberName) => (
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
                
                <div className="space-y-6">
                  {groupedTasks[memberName].map((assigned, idx) => (
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

                      <div className="bg-[#1387AE]/5 rounded-xl p-3.5 border border-[#1387AE]/10">
                        <p className="text-xs text-[#1387AE] font-semibold">
                          <span className="font-bold">Match Score:</span> {Math.round(assigned.match_score * 100)}%
                        </p>
                        <p className="text-[13px] text-gray-500 mt-1.5 italic leading-relaxed">
                          {assigned.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {results.unassigned_tasks && results.unassigned_tasks.length > 0 && (
            <div className="mt-8 border border-orange-200 bg-orange-50 rounded-3xl p-6 md:p-8 shadow-sm">
              <h3 className="font-bold text-lg text-orange-800 flex items-center gap-2 mb-3">
                ⚠️ Unassigned Tasks ({results.unassigned_tasks.length})
              </h3>
              <p className="text-sm text-orange-700 mb-6 font-medium">
                These tasks could not be perfectly matched to your team's current skills.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.unassigned_tasks.map((task, idx) => (
                  <div key={idx} className="bg-white p-5 md:p-6 rounded-2xl border border-orange-100 shadow-sm transition-all hover:shadow-md">
                    <h4 className="font-bold text-[15px] text-gray-800 mb-2.5 leading-snug">{task.Task_Name}</h4>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{task.Description}</p>
                    <div className="flex flex-wrap gap-2">
                      {task.Required_Skills?.map(s => (
                        <span key={s} className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md border border-gray-200/60">
                          {s}
                        </span>
                      ))}
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
