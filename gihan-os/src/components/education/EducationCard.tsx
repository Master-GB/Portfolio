import React from 'react';
import { motion, Variants } from 'framer-motion';

// Props definition for EducationCard
interface EducationCardProps {
  degree: string;
  school: string;
  period: string;
  details: string;
  icon?: React.ReactNode; // optional custom icon
}

// Animation variants for the card
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

/**
 * Reusable card component for an education entry.
 * Includes a subtle lift on hover and fade‑in on scroll.
 */
export default function EducationCard({ degree, school, period, details, icon }: EducationCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
      className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-4 transition-colors hover:bg-white/10"
    >
      <div className="flex items-center gap-2 mb-2">
        {icon ?? <span className="text-cyan-400">📚</span>}
        <h3 className="text-sm font-semibold text-slate-200 flex-1">{degree}</h3>
      </div>
      <p className="text-xs text-slate-400">{school}</p>
      <p className="text-xs text-indigo-300 mb-2">{period}</p>
      <p className="text-sm text-slate-300 leading-relaxed">{details}</p>
    </motion.div>
  );
}
