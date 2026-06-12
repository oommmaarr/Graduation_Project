import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import Lottie from "lottie-react";
import RobotAnimation from "@/animation/robot (2).json";
import {
  BookOpen,
  Check,
  Clock,
  ExternalLink,
  Flag,
  Lock,
  Map,
  Network,
  Route,
  RotateCcw,
  Trophy,
  Youtube,
  Zap,
} from "lucide-react";
import useInterviewStore, {
  computeTrackProgress,
  extractRoadmapCourses,
  isTrackComplete,
  syncPassedSkillsToProfile,
  syncTrackFinishedIfComplete,
} from "@/store/useInterviewStore";
import WeekQuizPanel from "@/components/Roadmap/WeekQuizPanel";
import ProjectSuggestionsPanel from "@/components/Roadmap/ProjectSuggestionsPanel";
import InterviewInviteBanner from "@/components/MockInterview/InterviewInviteBanner";

const SKILL_COLORS = [
  "#1387AE",
  "#7E1487",
  "#0094BD",
  "#9D3FB0",
  "#2BA6C9",
  "#A8329E",
  "#3D7FC0",
  "#6A35A0",
];

function polarPoint(cx, cy, radius, angleRad) {
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function radialPositions(count, cx, cy, radius, startAngle, endAngle) {
  if (count === 0) return [];
  if (count === 1) {
    const mid = (startAngle + endAngle) / 2;
    return [polarPoint(cx, cy, radius, mid)];
  }
  const step = (endAngle - startAngle) / (count - 1);
  return Array.from({ length: count }, (_, i) =>
    polarPoint(cx, cy, radius, startAngle + step * i)
  );
}

function curvedPath(x1, y1, x2, y2, bend = 0.35) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx = mx - dy * bend;
  const cy = my + dx * bend;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

function truncate(text, max = 28) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

// Smooth flowing path through ordered points (Catmull-Rom → Bézier)
function smoothPath(points, tension = 0.8) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

const fmtHours = (h) => (Number.isInteger(h) ? h : Math.round(h * 10) / 10);

// ─── Animated counter ──────────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = "" }) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 90, damping: 18 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    mv.set(value);
  }, [value, mv]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [spring]);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}

// ─── Animated background ─────────────────────────────────────────────────────────
function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(19,135,174,0.16), transparent 70%)",
        }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[-120px] top-1/3 h-[460px] w-[460px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(126,20,135,0.13), transparent 70%)",
        }}
        animate={{ x: [0, -50, 0], y: [0, 60, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-140px] left-1/3 h-[380px] w-[380px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0,148,189,0.12), transparent 70%)",
        }}
        animate={{ x: [0, 40, 0], y: [0, -40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute inset-0 opacity-[0.6]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(19,135,174,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(19,135,174,0.06) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />
    </div>
  );
}

function ResourceLink({ href, icon: Icon, label, accent, delay }) {
  const disabled = !href;
  return (
    <motion.a
      href={disabled ? undefined : href}
      target={disabled ? undefined : "_blank"}
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3 transition-all
        ${disabled
          ? "cursor-default border-gray-100 bg-gray-50"
          : "border-gray-200 bg-white hover:-translate-y-0.5 hover:border-[#1387AE]/40 hover:shadow-[0_8px_24px_rgba(19,135,174,0.12)]"
        }`}
    >
      {!disabled && (
        <span
          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(120px 80px at 0% 50%, ${accent}14, transparent 70%)`,
          }}
        />
      )}
      <span
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: `linear-gradient(135deg, ${accent}22, ${accent}0d)`,
          color: accent,
        }}
      >
        <Icon size={18} />
      </span>
      <div className="relative min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <p className="truncate text-sm text-gray-700 group-hover:text-gray-900">
          {disabled
            ? "Not available"
            : href.replace(/^https?:\/\/(www\.)?/, "")}
        </p>
      </div>
      {!disabled && (
        <ExternalLink
          size={15}
          className="relative shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#1387AE]"
        />
      )}
    </motion.a>
  );
}

function NetworkGraph({ week, weekIndex, selectedSkill, onSelectSkill, trackName }) {
  const cx = 420;
  const cy = 280;
  const skills = week?.skills ?? [];

  const leftSkills = skills.filter((_, i) => i % 2 === 0);
  const rightSkills = skills.filter((_, i) => i % 2 === 1);

  const leftPos = radialPositions(leftSkills.length, cx, cy, 205, Math.PI * 0.58, Math.PI * 0.92);
  const rightPos = radialPositions(
    rightSkills.length,
    cx,
    cy,
    205,
    -Math.PI * 0.08,
    Math.PI * 0.36
  );

  const nodes = useMemo(() => {
    const list = [];
    leftSkills.forEach((skill, i) => {
      list.push({
        skill,
        x: leftPos[i]?.x ?? cx,
        y: leftPos[i]?.y ?? cy,
        color: SKILL_COLORS[i % SKILL_COLORS.length],
        side: "left",
      });
    });
    rightSkills.forEach((skill, i) => {
      list.push({
        skill,
        x: rightPos[i]?.x ?? cx,
        y: rightPos[i]?.y ?? cy,
        color: SKILL_COLORS[(i + leftSkills.length) % SKILL_COLORS.length],
        side: "right",
      });
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week, leftSkills.length, rightSkills.length]);

  return (
    <svg
      viewBox="0 0 840 560"
      className="h-full w-full"
      role="img"
      aria-label={`Week ${week?.week_number} skill network`}
    >
      <defs>
        <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1387AE" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#1387AE" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1387AE" />
          <stop offset="50%" stopColor="#7E1487" />
          <stop offset="100%" stopColor="#0094BD" />
        </linearGradient>
        <linearGradient id="hubFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1387AE" />
          <stop offset="100%" stopColor="#7E1487" />
        </linearGradient>
        <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {nodes.map(({ color }, i) => (
          <radialGradient key={`ng-${i}`} id={`nodeGrad-${i}`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.65" />
          </radialGradient>
        ))}
      </defs>

      {/* hub glow */}
      <circle cx={cx} cy={cy} r={110} fill="url(#hubGlow)" />

      {/* connection lines */}
      {nodes.map(({ skill, x, y, color, side }, i) => {
        const active = selectedSkill?.skill_name === skill.skill_name;
        const d = curvedPath(cx, cy, x, y, side === "left" ? 0.26 : -0.26);
        return (
          <g key={`line-${skill.skill_name}-${i}`}>
            <motion.path
              d={d}
              fill="none"
              stroke={active ? color : "rgba(19,135,174,0.18)"}
              strokeWidth={active ? 2.4 : 1.2}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: active ? 1 : 0.7 }}
              transition={{ duration: 0.7, delay: i * 0.06 }}
            />
            {active && (
              <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={2.4}
                strokeLinecap="round"
                className="rm-flow"
                style={{ filter: `drop-shadow(0 0 4px ${color}66)` }}
              />
            )}
          </g>
        );
      })}

      {/* rotating gradient ring around hub */}
      <g style={{ transformBox: "fill-box", transformOrigin: "center" }} className="rm-spin">
        <circle
          cx={cx}
          cy={cy}
          r={66}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={2}
          strokeDasharray="6 12"
          strokeLinecap="round"
          opacity={0.7}
        />
      </g>
      <g style={{ transformBox: "fill-box", transformOrigin: "center" }} className="rm-spin-rev">
        <circle
          cx={cx}
          cy={cy}
          r={78}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={1}
          strokeDasharray="2 18"
          opacity={0.4}
        />
      </g>

      {/* center hub */}
      <motion.g
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
      >
        <circle cx={cx} cy={cy} r={54} fill="url(#hubFill)" filter="url(#softGlow)" />
        <text x={cx} y={cy - 12} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize={10} fontWeight={700} letterSpacing="0.18em">
          WEEK
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" fill="white" fontSize={32} fontWeight={800}>
          {week?.week_number ?? weekIndex + 1}
        </text>
      </motion.g>

      <text x={cx} y={cy + 96} textAnchor="middle" fill="#94a3b8" fontSize={12} letterSpacing="0.04em">
        {truncate(trackName, 38)}
      </text>

      {/* skill nodes */}
      {nodes.map(({ skill, x, y, color }, i) => {
        const active = selectedSkill?.skill_name === skill.skill_name;
        const r = active ? 24 : 18;
        return (
          <motion.g
            key={`${skill.skill_name}-${i}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.07, type: "spring", stiffness: 240 }}
            style={{ cursor: "pointer" }}
            onClick={() => onSelectSkill(skill)}
            whileHover={{ scale: 1.08 }}
          >
            {active && (
              <motion.circle
                cx={x}
                cy={y}
                r={r + 8}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                initial={{ opacity: 0.6, scale: 0.8 }}
                animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.5, 1] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
            )}
            <circle
              cx={x}
              cy={y}
              r={r}
              fill={`url(#nodeGrad-${i})`}
              stroke="white"
              strokeWidth={active ? 3 : 2}
              filter={active ? "url(#softGlow)" : undefined}
            />
            <circle cx={x - r * 0.32} cy={y - r * 0.34} r={r * 0.26} fill="white" fillOpacity={0.5} />
            <text
              x={x}
              y={y + (y < cy ? -30 : 36)}
              textAnchor="middle"
              fill={active ? "#111827" : "#475569"}
              fontSize={11}
              fontWeight={active ? 700 : 500}
            >
              {truncate(skill.skill_name, 22)}
            </text>
            <text x={x} y={y + 4} textAnchor="middle" fill="white" fontSize={10} fontWeight={800}>
              {fmtHours(skill.estimated_hours)}h
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}

function SkillPanel({ skill, weekNumber, totalWeeks, weekHours }) {
  const isMdUp = useMediaQuery({ minWidth: 768 });

  if (!skill) {
    return (
      <motion.div
        key="empty"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-full flex-col items-center justify-center gap-5 px-8 text-center"
      >
        <motion.div
          animate={isMdUp ? { y: [0, -8, 0] } : { y: 0 }}
          transition={
            isMdUp
              ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0 }
          }
          className="flex h-28 w-28 items-center justify-center rounded-3xl border border-[#1387AE]/15 bg-gradient-to-br from-[#1387AE]/10 to-[#7E1487]/5 overflow-hidden mt-3"
          style={{ boxShadow: "0 12px 36px rgba(19,135,174,0.14)" }}
        >
          <Lottie
            animationData={RobotAnimation}
            loop
            autoplay
            className="h-full w-full"
          />
        </motion.div>
        <div>
          <p className="text-lg font-bold text-gray-900">Explore your week</p>
          <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-gray-500">
            Tap any glowing node to reveal verified resources, time estimates and your effort breakdown.
          </p>
        </div>
        <div className="mt-2 grid w-full max-w-[240px] grid-cols-3 gap-2">
          {[
            { v: totalWeeks, l: "Weeks", c: "#1387AE" },
            { v: weekNumber, l: "Current", c: "#7E1487" },
            { v: fmtHours(weekHours), l: "This wk", c: "#0094BD", suffix: "h" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-gray-100 bg-gray-50 py-3">
              <p className="text-xl font-bold" style={{ color: s.c }}>
                {s.v}
                {s.suffix || ""}
              </p>
              <p className="text-[9px] uppercase tracking-widest text-gray-400">{s.l}</p>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  const { resources } = skill;
  const effortPct = Math.min(100, Math.round((skill.estimated_hours / 20) * 100));

  return (
    <motion.div
      key={skill.skill_name}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="flex h-full flex-col gap-5 overflow-y-auto px-6 py-6"
    >
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1387AE]/25 bg-[#1387AE]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#1387AE]">
          <Map size={11} />
          Week {weekNumber}
        </span>
        <h3 className="mt-3 text-xl font-bold leading-snug text-gray-900">
          {skill.skill_name}
        </h3>
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
          <Clock size={14} />
          <span>{fmtHours(skill.estimated_hours)} hours to master</span>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
        <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-wider text-gray-400">
          <span className="flex items-center gap-1.5">
            <Zap size={12} className="text-[#F59E0B]" />
            Effort intensity
          </span>
          <span className="font-bold text-gray-600">{fmtHours(skill.estimated_hours)}h</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg,#1387AE,#7E1487,#0094BD)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${effortPct}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="space-y-2.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Curated Resources
        </p>
        <ResourceLink href={resources?.youtube_link} icon={Youtube} label="Video Tutorial" accent="#FF4D4D" delay={0.05} />
        <ResourceLink href={resources?.book_reference} icon={BookOpen} label="Book Reference" accent="#F59E0B" delay={0.12} />
        <ResourceLink href={resources?.article_link} icon={ExternalLink} label="Deep-dive Article" accent="#1387AE" delay={0.19} />
      </div>
    </motion.div>
  );
}

function WeekTimeline({ weeks, activeWeek, unlockedWeekIndex, passedWeeks, onSelectWeek }) {
  return (
    <div className="relative border-t border-gray-100 bg-gray-50/70 px-4 py-4">
      <div className="mb-3 flex items-center justify-between px-2">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
          <Trophy size={12} className="text-[#F59E0B]" />
          Learning Timeline
        </p>
        <p className="text-xs text-gray-400">
          Week {activeWeek + 1} of {weeks.length}
        </p>
      </div>

      <div className="rm-scroll overflow-x-auto pb-1 pt-1">
        <div className="flex min-w-max gap-2 px-2">
          {weeks.map((week, i) => {
            const active = i === activeWeek;
            const done = passedWeeks.includes(i);
            const locked = i > unlockedWeekIndex;
            const hours = week.skills.reduce((s, sk) => s + sk.estimated_hours, 0);

            return (
              <div
                key={week.week_number}
                className="relative flex min-w-[84px] shrink-0 flex-col items-center gap-1.5"
              >
                {i < weeks.length - 1 && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute z-0 h-[2px]"
                    style={{
                      top: 24,
                      left: "50%",
                      width: "calc(100% + 8px)",
                      transform: "translateY(-50%)",
                      background:
                        done
                          ? "linear-gradient(90deg, #1387AE, #7E1487)"
                          : "rgba(19,135,174,0.18)",
                    }}
                  />
                )}

                <button
                  type="button"
                  onClick={() => !locked && onSelectWeek(i)}
                  disabled={locked}
                  title={locked ? "Complete the previous week quiz to unlock" : undefined}
                  className={`group relative z-10 flex w-full flex-col items-center gap-1.5 rounded-2xl px-3 py-2.5 transition-all
                    ${locked ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                    ${active
                      ? "border border-[#1387AE]/30 bg-gradient-to-b from-[#1387AE]/10 to-[#7E1487]/5 shadow-[0_6px_20px_rgba(19,135,174,0.15)]"
                      : "border border-transparent hover:border-gray-200 hover:bg-white"
                    }`}
                >
                  <span
                    className={`relative flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all
                      ${active
                        ? "bg-gradient-to-br from-[#1387AE] to-[#7E1487] text-white shadow-[0_4px_12px_rgba(19,135,174,0.4)]"
                        : done
                          ? "bg-[#0094BD]/12 text-[#0094BD] ring-2 ring-[#0094BD]/30"
                          : locked
                            ? "bg-gray-100 text-gray-400 ring-1 ring-gray-200"
                            : "bg-white text-gray-500 ring-1 ring-gray-200 group-hover:ring-[#1387AE]/30"
                      }`}
                  >
                    {done ? <Check size={14} /> : locked ? <Lock size={12} /> : week.week_number}
                  </span>
                  <span className={`text-[10px] font-medium ${active ? "text-[#1387AE]" : "text-gray-400"}`}>
                    {fmtHours(hours)}h
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Journey Map (sequential connected weeks) ───────────────────────────────────
function GoalBadge({ className = "" }) {
  return (
    <div className={`flex shrink-0 flex-col items-center gap-0.5 ${className}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F59E0B]/50 bg-[#F59E0B]/10">
        <Trophy size={15} className="text-[#F59E0B]" strokeWidth={2} />
      </div>
      <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#F59E0B]">
        GOAL
      </span>
    </div>
  );
}

function JourneyMap({ weeks, activeWeek, unlockedWeekIndex, passedWeeks, onPickWeek }) {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const width = isMobile ? 400 : 820;
  const cols = isMobile
    ? Math.min(2, Math.max(1, weeks.length))
    : weeks.length <= 3
      ? Math.max(2, weeks.length)
      : 4;
  const margin = isMobile ? 76 : 110;
  const colGap = cols > 1 ? (width - 2 * margin) / (cols - 1) : 0;
  const topMargin = isMobile ? 100 : 110;
  const rowGap = isMobile ? 158 : 152;
  const rows = Math.ceil(weeks.length / cols);
  const contentHeight = topMargin + (rows - 1) * rowGap + 100;

  const nodeR = { active: isMobile ? 38 : 30, normal: isMobile ? 34 : 26 };
  const fonts = {
    weekActive: isMobile ? 24 : 20,
    weekFuture: isMobile ? 21 : 17,
    label: isMobile ? 13 : 11,
    sub: isMobile ? 11 : 10,
  };

  const points = weeks.map((w, i) => {
    const row = Math.floor(i / cols);
    const colInRow = i % cols;
    const actualCol = row % 2 === 0 ? colInRow : cols - 1 - colInRow;
    return {
      x: margin + actualCol * colGap,
      y: topMargin + row * rowGap,
      week: w,
      index: i,
    };
  });

  const pathD = smoothPath(points);
  const last = points[points.length - 1];
  const first = points[0];

  const goalX = last.x;
  const goalY = last.y + 72;
  const startX = first.x;
  const startY = first.y - 55;

  const pad = isMobile ? 36 : 48;
  const viewBox = `${-pad} ${-pad} ${width + pad * 2} ${contentHeight + 120 + pad * 2}`;

  return (
    <svg
      viewBox={viewBox}
      style={{ width: "100%", height: "auto", overflow: "visible" }}
      role="img"
      aria-label="Roadmap journey map"
    >
      <defs>
        <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1387AE" />
          <stop offset="50%" stopColor="#7E1487" />
          <stop offset="100%" stopColor="#0094BD" />
        </linearGradient>
        <linearGradient id="nodeActive" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1387AE" />
          <stop offset="100%" stopColor="#7E1487" />
        </linearGradient>
        <filter id="jGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* base road */}
      <path
        d={pathD}
        fill="none"
        stroke="rgba(19,135,174,0.12)"
        strokeWidth={14}
        strokeLinecap="round"
      />
      {/* animated drawing of road */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="url(#roadGrad)"
        strokeWidth={4}
        strokeLinecap="round"
        strokeOpacity={0.7}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.6, ease: "easeInOut" }}
      />
      {/* flowing energy dashes */}
      <path
        d={pathD}
        fill="none"
        stroke="url(#roadGrad)"
        strokeWidth={3}
        strokeLinecap="round"
        className="rm-flow"
      />

      {/* START flag */}
      <g transform={`translate(${startX}, ${startY})`}>
        <rect
          x={isMobile ? -34 : -28}
          y={isMobile ? -14 : -12}
          width={isMobile ? 68 : 56}
          height={isMobile ? 28 : 24}
          rx={12}
          fill="#0094BD"
          fillOpacity={0.12}
          stroke="#0094BD"
          strokeWidth={1.2}
        />
        <text y={4} textAnchor="middle" fill="#0094BD" fontSize={isMobile ? 11 : 10} fontWeight={800} letterSpacing="0.08em">
          START
        </text>
      </g>

      {/* milestone nodes */}
      {points.map(({ x, y, week, index }) => {
        const active = index === activeWeek;
        const done = passedWeeks.includes(index);
        const locked = index > unlockedWeekIndex;
        const skillCount = week.skills.length;
        const hours = week.skills.reduce((s, sk) => s + sk.estimated_hours, 0);
        const r = active ? nodeR.active : nodeR.normal;

        const fill = active
          ? "url(#nodeActive)"
          : done
            ? "#E6F6FA"
            : locked
              ? "#F8FAFC"
              : "#FFFFFF";
        const stroke = active ? "#1387AE" : done ? "#0094BD" : locked ? "rgba(148,163,184,0.4)" : "rgba(19,135,174,0.25)";

        return (
          <motion.g
            key={week.week_number}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.05, type: "spring", stiffness: 220 }}
            style={{ cursor: locked ? "not-allowed" : "pointer", opacity: locked ? 0.65 : 1 }}
            onClick={() => !locked && onPickWeek(index)}
            whileHover={locked ? undefined : { scale: 1.08 }}
          >
            {active && (
              <motion.circle
                cx={x}
                cy={y}
                r={r + 8}
                fill="none"
                stroke="#1387AE"
                strokeWidth={1.5}
                animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.45, 1] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
            )}
            <circle
              cx={x}
              cy={y}
              r={r}
              fill={fill}
              stroke={stroke}
              strokeWidth={active ? 3 : 1.8}
              filter={active ? "url(#jGlow)" : undefined}
              style={!active ? { filter: "drop-shadow(0 4px 10px rgba(19,135,174,0.12))" } : undefined}
            />

            {/* week number / icon */}
            {done ? (
              <g transform={`translate(${x}, ${y})`}>
                <polyline
                  points={isMobile ? "-6,0 -1,6 9,-6" : "-5,0 -1,5 7,-5"}
                  fill="none"
                  stroke="#0094BD"
                  strokeWidth={isMobile ? 3 : 2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            ) : locked ? (
              <g transform={`translate(${x}, ${y})`}>
                <rect x={-5} y={-6} width={10} height={8} rx={2} fill="none" stroke="#94a3b8" strokeWidth={1.3} />
                <path d="M -3 -1 Q 0 -5 3 -1" fill="none" stroke="#94a3b8" strokeWidth={1.3} />
                <line x1={0} y1={-1} x2={0} y2={2} stroke="#94a3b8" strokeWidth={1.3} />
              </g>
            ) : active ? (
              <text x={x} y={y + 6} textAnchor="middle" fill="white" fontSize={fonts.weekActive} fontWeight={800}>
                {week.week_number}
              </text>
            ) : (
              <>
                <text x={x} y={y - 4} textAnchor="middle" fill="#475569" fontSize={fonts.weekFuture} fontWeight={800}>
                  {week.week_number}
                </text>
                <g transform={`translate(${x}, ${y + (isMobile ? 12 : 10)})`}>
                  <rect x={isMobile ? -6 : -5} y={-2} width={isMobile ? 12 : 10} height={isMobile ? 8 : 7} rx={1.5} fill="none" stroke="#94a3b8" strokeWidth={1.2} />
                  <path d={`M ${isMobile ? -3.5 : -3} -2 Q 0 ${isMobile ? -7 : -6} ${isMobile ? 3.5 : 3} -2`} fill="none" stroke="#94a3b8" strokeWidth={1.2} />
                </g>
              </>
            )}

            {/* label card */}
            <g transform={`translate(${x}, ${y + r + (isMobile ? 24 : 20)})`}>
              <text textAnchor="middle" fill={active ? "#1387AE" : "#334155"} fontSize={fonts.label} fontWeight={700}>
                Week {week.week_number}
              </text>
              <text y={isMobile ? 17 : 15} textAnchor="middle" fill="#94a3b8" fontSize={fonts.sub}>
                {skillCount} skill{skillCount !== 1 ? "s" : ""} · {fmtHours(hours)}h
              </text>
            </g>
          </motion.g>
        );
      })}

      {/* FINISH trophy — desktop/tablet only; mobile shows in header bar */}
      {!isMobile && (
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 + points.length * 0.05, type: "spring", stiffness: 200 }}
        transform={`translate(${goalX}, ${goalY})`}
      >
        <circle r={24} fill="#F59E0B" fillOpacity={0.12} stroke="#F59E0B" strokeWidth={1.5} />
        {/* trophy icon (native SVG) */}
        <g transform="translate(0, -2)">
          <path
            d="M -8 -6 L 8 -6 L 6 2 Q 0 8 -6 2 Z"
            fill="none"
            stroke="#F59E0B"
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
          <line x1={0} y1={2} x2={0} y2={8} stroke="#F59E0B" strokeWidth={1.8} strokeLinecap="round" />
          <line x1={-5} y1={8} x2={5} y2={8} stroke="#F59E0B" strokeWidth={1.8} strokeLinecap="round" />
          <line x1={-8} y1={-6} x2={-10} y2={-10} stroke="#F59E0B" strokeWidth={1.5} strokeLinecap="round" />
          <line x1={8} y1={-6} x2={10} y2={-10} stroke="#F59E0B" strokeWidth={1.5} strokeLinecap="round" />
        </g>
        <text y={42} textAnchor="middle" fill="#F59E0B" fontSize={11} fontWeight={800} letterSpacing="0.1em">
          GOAL
        </text>
      </motion.g>
      )}
    </svg>
  );
}

// ─── Track progress ─────────────────────────────────────────────────────────────
function TrackProgressSection({ progressPercent, loading }) {
  return (
    <div className="border-t border-gray-100 bg-white px-6 py-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-[200px] flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-700">
            Track Progress
          </p>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#1387AE] via-[#7E1487] to-[#0094BD]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            </div>
            <span className="text-lg font-extrabold tabular-nums text-[#7E1487]">
              {progressPercent}%
            </span>
          </div>
          {loading && (
            <p className="mt-1.5 text-[11px] text-gray-400">Updating progress…</p>
          )}
        </div>
        <p className="max-w-sm text-xs text-gray-700">
          Complete each week&apos;s quiz to move toward your track goal.
        </p>
      </div>
    </div>
  );
}

export default function RoadmapView() {
  const roadmap = useInterviewStore((s) => s.roadmap);
  const hoursPerWeek = useInterviewStore((s) => s.hoursPerWeek);
  const clearRoadmap = useInterviewStore((s) => s.clearRoadmap);
  const reset = useInterviewStore((s) => s.reset);
  const unlockedWeekIndex = useInterviewStore((s) => s.unlockedWeekIndex);
  const passedWeeks = useInterviewStore((s) => s.passedWeeks);
  const progressTrackName = useInterviewStore((s) => s.progressTrackName);
  const activeRoadmapKey = useInterviewStore((s) => s.activeRoadmapKey);
  const progressByRoadmapKey = useInterviewStore((s) => s.progressByRoadmapKey);
  const courseWeights = useInterviewStore((s) => s.courseWeights);
  const courseWeightsLoading = useInterviewStore((s) => s.courseWeightsLoading);
  const fetchCourseWeights = useInterviewStore((s) => s.fetchCourseWeights);
  const openWeekQuiz = useInterviewStore((s) => s.openWeekQuiz);
  const generateProjectSuggestions = useInterviewStore((s) => s.generateProjectSuggestions);

  const weeks = roadmap?.roadmap ?? [];
  const [activeWeek, setActiveWeek] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [viewMode, setViewMode] = useState("journey");

  const currentWeek = weeks[activeWeek];
  const weekHours = useMemo(
    () => (currentWeek?.skills ?? []).reduce((s, sk) => s + sk.estimated_hours, 0),
    [currentWeek]
  );
  const totalHours = useMemo(
    () =>
      weeks.reduce(
        (sum, w) => sum + w.skills.reduce((s, sk) => s + sk.estimated_hours, 0),
        0
      ),
    [weeks]
  );

  const isCurrentWeekPassed = passedWeeks.includes(activeWeek);
  const canTakeQuiz = !isCurrentWeekPassed && activeWeek <= unlockedWeekIndex;

  const trackProgress = useMemo(
    () => computeTrackProgress(roadmap, passedWeeks, courseWeights),
    [roadmap, passedWeeks, courseWeights]
  );

  const trackComplete = useMemo(
    () => isTrackComplete(roadmap, passedWeeks),
    [roadmap, passedWeeks]
  );

  const acquiredSkills = useMemo(() => extractRoadmapCourses(roadmap), [roadmap]);

  useEffect(() => {
    if (trackComplete) {
      syncPassedSkillsToProfile(roadmap, passedWeeks);
      syncTrackFinishedIfComplete(roadmap, passedWeeks);
      generateProjectSuggestions();
    }
  }, [trackComplete, roadmap, passedWeeks, generateProjectSuggestions]);

  useEffect(() => {
    const track = roadmap?.track_name;
    if (!track) return;
    if (progressTrackName !== track) {
      const saved = activeRoadmapKey ? progressByRoadmapKey[activeRoadmapKey] : null;
      useInterviewStore.setState({
        progressTrackName: track,
        unlockedWeekIndex: saved?.unlockedWeekIndex ?? 0,
        passedWeeks: saved?.passedWeeks ?? [],
        courseWeights: saved?.courseWeights ?? null,
      });
      if (!saved?.courseWeights) fetchCourseWeights();
    } else if (!courseWeights && !courseWeightsLoading) {
      fetchCourseWeights();
    }
  }, [
    roadmap?.track_name,
    progressTrackName,
    activeRoadmapKey,
    progressByRoadmapKey,
    courseWeights,
    courseWeightsLoading,
    fetchCourseWeights,
  ]);

  useEffect(() => {
    if (activeWeek > unlockedWeekIndex) {
      setActiveWeek(unlockedWeekIndex);
      setSelectedSkill(null);
    }
  }, [activeWeek, unlockedWeekIndex]);

  const handleWeekChange = (index) => {
    if (index > unlockedWeekIndex) return;
    setActiveWeek(index);
    setSelectedSkill(null);
  };

  const handlePickWeek = (index) => {
    if (index > unlockedWeekIndex) return;
    setActiveWeek(index);
    setSelectedSkill(null);
    setViewMode("network");
  };

  if (!roadmap) return null;

  return (
    <div className="roadmap-view min-h-[calc(100vh-10vh)] w-full py-6">
      <InterviewInviteBanner className="mb-4" />
      <WeekQuizPanel />
      <style>{`
        @keyframes rmSpin { to { transform: rotate(360deg); } }
        @keyframes rmSpinRev { to { transform: rotate(-360deg); } }
        @keyframes rmFlow { to { stroke-dashoffset: -120; } }
        .rm-spin { animation: rmSpin 22s linear infinite; }
        .rm-spin-rev { animation: rmSpinRev 30s linear infinite; }
        .rm-flow { stroke-dasharray: 8 14; animation: rmFlow 1.1s linear infinite; }
        .rm-scroll::-webkit-scrollbar { height: 5px; }
        .rm-scroll::-webkit-scrollbar-thumb { background: rgba(19,135,174,0.35); border-radius: 99px; }
        .rm-scroll-v::-webkit-scrollbar { width: 6px; }
        .rm-scroll-v::-webkit-scrollbar-thumb { background: rgba(126,20,135,0.3); border-radius: 99px; }
        .roadmap-view ::-webkit-scrollbar { width: 5px; }
        .roadmap-view ::-webkit-scrollbar-thumb { background: rgba(19,135,174,0.3); border-radius: 99px; }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto flex w-[85%] flex-col overflow-hidden rounded-[32px] border border-[#1387AE]/15 bg-white shadow-[0_24px_80px_rgba(19,135,174,0.16)]"
      >
        {/* gradient top edge */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#1387AE] via-[#7E1487] to-[#0094BD]" />

        {/* Header */}
        <div className="relative flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ rotate: -12, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7E1487] to-[#1387AE] shadow-[0_8px_28px_rgba(19,135,174,0.35)]"
            >
              <Map size={22} className="text-white" />
            </motion.div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#1387AE]">
                Your Learning Roadmap
              </p>
              <h1 className="bg-gradient-to-r from-[#7E1487] to-[#1387AE] bg-clip-text text-xl font-extrabold text-transparent md:text-2xl">
                {roadmap.track_name}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-5 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-2.5">
              <div className="text-center">
                <p className="text-lg font-extrabold text-gray-900">
                  <AnimatedNumber value={roadmap.total_weeks_calculated} />
                </p>
                <p className="text-[9px] uppercase tracking-wider text-gray-400">Weeks</p>
              </div>
              <div className="w-px bg-gray-200" />
              <div className="text-center">
                <p className="text-lg font-extrabold text-[#0094BD]">
                  <AnimatedNumber value={hoursPerWeek} suffix="h" />
                </p>
                <p className="text-[9px] uppercase tracking-wider text-gray-400">Per week</p>
              </div>
              <div className="w-px bg-gray-200" />
              <div className="text-center">
                <p className="text-lg font-extrabold text-[#7E1487]">
                  <AnimatedNumber value={trackProgress} suffix="%" />
                </p>
                <p className="text-[9px] uppercase tracking-wider text-gray-400">Progress</p>
              </div>
              <div className="w-px bg-gray-200" />
              <div className="text-center">
                <p className="text-lg font-extrabold text-[#7E1487]">
                  <AnimatedNumber value={Math.round(totalHours)} suffix="h" />
                </p>
                <p className="text-[9px] uppercase tracking-wider text-gray-400">Total</p>
              </div>
            </div>

            <button
              type="button"
              onClick={clearRoadmap}
              className="rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-500 transition hover:border-[#1387AE]/40 hover:text-gray-800 cursor-pointer"
            >
              Back to result
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-500 transition hover:border-[#1387AE]/40 hover:text-gray-800 cursor-pointer"
            >
              <RotateCcw size={13} />
              Restart
            </button>
          </div>
        </div>

        <TrackProgressSection
          progressPercent={trackProgress}
          loading={courseWeightsLoading}
        />

        {/* Main split layout */}
        <div className="grid min-h-[500px] grid-cols-1 lg:grid-cols-[1fr_360px]">
          {/* Canvas */}
          <div className="relative min-h-[380px] border-b border-gray-100 bg-gradient-to-br from-[#F8FCFF] to-[#EEF6FF] lg:border-b-0 lg:border-r">
            <AuroraBackground />

            {/* View toggle + mobile GOAL badge on same row */}
            <div className="absolute inset-x-4 top-5 z-10 flex items-center justify-between gap-2 sm:inset-x-auto sm:left-5 sm:right-5">
              <div className="flex gap-1 rounded-full border border-gray-200 bg-white/90 p-1 shadow-sm backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setViewMode("journey")}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold transition-all cursor-pointer
                    ${viewMode === "journey"
                      ? "bg-gradient-to-r from-[#1387AE] to-[#7E1487] text-white"
                      : "text-gray-400 hover:text-gray-700"
                    }`}
                >
                  <Route size={12} />
                  Journey
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("network")}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold transition-all cursor-pointer
                    ${viewMode === "network"
                      ? "bg-gradient-to-r from-[#1387AE] to-[#7E1487] text-white"
                      : "text-gray-400 hover:text-gray-700"
                    }`}
                >
                  <Network size={12} />
                  Week {currentWeek?.week_number ?? activeWeek + 1}
                </button>
              </div>

              {viewMode === "journey" && (
                <>
                  <GoalBadge className="sm:hidden" />
                  <div className="pointer-events-none hidden items-center gap-1.5 rounded-full border border-gray-200 bg-white/90 px-3 py-1.5 text-[10px] text-gray-500 shadow-sm backdrop-blur-md sm:flex">
                    <Flag size={11} className="text-[#0094BD]" />
                    Tap a step to dive in
                  </div>
                </>
              )}
            </div>

            <AnimatePresence mode="wait">
              {viewMode === "journey" ? (
                <motion.div
                  key="journey"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.35 }}
                  className="rm-scroll-v relative min-h-[380px] overflow-x-hidden overflow-y-auto px-4 pb-10 pt-14 sm:px-8"
                >
                  <JourneyMap
                    weeks={weeks}
                    activeWeek={activeWeek}
                    unlockedWeekIndex={unlockedWeekIndex}
                    passedWeeks={passedWeeks}
                    onPickWeek={handlePickWeek}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={`network-${activeWeek}`}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.35 }}
                  className="relative h-full min-h-[380px] p-2"
                >
                  <NetworkGraph
                    week={currentWeek}
                    weekIndex={activeWeek}
                    selectedSkill={selectedSkill}
                    onSelectSkill={setSelectedSkill}
                    trackName={roadmap.track_name}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Detail panel */}
          <div className="relative min-h-[300px] bg-white">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#7E1487]/30 to-transparent" />
            <AnimatePresence mode="wait">
              <SkillPanel
                key={selectedSkill?.skill_name ?? "empty"}
                skill={selectedSkill}
                weekNumber={currentWeek?.week_number ?? activeWeek + 1}
                totalWeeks={weeks.length}
                weekHours={weekHours}
              />
            </AnimatePresence>
          </div>
        </div>

        {/* Week quiz CTA */}
        {canTakeQuiz && (
          <div className="border-t border-gray-100 bg-gradient-to-r from-[#1387AE]/5 to-[#7E1487]/5 px-6 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">Ready to unlock the next week?</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Study this week&apos;s resources, then pass the quiz (70%+) to continue.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openWeekQuiz(activeWeek)}
                className="shrink-0 rounded-full bg-gradient-to-r from-[#7E1487] to-[#1387AE] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(19,135,174,0.3)] transition hover:-translate-y-0.5 cursor-pointer"
              >
                Take Week {activeWeek + 1} Quiz
              </button>
            </div>
          </div>
        )}

        {isCurrentWeekPassed && activeWeek < weeks.length - 1 && (
          <div className="border-t border-[#0094BD]/20 bg-[#0094BD]/5 px-6 py-3 text-center text-xs font-medium text-[#0094BD]">
            Week {activeWeek + 1} completed — Week {activeWeek + 2} is unlocked
          </div>
        )}

        {import.meta.env.DEV && !trackComplete && weeks.length > 0 && (
          <div className="border-t border-dashed border-amber-300/60 bg-amber-50/50 px-6 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-amber-800">
                Dev only — simulate finishing all weeks to preview project ideas.
              </p>
              <button
                type="button"
                onClick={() => {
                  const allPassed = weeks.map((_, i) => i);
                  useInterviewStore.setState({
                    passedWeeks: allPassed,
                    unlockedWeekIndex: weeks.length - 1,
                  });
                  useInterviewStore.getState().syncProgressCache();
                  const rm = useInterviewStore.getState().roadmap;
                  syncPassedSkillsToProfile(rm, allPassed);
                  syncTrackFinishedIfComplete(rm, allPassed);
                  generateProjectSuggestions();
                }}
                className="rounded-full border border-amber-400/50 bg-white px-4 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 cursor-pointer"
              >
                Test: Complete track
              </button>
            </div>
          </div>
        )}

        <WeekTimeline
          weeks={weeks}
          activeWeek={activeWeek}
          unlockedWeekIndex={unlockedWeekIndex}
          passedWeeks={passedWeeks}
          onSelectWeek={handleWeekChange}
        />

        {trackComplete && (
          <ProjectSuggestionsPanel
            trackName={roadmap.track_name}
            technologies={acquiredSkills}
          />
        )}
      </motion.div>
    </div>
  );
}
