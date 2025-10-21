"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Shield,
  BarChart3,
  Users,
  Zap,
  Target,
  Clock,
  CheckCircle,
  TrendingUp,
  Atom,
  ScanSearch,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";

const features = [
  {
    icon:Atom,
    title: "AI-Powered JD Creation",
    description:
      "Instantly craft precise, engaging, and role-specific job descriptions with AI that attract the right talent, save time, and eliminate guesswork.",
    color: "from-blue-500 to-indigo-500",
  },

  {
    icon:ScanSearch,
    title: "AI Resume Analysis",
    description:
      "Leverage AI to evaluate resumes with precision—scoring skills, experience, and relevance to help you identify the best-fit candidates instantly.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Shield,
    title: "Bias-Free Assessment",
    description:
      "Eliminate unconscious bias with objective, data-driven evaluations that focus purely on merit and capabilities.",
    color: "from-purple-500 to-pink-500",
  },
    {
    icon: Target,
    title: "AI Video Interview",
    description:
      "Conduct seamless video interviews powered by AI that analyze communication, skills, and personality—giving you deeper insights beyond the resume.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: Users,
    title: "AI Interview Analysis",
    description:
      "Gain data-driven insights from interviews with AI that evaluates responses, measures candidate potential, and delivers unbiased performance scores.",
    color: "from-orange-500 to-red-500",
  },

  {
    icon: Zap,
    title: "Instant Results",
    description:
      "Receive comprehensive assessment results within minutes, not days, accelerating your hiring timeline.",
    color: "from-yellow-500 to-orange-500",
  },

];

const benefits = [
  {
    icon: Clock,
    title: "Save 70% Time",
    description:
      "Reduce hiring time from weeks to hours with automated screening and assessment.",
    color: "text-blue-600",
  },
  {
    icon: CheckCircle,
    title: "92% Success Rate",
    description:
      "Our AI-powered matching delivers higher quality hires that stay longer.",
    color: "text-green-600",
  },
  {
    icon: TrendingUp,
    title: "ROI Improvement",
    description:
      "Improve hiring ROI by 3x with better candidate selection and reduced turnover.",
    color: "text-purple-600",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-20 bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        {/* Section Heading */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            AI That Transforms Talent Acquisition
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Empower your hiring process with next-gen AI that ensures smarter decisions, faster results, and superior talent matches.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300`}
                  >
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-snug">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Benefits */}
        <motion.div
          className="mt-12 grid md:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="text-center p-4 bg-white rounded-lg shadow-md"
            >
              <benefit.icon
                className={`w-8 h-8 mx-auto mb-2 ${benefit.color}`}
              />
              <h4 className="text-base font-semibold text-gray-900 mb-1">
                {benefit.title}
              </h4>
              <p className="text-xs text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
