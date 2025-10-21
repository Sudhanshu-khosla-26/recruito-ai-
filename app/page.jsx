"use client";
import React, { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import HeroSection from "./components/landing/HeroSection";
import FeaturesSection from "./components/landing/FeaturesSection";
import ProductShowcase from "./components/landing/ProductShowcase";
import TestimonialsSection from "./components/landing/TestimonialsSection";
import StatsSection from "./components/landing/StatsSection";
import CTASection from "./components/landing/CTASection";
import Footer from "./components/landing/Footer";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track login state
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

    // 🔹 Replace this with your real auth check (cookie, localStorage, API, etc.)
    const user = localStorage.getItem("user");
    setIsAuthenticated(!!user);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/dashboard"); // Existing user → dashboard
    } else {
      router.push("/signin"); // New user → auth page
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-xl"
            : "bg-transparent"
          }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img
                src="/logo1.png" // <-- place logo in public/
                alt="Recruito Logo"
                className="h-8 w-auto"
              />
            </div>

            {/* Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                Features
              </a>
              <a
                href="#product"
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                Product
              </a>
              <a
                href="#testimonials"
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                Reviews
              </a>
              <Button
                onClick={handleGetStarted}
                className="bg-green-600 border-2 border-white text-white rounded-full px-6 py-2 shadow-md hover:bg-green-700 hover:shadow-lg transition-all"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Page Sections */}
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <ProductShowcase />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
