"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: "easeOut" as const },
  }),
};

const socialProof = [
  { count: "10K+", label: "Students" },
  { count: "4.9", label: "Rating" },
  { count: "200+", label: "Courses" },
];

export function Hero() {
  return (
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
        {/* Live Badge */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Join 10,000+ learners today
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={0.1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight"
        >
          Master the skills that
          <br className="hidden sm:block" />{" "}
          <span className="text-slate-400">advance your career</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          custom={0.2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Learn from industry experts, build portfolio-ready projects, and join a community of professionals advancing their careers.
        </motion.p>

        {/* CTAs */}
        <motion.div
          custom={0.3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12"
        >
          <Link href="/signup">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="group px-7 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              Start Learning Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </motion.button>
          </Link>

          <Link href="/courses">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group px-7 py-3 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 hover:border-slate-300 transition-all duration-200 flex items-center gap-2"
            >
              <Play className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              Watch Demo
            </motion.button>
          </Link>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          custom={0.4}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex items-center justify-center gap-8 md:gap-12"
        >
          {socialProof.map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-xl md:text-2xl font-bold text-slate-900 tabular-nums">
                {item.count}
              </p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                {item.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-100 bg-slate-100/50 rounded-full blur-3xl" />
      </div>
    </section>
  );
}