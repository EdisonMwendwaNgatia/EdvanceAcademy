"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Users, BookOpen, Shield } from "lucide-react";

export function Cta() {
  return (
    <section className="px-4 sm:px-6 mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="relative max-w-4xl mx-auto"
      >
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800">
          {/* Subtle background texture */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}
          />

          <div className="relative z-10 px-6 py-10 md:px-12 md:py-12 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium mb-5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              Free to start, no credit card required
            </div>

            {/* Heading */}
            <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-3 max-w-2xl mx-auto">
              Ready to advance your career?
            </h2>

            {/* Subtext */}
            <p className="text-sm md:text-base text-slate-400 mb-6 max-w-lg mx-auto leading-relaxed">
              Join 50,000+ learners. Access 500+ courses, hands-on projects, and expert mentorship.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group px-6 py-2.5 bg-white text-slate-900 text-sm font-semibold rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-2"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              </Link>
              <Link href="/courses">
                <button className="px-6 py-2.5 bg-slate-800 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-700 hover:text-white transition-colors border border-slate-700">
                  Browse Courses
                </button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-slate-500">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span className="text-xs">50k+ Learners</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span className="text-xs">500+ Courses</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span className="text-xs">14-Day Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}