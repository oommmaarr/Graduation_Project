'use client';
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  GraduationCap,
  Users,
  Briefcase,
  Map,
  FileText,
  ShieldCheck,
  Rocket,
  BotMessageSquare,
  BookOpen,
  BarChart2,
  LayoutDashboard,
  SlidersHorizontal,
  Database,
  Building2,
  BadgeCheck,
  ArrowRight,
} from 'lucide-react';

const roles = [
  {
    id: 'learner',
    icon: GraduationCap,
    title: 'The Learner',
    tagline: 'Master new skills with verified roadmaps.',
    tag: 'LEARNER FLOW',
    heading: 'The Learner Journey',
    description:
      'Designed for students and developers who want to bridge the gap between education and employment. Get a personalized roadmap, verify your skills with real projects, and watch your professional CV generate itself automatically.',
    color: '#7E1487',
    gradientFrom: 'from-[#7E1487]',
    gradientTo: 'to-[#0094BD]',
    borderColor: 'border-[#7E1487]/25',
    bgColor: 'bg-[#7E1487]/8',
    tagColor: 'text-[#7E1487]',
    features: [
      { icon: Map, label: 'Dynamic Roadmaps' },
      { icon: FileText, label: 'Auto CV Builder' },
      { icon: ShieldCheck, label: 'Project Verification' },
      { icon: Rocket, label: 'Job Readiness' },
    ],
  },
  {
    id: 'team',
    icon: Users,
    title: 'The Team',
    tagline: 'Collaborate with AI-powered tasking.',
    tag: 'TEAM FLOW',
    heading: 'Collaborative Workspace',
    description:
      'Transform group projects into professional development environments. AI automatically distributes tasks based on team skills, generates SRS documentation, and tracks weekly progress automatically.',
    color: '#0094BD',
    gradientFrom: 'from-[#0094BD]',
    gradientTo: 'to-[#7E1487]',
    borderColor: 'border-[#0094BD]/25',
    bgColor: 'bg-[#0094BD]/8',
    tagColor: 'text-[#0094BD]',
    features: [
      { icon: BotMessageSquare, label: 'AI Task Distribution' },
      { icon: BookOpen, label: 'Auto Documentation' },
      { icon: BarChart2, label: 'Progress KPI Tracking' },
      { icon: LayoutDashboard, label: 'Unified Workspace' },
    ],
  },
  {
    id: 'recruiter',
    icon: Briefcase,
    title: 'The Recruiter',
    tagline: 'Hire talent based on verified performance.',
    tag: 'RECRUITER HUB',
    heading: 'Precision Recruitment',
    description:
      'Hire talent based on proven, verified performance rather than just resume claims. Access the Recruiter Hub to filter by skills, view project data, and connect directly with top-performing learners and teams.',
    color: '#7E1487',
    gradientFrom: 'from-[#7E1487]',
    gradientTo: 'to-[#DC9DEE]',
    borderColor: 'border-[#7E1487]/25',
    bgColor: 'bg-[#7E1487]/8',
    tagColor: 'text-[#7E1487]',
    features: [
      { icon: SlidersHorizontal, label: 'Skill Filtering' },
      { icon: Database, label: 'Real Project Data' },
      { icon: Building2, label: 'Direct Hiring Hub' },
      { icon: BadgeCheck, label: 'Performance Badges' },
    ],
  },
];

function RoleCard({ role, isActive, onClick, index }) {
  const Icon = role.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className={`group relative cursor-pointer rounded-2xl border-2 p-4 transition-all duration-300 ${
        isActive
          ? `${role.borderColor} shadow-lg bg-white`
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white/60'
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${role.bgColor} transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon size={20} style={{ color: role.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-[15px]">{role.title}</p>
          <p className="text-gray-400 text-xs mt-0.5 truncate">{role.tagline}</p>
        </div>
        {isActive && (
          <ArrowRight size={16} style={{ color: role.color }} className="shrink-0" />
        )}
      </div>

      {isActive && (
        <motion.div
          layoutId="role-bar"
          className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
          style={{ background: role.color }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
    </motion.div>
  );
}

function FeatureChip({ icon: Icon, label, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm"
    >
      <Icon size={16} style={{ color }} className="shrink-0" />
      <span className="md:text-sm text-xs font-semibold text-gray-700">{label}</span>
    </motion.div>
  );
}

export default function RolesPage() {
  const [activeRole, setActiveRole] = useState(0);
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true });
  const current = roles[activeRole];
  const CurrentIcon = current.icon;

  return (
    <section
      ref={sectionRef}
      className="relative w-full flex flex-col items-center overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-[90%] lg:w-[85%] mx-auto lg:h-[90vh] py-12 lg:py-0 gap-10 lg:gap-16 mt-4 lg:mt-0">

        {/* ── LEFT COLUMN ── */}
        <div className="w-full lg:w-[36%] space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#7E1487]/30 bg-[#7E1487]/8 px-4 py-1.5"
          >
            <span className="text-[#7E1487] text-xs font-semibold tracking-widest uppercase">
              The Ecosystem
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl xl:text-4xl 2xl:text-7xl font-bold text-gray-900 leading-[1.1]"
          >
            One Platform,{' '}
            <span
              className={`relative w-fit mt-1 block bg-gradient-to-r from-[#1387AE] to-[#DC9DEE] text-white px-4 py-1 rounded-full text-3xl md:text-4xl xl:text-3xl 2xl:text-6xl transform -rotate-1 mx-auto lg:mx-0`}
            >
              Three Paths.
            </span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm text-gray-500 leading-relaxed max-w-xs sm:max-w-sm mx-auto lg:mx-0"
          >
            Choose your journey in the Syntra.AI engine. Each role offers a unique set of AI-powered tools.
          </motion.p>

          {/* Role selector cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col gap-3 w-full"
          >
            {roles.map((role, i) => (
              <RoleCard
                key={role.id}
                role={role}
                index={i}
                isActive={activeRole === i}
                onClick={() => setActiveRole(i)}
              />
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN — Detail Panel ── */}
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full lg:flex-1 rounded-3xl border-2 bg-white/80 backdrop-blur-sm p-6 lg:p-8 shadow-xl"
          style={{ borderColor: `${current.color}30` }}
        >
          {/* Role icon + heading */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: `linear-gradient(135deg, ${current.color}22, ${current.color}44)` }}
            >
              <CurrentIcon size={26} style={{ color: current.color }} />
            </div>
            <div>
              <h2 className="text-lg lg:text-2xl font-bold text-gray-900 whitespace-nowrap">{current.heading}</h2>
              <p
                className="text-xs font-bold tracking-widest mt-1"
                style={{ color: current.color }}
              >
                {current.tag}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div
            className="h-[2px] w-full rounded-full mb-5 opacity-30"
            style={{ background: `linear-gradient(90deg, ${current.color}, transparent)` }}
          />

          {/* Description */}
          <p className="text-gray-600 text-sm lg:text-base leading-relaxed mb-6">
            {current.description}
          </p>

          {/* Feature chips grid */}
          <div className="grid grid-cols-2 gap-3">
            {current.features.map((feat, i) => (
              <FeatureChip
                key={feat.label}
                icon={feat.icon}
                label={feat.label}
                color={current.color}
                delay={i * 0.07}
              />
            ))}
          </div>

          {/* CTA */}
          <motion.a
            href="#"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-5 inline-flex items-center gap-2 bg-gradient-to-r from-[#1387AE] to-[#DC9DEE] text-white cursor-pointer px-6 py-2.5 2xl:px-12 2xl:py-3 rounded-full font-semibold text-sm 2xl:text-lg hover:opacity-90 transition-all shadow-lg shadow-blue-500/20"
          >
            Get Started as {current.title} <ArrowRight size={15} />
          </motion.a>
        </motion.div>

      </div>
    </section>
  );
}
