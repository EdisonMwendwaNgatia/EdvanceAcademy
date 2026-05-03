"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/* ─── animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

/* ─── animated counter ─── */
function useCounter(target: number, duration = 1600, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

function StatCounter({
  target,
  suffix,
  label,
  start,
}: {
  target: number;
  suffix: string;
  label: string;
  start: boolean;
}) {
  const count = useCounter(target, 1600, start);
  return (
    <div>
      <p className="text-3xl font-semibold text-gray-900">
        {count}
        {suffix}
      </p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

/* ─── feature card data ─── */
const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="w-5 h-5">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "Structured Learning",
    desc: "Clear learning paths from beginner to advanced — every lesson builds on the last.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="w-5 h-5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    title: "Real Projects",
    desc: "Build portfolio-ready applications step by step and ship work you're proud of.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="w-5 h-5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Community",
    desc: "Learn alongside peers and get mentor support when you're stuck.",
  },
];

/* ─── stats data ─── */
const stats = [
  { target: 10, suffix: "K+", label: "Students" },
  { target: 200, suffix: "+", label: "Courses" },
  { target: 500, suffix: "+", label: "Lessons" },
  { target: 95, suffix: "%", label: "Success Rate" },
];

/* ─── Course Categories ─── */
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

/* ─── Testimonials ─── */
const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Software Engineer",
    image: "https://i.pinimg.com/1200x/eb/db/2c/ebdb2c8c85976fe92bafd662ed574711.jpg",
    text: "The structured learning paths helped me transition from a non-tech background to a full-time developer. The community support is incredible!",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Data Scientist",
    image: "https://i.pinimg.com/736x/4c/06/54/4c0654351911fd2264258c6c90e585b1.jpg",
    text: "Best platform for hands-on projects. I built my portfolio while learning and landed my dream job within 6 months.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Product Manager",
    image: "https://i.pinimg.com/736x/44/4e/1c/444e1c940b5672ac6524ae0b8d0fcf28.jpg",
    text: "The AI & ML courses are top-notch. The mentor support and real-world projects made all the difference in my learning journey.",
    rating: 5,
  },
];

/* ─── Trusted Companies ─── */
const companies = [
  "Google", "Microsoft", "Amazon", "Apple", "Netflix", "Meta"
];

/* ═══════════════════════════════════════════════ */
export default function Home() {
  /* trigger stat counters when section enters view */
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* ── HEADER WITH LOGIN/SIGNUP ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="font-bold text-xl text-gray-900">EdVance<span className="text-blue-600">Academy</span></span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/courses" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Courses</Link>
              <Link href="/paths" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Learning Paths</Link>
              <Link href="/enterprise" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">For Business</Link>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Log in
                </motion.button>
              </Link>
              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(37,99,235,0.25)" }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all"
                >
                  Sign up
                </motion.button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden pt-4 pb-2 border-t border-gray-100 mt-4"
            >
              <nav className="flex flex-col gap-3">
                <Link href="/courses" className="text-gray-600 hover:text-gray-900 transition-colors py-2">Courses</Link>
                <Link href="/paths" className="text-gray-600 hover:text-gray-900 transition-colors py-2">Learning Paths</Link>
                <Link href="/enterprise" className="text-gray-600 hover:text-gray-900 transition-colors py-2">For Business</Link>
                <div className="flex gap-3 pt-2">
                  <Link href="/login" className="flex-1 text-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium">Log in</Link>
                  <Link href="/signup" className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Sign up</Link>
                </div>
              </nav>
            </motion.div>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">

        {/* ── HERO ── */}
        <section className="text-center mb-24">
          {/* live badge */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full
                       bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Join 10,000+ learners
          </motion.div>

          {/* headline */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-tight"
          >
            Master Tech Skills{" "}
            <span className="bg-linear-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Your Way</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="text-xl text-gray-500 max-w-2xl mx-auto mb-8"
          >
            Learn from industry experts, build real-world projects, and advance your career with our structured learning paths.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="flex justify-center gap-4 flex-wrap"
          >
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(37,99,235,0.35)" }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm
                           font-medium rounded-xl transition-all duration-150 shadow-sm"
              >
                Start Learning for Free
              </motion.button>
            </Link>

            <Link href="/courses">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3.5 border border-gray-200 hover:border-gray-300
                           hover:bg-gray-50 text-sm font-medium rounded-xl
                           transition-colors duration-150"
              >
                Browse Courses →
              </motion.button>
            </Link>
          </motion.div>
        </section>

        {/* ── TRUSTED COMPANIES ── */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-24 text-center"
        >
          <p className="text-sm text-gray-400 uppercase tracking-wider mb-6">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
            {companies.map((company) => (
              <span key={company} className="text-gray-500 font-medium text-lg">{company}</span>
            ))}
          </div>
        </motion.section>

        {/* ── FEATURES ── */}
        <motion.section
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-24"
        >
          {features.map(({ icon, title, desc }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
              className="group border border-gray-100 bg-gray-50 hover:bg-white
                         hover:border-blue-100 rounded-2xl p-6 cursor-default
                         transition-all duration-200 relative overflow-hidden"
            >
              <span
                className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-blue-600 to-blue-400
                           scale-x-0 group-hover:scale-x-100 origin-left
                           transition-transform duration-300"
              />

              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600
                              flex items-center justify-center mb-4">
                {icon}
              </div>

              <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* ── STATS ── */}
        <motion.section
          ref={statsRef}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center
                     border border-gray-100 rounded-2xl py-10 px-6 bg-linear-to-br from-gray-50 to-white mb-24"
        >
          {stats.map(({ target, suffix, label }) => (
            <StatCounter
              key={label}
              target={target}
              suffix={suffix}
              label={label}
              start={statsVisible}
            />
          ))}
        </motion.section>

        {/* ── COURSE CATEGORIES ── */}
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

        {/* ── TESTIMONIALS ── */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Students Say</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Join thousands of successful graduates who transformed their careers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">&quot;{testimonial.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    <Image 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{testimonial.name}</p>
                    <p className="text-gray-400 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-600 to-blue-400 p-8 md:p-12 text-center mb-12"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Ready to advance your career?</h2>
            <p className="text-blue-50 mb-6 max-w-md mx-auto">Join thousands of learners and start your journey today</p>
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Get Started for Free
              </motion.button>
            </Link>
          </div>
        </motion.section>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">E</span>
                </div>
                <span className="font-bold text-gray-900">EdVance<span className="text-blue-600">Academy</span></span>
              </div>
              <p className="text-sm text-gray-500">Empowering learners worldwide with quality tech education.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="#" className="hover:text-gray-700">Courses</Link></li>
                <li><Link href="#" className="hover:text-gray-700">Learning Paths</Link></li>
                <li><Link href="#" className="hover:text-gray-700">For Business</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="#" className="hover:text-gray-700">About</Link></li>
                <li><Link href="#" className="hover:text-gray-700">Careers</Link></li>
                <li><Link href="#" className="hover:text-gray-700">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="#" className="hover:text-gray-700">Help Center</Link></li>
                <li><Link href="#" className="hover:text-gray-700">Contact</Link></li>
                <li><Link href="#" className="hover:text-gray-700">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-8 mt-8 border-t border-gray-200 text-sm text-gray-400">
            © 2025 EdVance Academy. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}