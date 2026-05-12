"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { TrendingUp, BookOpen, GraduationCap, Award } from "lucide-react";

function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const count = useCounter(value, 2200, isInView);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}
      <span className="text-slate-400 ml-0.5">{suffix}</span>
    </span>
  );
}

const stats = [
  {
    value: 12500,
    suffix: "+",
    label: "Active Students",
    sublabel: "Learning worldwide",
    icon: GraduationCap,
    span: "col-span-2 md:col-span-1",
  },
  {
    value: 340,
    suffix: "+",
    label: "Expert Courses",
    sublabel: "Across 12 categories",
    icon: BookOpen,
    span: "col-span-2 md:col-span-1",
  },
  {
    value: 98,
    suffix: "%",
    label: "Completion Rate",
    sublabel: "Above industry average",
    icon: TrendingUp,
    span: "col-span-2 md:col-span-1",
  },
  {
    value: 4.9,
    suffix: "/5",
    label: "Average Rating",
    sublabel: "From 8,000+ reviews",
    icon: Award,
    span: "col-span-2 md:col-span-1",
    isDecimal: true,
  },
];

export function Stats() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-14"
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight mb-3">
            Numbers that speak
          </h2>
          <p className="text-slate-500 text-sm md:text-base max-w-md mx-auto">
            Trusted by learners and teams across the globe
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ delay: idx * 0.08, duration: 0.45, ease: "easeOut" }}
                whileHover={{ y: -2 }}
                className={`${stat.span} group relative bg-white rounded-2xl border border-slate-200 p-5 md:p-6 hover:border-slate-300 transition-colors duration-200`}
              >
                {/* Icon */}
                <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center mb-4 group-hover:bg-slate-100 group-hover:text-slate-900 transition-all duration-200">
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                </div>

                {/* Number */}
                <p className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-1">
                  {stat.isDecimal ? (
                    <DecimalCounter value={stat.value} suffix={stat.suffix} />
                  ) : (
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  )}
                </p>

                {/* Label */}
                <p className="text-sm font-semibold text-slate-900 mb-0.5">
                  {stat.label}
                </p>

                {/* Sublabel */}
                <p className="text-xs text-slate-400">
                  {stat.sublabel}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Separate decimal counter for the rating
function DecimalCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState("0.0");

  useEffect(() => {
    if (!isInView) return;
    let startTime: number | null = null;
    const duration = 2200;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = (eased * value).toFixed(1);
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      <span className="text-slate-400 ml-0.5">{suffix}</span>
    </span>
  );
}