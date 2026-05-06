'use client';
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  BrainCircuit,
  Map,
  Code2,
  BadgeCheck,
  ArrowRight,
  Infinity,
} from 'lucide-react';

const phases = [
  {
    id: '01',
    icon: BrainCircuit,
    title: 'AI Analysis & Onboarding',
    description:
      'We scan your passion, skills, and goals to match you with a high-demand tech stack tailored precisely for you.',
    color: '#7E1487',
    gradient: 'from-[#7E1487]/10 to-[#7E1487]/5',
    border: 'border-[#7E1487]/20',
    glow: 'shadow-[#7E1487]/20',
  },
  {
    id: '02',
    icon: Map,
    title: 'Dynamic Roadmap Generation',
    description:
      'The AI builds a living, step-by-step roadmap that evolves based on your learning speed and performance.',
    color: '#0094BD',
    gradient: 'from-[#0094BD]/10 to-[#0094BD]/5',
    border: 'border-[#0094BD]/20',
    glow: 'shadow-[#0094BD]/20',
  },
  {
    id: '03',
    icon: Code2,
    title: 'Build & Verification',
    description:
      'Build real-world projects end-to-end. Our automated engine verifies every line of code for accuracy and quality.',
    color: '#7E1487',
    gradient: 'from-[#7E1487]/10 to-[#7E1487]/5',
    border: 'border-[#7E1487]/20',
    glow: 'shadow-[#7E1487]/20',
  },
  {
    id: '04',
    icon: BadgeCheck,
    title: 'CV Generation & Hiring',
    description:
      'Verified projects are auto-added to your portfolio, connecting you directly to recruiters looking for proven talent.',
    color: '#0094BD',
    gradient: 'from-[#0094BD]/10 to-[#0094BD]/5',
    border: 'border-[#0094BD]/20',
    glow: 'shadow-[#0094BD]/20',
  },
];

const stats = [
  { value: '04', label: 'Critical Phases', icon: "", valueClass: 'text-2xl mt-2' },
  { value: '∞', label: 'Continuous Loop', icon: Infinity, valueClass: 'text-4xl mb-1' },
];

function PhaseCard({ phase, index, isActive, onClick }) {
  const Icon = phase.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onClick(index)}
      className={`group relative cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300
        ${isActive ? `${phase.border} shadow-xl ${phase.glow}` : 'border-gray-300 hover:border-gray-200 hover:shadow-md'}
      `}
    >
      {/* Phase number */}
      <span
        className="absolute top-4 right-2 text-xs font-bold tracking-widest opacity-80"
        style={{ color: phase.color }}
      >
        PHASE {phase.id}
      </span>

      <div className="flex items-start gap-4">
        {/* Icon bubble */}
        <div
          className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center  duration-300 group-hover:scale-110`}
        >
          <Icon size={20} style={{ color: phase.color }} />
        </div>

        <div className="flex-1 min-w-0 pr-10">
          <h3 className="font-semibold text-gray-900 text-[15px] mb-1">{phase.title}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{phase.description}</p>
        </div>
      </div>

      {/* Active bar */}
      {isActive && (
        <motion.div
          layoutId="active-bar"
          className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full"
          style={{ background: phase.color }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
    </motion.div>
  );
}

export default function WorkflowPage() {
  const [activePhase, setActivePhase] = useState(0);
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true });

  return (
    <section
      ref={sectionRef}
      className="relative w-full flex flex-col items-center overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-[90%] lg:w-[85%] mx-auto lg:h-[90vh] py-12 lg:py-0 gap-10 lg:gap-12 mt-4 lg:mt-0">

        {/* ── LEFT COLUMN ── */}
        <div className="w-full lg:w-auto space-y-5 lg:space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#7E1487]/30 bg-[#7E1487]/8 px-4 py-1.5"
          >
            <span className="text-[#7E1487] text-xs font-semibold tracking-widest uppercase">
              Phase Sequence
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl xl:text-4xl 2xl:text-7xl font-bold text-gray-900 leading-[1.1]"
          >
            The Smart{' '}
            <span
              className="relative w-fit mt-1 block bg-gradient-to-r from-[#1387AE] to-[#DC9DEE] text-white px-4 py-1 rounded-full text-3xl md:text-4xl xl:text-3xl 2xl:text-6xl transform -rotate-1 mx-auto lg:mx-0"
            >
              Workflow.
            </span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm 2xl:text-lg xl:text-md text-gray-600 leading-relaxed max-w-xs sm:max-w-sm lg:max-w-xl"
          >
            Syntra.AI automates the transition from learning to employment through a
            four-stage, AI-verified pipeline built for the future of work.
          </motion.p>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex gap-4 w-full max-w-xs sm:max-w-sm lg:max-w-none"
          >
            {stats.map(({ value, label, icon: Icon, valueClass }) => (
              <div
                key={label}
                className="flex-1 rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-sm px-4 py-3 shadow-sm flex items-center justify-between flex-col"
              >
                <p className={`font-extrabold text-gray-900 ${valueClass}`}>{value}</p>
                <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mt-1 text-center">
                  {label}
                </p>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.a
            href="#"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1387AE] to-[#DC9DEE] text-white cursor-pointer px-6 py-2.5 2xl:px-12 2xl:py-3 rounded-full font-semibold text-sm 2xl:text-lg hover:opacity-90 transition-all shadow-lg shadow-blue-500/20"
          >
            Start Your Journey <ArrowRight size={16} />
          </motion.a>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="w-full lg:w-auto flex flex-col gap-3 lg:gap-4">
          <div className="relative flex flex-col gap-3 lg:gap-4">
            {phases.map((phase, i) => (
              <div key={phase.id} className="relative">
                <PhaseCard
                  phase={phase}
                  index={i}
                  isActive={activePhase === i}
                  onClick={setActivePhase}
                />
                {/* Connector line between cards */}
                {i < phases.length - 1 && (
                  <div className="absolute left-9 -bottom-2 w-[2px] h-3 lg:h-4 bg-gradient-to-b from-gray-200 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}