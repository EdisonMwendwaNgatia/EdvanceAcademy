"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Star, Quote } from "lucide-react";

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

export function Testimonials() {
  return (
    <section className="py-16 md:py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-3 tracking-tight">
            Trusted by learners worldwide
          </h2>
          <p className="text-slate-500 text-sm md:text-base max-w-lg mx-auto">
            Join thousands of professionals who accelerated their careers
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((testimonial, idx) => (
            <motion.article
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.12, duration: 0.5, ease: "easeOut" }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
            >
              {/* Animated Quote Icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12 + 0.2, duration: 0.4, type: "spring", stiffness: 200 }}
              >
                <Quote className="w-8 h-8 text-slate-100 mb-4 group-hover:text-slate-200 transition-colors duration-300" strokeWidth={1.5} />
              </motion.div>

              {/* Animated Rating */}
              <div className="flex gap-0.5 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.12 + 0.3 + i * 0.05, duration: 0.3, type: "spring", stiffness: 300 }}
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </motion.div>
                ))}
              </div>

              {/* Text with subtle fade */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12 + 0.4, duration: 0.5 }}
                className="text-slate-600 text-sm leading-relaxed mb-5"
              >
                &ldquo;{testimonial.text}&rdquo;
              </motion.p>

              {/* Author with slide-in */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12 + 0.5, duration: 0.4 }}
                className="flex items-center gap-3 pt-4 border-t border-slate-100"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="relative w-9 h-9 flex-shrink-0"
                >
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="rounded-full object-cover ring-2 ring-slate-50"
                    sizes="36px"
                  />
                </motion.div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">
                    {testimonial.name}
                  </p>
                  <p className="text-slate-400 text-xs truncate">
                    {testimonial.role}
                  </p>
                </div>
              </motion.div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}