"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { TrustedCompanies } from "@/components/landing/TrustedCompanies";
import { Features } from "@/components/landing/Features";
import { Stats } from "@/components/landing/Stats";
import { CourseCategories } from "@/components/landing/CourseCategories";
import { Testimonials } from "@/components/landing/Testimonials";
import { Cta } from "@/components/landing/Cta";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <Hero />
        <TrustedCompanies />
        <Features />
        <Stats />
        <CourseCategories />
        <Testimonials />
        <Cta />
      </div>

      <Footer />
    </main>
  );
}