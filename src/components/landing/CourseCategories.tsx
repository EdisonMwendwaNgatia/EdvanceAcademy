"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const categories = [
  {
    name: "Web Development",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    courses: 45,
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "AI & Machine Learning",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    courses: 32,
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Data Science",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    courses: 38,
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "Cloud Computing",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    courses: 28,
    color: "from-orange-500 to-red-500",
  },
];

export function CourseCategories() {
  return (
    <section className="mb-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Explore Popular Categories</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">Choose from 200+ courses across 10+ in-demand categories</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {categories.map((cat, idx) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4 }}
            className="relative group cursor-pointer"
          >
            <div className={`absolute inset-0 bg-linear-to-r ${cat.color} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            <div className="relative bg-white border border-gray-100 rounded-2xl p-6 text-center">
              <div className={`w-14 h-14 rounded-xl bg-linear-to-r ${cat.color} text-white flex items-center justify-center mx-auto mb-4`}>
                {cat.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{cat.name}</h3>
              <p className="text-sm text-gray-500">{cat.courses} courses</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link href="/courses">
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
          >
            View all categories →
          </motion.button>
        </Link>
      </div>
    </section>
  );
}