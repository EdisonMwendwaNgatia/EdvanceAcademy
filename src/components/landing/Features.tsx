"use client";

import { motion, Variants } from "framer-motion";
import { Layers, Monitor, Users, ArrowRight } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const features = [
  {
    icon: Layers,
    title: "Structured Learning",
    desc: "Clear learning paths from beginner to advanced — every lesson builds on the last.",
    stat: "50+ Paths",
  },
  {
    icon: Monitor,
    title: "Real Projects",
    desc: "Build portfolio-ready applications step by step and ship work you're proud of.",
    stat: "200+ Projects",
  },
  {
    icon: Users,
    title: "Community",
    desc: "Learn alongside peers and get mentor support when you're stuck.",
    stat: "24/7 Support",
  },
];

export function Features() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium mb-5"
          >
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Why choose us
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Everything you need to succeed
          </h2>
          <p className="text-slate-500 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            A complete learning experience designed for real-world results
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid md:grid-cols-3 gap-4 md:gap-6"
        >
          {features.map(({ icon: Icon, title, desc, stat }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25 }}
              className="group relative bg-white rounded-2xl border border-slate-200 p-7 md:p-8 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-6 right-6 h-px bg-slate-100 group-hover:bg-slate-200 transition-colors duration-300" />

              {/* Icon with animated ring */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15, duration: 0.4, type: "spring", stiffness: 200 }}
                className="relative w-12 h-12 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center mb-5 group-hover:bg-slate-100 group-hover:text-slate-900 transition-all duration-300"
              >
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-slate-900/5 group-hover:ring-slate-900/10 transition-all duration-300" />
              </motion.div>

              {/* Title */}
              <h3 className="font-semibold text-slate-900 mb-2 text-base">{title}</h3>

              {/* Description */}
              <p className="text-sm text-slate-500 leading-relaxed mb-5">
                {desc}
              </p>

              {/* Stat + Link */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {stat}
                </span>
                <motion.div
                  className="flex items-center gap-1 text-xs font-medium text-slate-400 group-hover:text-slate-700 transition-colors duration-200"
                  whileHover={{ x: 2 }}
                >
                  Learn more
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}