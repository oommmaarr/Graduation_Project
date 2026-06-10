import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import {
  User,
  Mail,
  Shield,
  Github,
  Calendar,
  CheckCircle2,
  XCircle,
  Camera,
  Loader2,
  LogOut,
  GraduationCap,
  Map,
} from "lucide-react";
import { Link } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";
import useInterviewStore, {
  getCompletedSkillNames,
  syncPassedSkillsToProfile,
} from "@/store/useInterviewStore";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="flex gap-3 py-3.5 sm:gap-4 sm:py-4">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#e8f4fc] to-[#f3e8ff] text-[#1387AE]">
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="mt-0.5 break-words text-[15px] font-medium text-gray-900">{value ?? "—"}</p>
      </div>
    </div>
  );
}

function LearnedSkillsSection({ trackName, skills }) {
  return (
    <div className="mt-8 rounded-2xl border border-gray-200 bg-white px-5 py-5 sm:px-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#e8f4fc] to-[#f3e8ff] text-[#1387AE]">
            <GraduationCap size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Skills acquired
            </p>
            {trackName && (
              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                <Map size={14} className="text-[#7E1487]" />
                {trackName}
              </p>
            )}
          </div>
        </div>
        {skills.length > 0 && (
          <span className="rounded-full bg-[#1387AE]/10 px-3 py-1 text-xs font-bold text-[#1387AE]">
            {skills.length} skill{skills.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#1387AE]/20 bg-gradient-to-r from-[#1387AE]/8 to-[#7E1487]/5 px-3.5 py-1.5 text-sm font-medium text-gray-800"
            >
              <CheckCircle2 size={13} className="shrink-0 text-[#0094BD]" />
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-6 text-center">
          <p className="text-sm text-gray-500">
            No skills recorded yet. Complete week quizzes on your roadmap to build your skill profile.
          </p>
          <Link
            to="/tech"
            className="mt-3 inline-flex rounded-full bg-gradient-to-r from-[#1387AE] to-[#7E1487] px-5 py-2 text-xs font-semibold text-white transition hover:opacity-95"
          >
            Go to learning path
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const uploadProfilePhoto = useAuthStore((s) => s.uploadProfilePhoto);
  const logout = useAuthStore((s) => s.logout);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const roadmap = useInterviewStore((s) => s.roadmap);
  const passedWeeks = useInterviewStore((s) => s.passedWeeks);
  const progressTrackName = useInterviewStore((s) => s.progressTrackName);
  const savedRoadmaps = useInterviewStore((s) => s.savedRoadmaps);
  const activeRoadmapKey = useInterviewStore((s) => s.activeRoadmapKey);
  const progressByRoadmapKey = useInterviewStore((s) => s.progressByRoadmapKey);

  const { learnedSkills, trackName, skillsRoadmap, skillsPassedWeeks } = useMemo(() => {
    let rm = roadmap;
    let weeks = passedWeeks;
    let track = roadmap?.track_name || progressTrackName;

    if (!rm && activeRoadmapKey && savedRoadmaps[activeRoadmapKey]) {
      rm = savedRoadmaps[activeRoadmapKey].roadmap;
      track = rm?.track_name || track;
      weeks = progressByRoadmapKey[activeRoadmapKey]?.passedWeeks ?? passedWeeks;
    }

    if (!rm && progressTrackName) {
      const key = Object.keys(savedRoadmaps).find(
        (k) =>
          savedRoadmaps[k].roadmap?.track_name === progressTrackName ||
          savedRoadmaps[k].trackName === progressTrackName
      );
      if (key) {
        rm = savedRoadmaps[key].roadmap;
        track = rm?.track_name || progressTrackName;
        weeks = progressByRoadmapKey[key]?.passedWeeks ?? passedWeeks;
      }
    }

    const skills = rm
      ? [...getCompletedSkillNames(rm, weeks)].sort((a, b) => a.localeCompare(b))
      : [];

    return {
      learnedSkills: skills,
      trackName: track,
      skillsRoadmap: rm,
      skillsPassedWeeks: weeks,
    };
  }, [
    roadmap,
    passedWeeks,
    progressTrackName,
    savedRoadmaps,
    activeRoadmapKey,
    progressByRoadmapKey,
  ]);

  const displaySkills = useMemo(() => {
    const merged = new Set([...(user?.skills ?? []), ...learnedSkills]);
    return [...merged].sort((a, b) => a.localeCompare(b));
  }, [user?.skills, learnedSkills]);

  const isLearner = user?.role === "learner";

  const fileInputRef = useRef(null);
  const headerBlockRef = useRef(null);
  const cardRef = useRef(null);
  const introPlayedRef = useRef(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (token) fetchMe();
  }, [token, fetchMe]);

  useEffect(() => {
    if (!token || user?.role !== "learner" || !skillsRoadmap || skillsPassedWeeks.length === 0) {
      return;
    }
    syncPassedSkillsToProfile(skillsRoadmap, skillsPassedWeeks);
  }, [token, user?.role, skillsRoadmap, skillsPassedWeeks]);

  useEffect(() => {
    if (!token || (isLoading && !user)) return;
    if (introPlayedRef.current) return;
    const headerEl = headerBlockRef.current;
    const cardEl = cardRef.current;
    if (!headerEl || !cardEl) return;
    introPlayedRef.current = true;

    const ctx = gsap.context(() => {
      gsap.from(headerEl.querySelectorAll("[data-profile-reveal]"), {
        opacity: 0,
        y: 28,
        stagger: 0.09,
        duration: 0.75,
        ease: "power3.out",
      });
      gsap.from(cardEl, {
        opacity: 0,
        y: 32,
        duration: 0.85,
        ease: "power3.out",
      });
    });

    return () => ctx.revert();
  }, [token, isLoading, user]);

  const handlePickPhoto = () => {
    setLocalError(null);
    clearError();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLocalError("Please choose an image file (JPEG, PNG, WebP, etc.).");
      return;
    }

    setLocalError(null);
    clearError();
    const result = await uploadProfilePhoto(file);
    if (!result.success) {
      setLocalError(result.error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const displayError = localError || error;
  const avatarSrc = user?.avatar || user?.imageUrl;
  const initials =
    user?.name
      ?.split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  if (!token) {
    return null;
  }

  return (
    <section className="relative isolate min-h-[calc(100dvh-5rem)] w-full overflow-hidden font-sans">
      <div
        className="pointer-events-none absolute inset-0 -z-10 min-h-full"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-20 pt-6 sm:px-8 md:px-10 lg:px-14 lg:pt-10 xl:px-16">
        <div
          ref={headerBlockRef}
          className="mb-10 border-l-4 border-[#7E1487] pl-4 text-center md:mb-12 md:text-left"
        >
          <p data-profile-reveal className="text-xs font-bold uppercase tracking-[0.2em] text-[#7E1487]">
            Account
          </p>
          <h1
            data-profile-reveal
            className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl"
          >
            Your profile
          </h1>
          <p data-profile-reveal className="mt-2 max-w-lg text-sm leading-relaxed text-gray-500 md:text-base">
            Your details from the server. Update your photo anytime.
          </p>
        </div>

        {isLoading && !user ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-3xl border border-gray-200/80 bg-white/90 py-20 shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-[#1387AE]" />
            <p className="text-sm font-medium text-gray-600">Loading profile…</p>
          </div>
        ) : (
          <div
            ref={cardRef}
            className="overflow-hidden rounded-3xl border border-gray-200/90 bg-white shadow-[0_4px_48px_-12px_rgba(15,23,42,0.08)]"
          >
            <div
              className="h-28 bg-gradient-to-br from-sky-300 to-violet-300 md:h-32"
              aria-hidden
            />

            <div className="relative -mt-12 px-5 pb-10 pt-0 sm:px-8 md:px-10 lg:px-12 lg:pb-12">
              <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
                <div className="flex flex-col items-center lg:sticky lg:top-28 lg:w-[260px] lg:shrink-0 lg:items-start">
                  <div className="relative">
                    <div className="flex h-[7.25rem] w-[7.25rem] items-center justify-center overflow-hidden rounded-full border-[5px] border-white bg-gradient-to-br from-[#e8f4fc] to-[#f3e8ff] shadow-[0_12px_40px_-8px_rgba(19,135,174,0.25)] sm:h-32 sm:w-32 md:h-36 md:w-36">
                      {avatarSrc ? (
                        <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-[#7E1487] sm:text-3xl">{initials}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handlePickPhoto}
                      disabled={isLoading}
                      className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#0ea5c8] text-white shadow-lg transition hover:bg-[#0891b2] disabled:opacity-50"
                      aria-label="Upload profile photo"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Camera className="h-5 w-5" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="mt-5 w-full text-center lg:text-left">
                    <h2 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
                      {user?.name ?? "—"}
                    </h2>
                    <p className="mt-1 break-words text-sm text-gray-500">{user?.email ?? ""}</p>
                    {user?.role && (
                      <span className="mt-3 inline-flex rounded-full bg-violet-50 px-3.5 py-1 text-xs font-semibold capitalize text-[#6b21a8] ring-1 ring-violet-200/80">
                        {user.role}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handlePickPhoto}
                    disabled={isLoading}
                    className="mt-6 cursor-pointer hidden w-full rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 lg:inline-flex lg:items-center lg:justify-center lg:gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                    Change photo
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-3 hidden cursor-pointer w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-100 lg:inline-flex lg:items-center lg:justify-center lg:gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  {displayError && (
                    <p className="mb-6 rounded-xl border border-red-100 bg-red-50/90 px-4 py-3 text-center text-sm text-red-700 md:text-left">
                      {displayError}
                    </p>
                  )}

                  <div className="divide-y divide-gray-100 rounded-2xl border border-gray-300 bg-gray-100/50 px-1 py-1 sm:px-4 lg:mt-20">
                    <InfoRow label="Full name" value={user?.name} icon={User} />
                    <InfoRow label="Email" value={user?.email} icon={Mail} />
                    <InfoRow label="Role" value={user?.role} icon={Shield} />
                    <InfoRow
                      label="GitHub"
                      value={user?.githubId ? `Connected (${user.githubId})` : "Not linked"}
                      icon={Github}
                    />
                    <div className="flex gap-3 py-3.5 sm:gap-4 sm:py-4">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#e8f4fc] to-[#f3e8ff] text-[#1387AE]">
                        <CheckCircle2 size={18} strokeWidth={2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                          Email verified
                        </p>
                        <p className="mt-0.5 flex items-center gap-2 text-[15px] font-medium text-gray-900">
                          {user?.emailVerified ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                              Verified
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 shrink-0 text-amber-600" />
                              Not verified
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 py-3.5 sm:gap-4 sm:py-4">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#e8f4fc] to-[#f3e8ff] text-[#1387AE]">
                        <Shield size={18} strokeWidth={2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                          Account status
                        </p>
                        <p className="mt-0.5 text-[15px] font-medium text-gray-900">
                          {user?.isActive === false ? "Inactive" : "Active"}
                        </p>
                      </div>
                    </div>
                    <InfoRow label="Member since" value={formatDate(user?.createdAt)} icon={Calendar} />
                    <InfoRow label="Last updated" value={formatDate(user?.updatedAt)} icon={Calendar} />
                  </div>

                  {isLearner && (
                    <LearnedSkillsSection trackName={trackName} skills={displaySkills} />
                  )}

                  <div className="mt-8 flex justify-center lg:hidden">
                    <button
                      type="button"
                      onClick={handlePickPhoto}
                      disabled={isLoading}
                      className="inline-flex min-h-[44px] w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0ea5c8] to-[#a855f7] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-95 disabled:opacity-60"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                      Change profile photo
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex min-h-[44px] w-full max-w-sm items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-6 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-100"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <p className="mt-10 text-center text-xs text-gray-500 md:mt-12 md:text-left">
          Syntra.AI © {new Date().getFullYear()}.
        </p>
      </div>
    </section>
  );
}
