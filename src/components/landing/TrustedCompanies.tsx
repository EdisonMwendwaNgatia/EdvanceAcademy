"use client";

import { motion } from "framer-motion";

const companies = [
  { name: "Google", width: 74 },
  { name: "Microsoft", width: 90 },
  { name: "Amazon", width: 72 },
  { name: "Apple", width: 52 },
  { name: "Netflix", width: 68 },
  { name: "Meta", width: 48 },
];

export function TrustedCompanies() {
  return (
    <section className="py-14 md:py-16 border-y border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.15em] mb-8">
            Trusted by engineering teams at
          </p>

          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6 md:gap-x-14">
            {companies.map((company, idx) => (
              <motion.div
                key={company.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06, duration: 0.4 }}
                whileHover={{ opacity: 1, scale: 1.05 }}
                className="opacity-40 hover:opacity-70 transition-opacity duration-300 cursor-default"
              >
                <span
                  className="text-slate-400 font-bold text-lg md:text-xl tracking-tight select-none"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {company.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}