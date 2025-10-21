"use client"
import React from "react";
import { Button } from "../ui/button";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-32 bg-gradient-to-br from-green-700 via-emerald-700 to-teal-700 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-green-400 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <span className="text-lg font-medium text-green-100">
              Ready to Transform Your Hiring?
            </span>
          </div>

          <h2 className="text-5xl lg:text-6xl font-bold mb-8 leading-tight">
            Start Finding Better Talent
            <span className="block text-transparent bg-gradient-to-r from-yellow-400 to-green-400 bg-clip-text">
              In Minutes, Not Weeks
            </span>
          </h2>

          <p className="text-xl text-green-50 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of forward-thinking companies that have already transformed their hiring process with AI-powered assessments.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signin" passHref legacyBehavior>
              <Button size="lg" className="bg-white text-green-900 hover:bg-gray-100 shadow-2xl px-8 py-4 text-lg font-semibold group">
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/signin" passHref legacyBehavior>
              <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/20 hover:text-white px-8 py-4 text-lg">
                Schedule a Demo
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-green-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>Setup in under 5 minutes</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
