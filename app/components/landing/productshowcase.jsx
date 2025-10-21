"use client";
import React from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ArrowRight, CheckCircle, Brain, BarChart3, Users, Monitor, Calendar, GitCompareIcon, GitGraph } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductShowcase() {
  // Safe JS object, no JSON.parse
  const productCards = [
    {
      icon: <Brain className="w-7 h-7 text-green-600 mb-3" />,
      title: "Candidate Pipeline Overview",
      description:
        "Track every stage of the hiring journey in one AI-powered dashboard.",
      progress: "w-[95%]",
      data: null,
    },
    {
      icon: <BarChart3 className="w-7 h-7 text-green-600 mb-3" />,
      title: "Instant overview. Instant decisions.",
      description:
        "A consolidated view of each candidate—resume score, interview score, key skills, and cultural-fit indicators.",
      data: [
        { label: "Success Rate", value: "92%" },
        { label: "Time Saved", value: "70%" },
      ],
    },
    {
      icon: <Monitor className="w-7 h-7 text-green-600 mb-3" />,
      title: "Monitor interviews in real time.",
      description:
        "Track ongoing AI-driven interviews with live transcripts, sentiment flags, and on-the-fly scoring.",
      data: [
        { label: "Live Interviews", value: "3" },
        { label: "Avg Score", value: "85%" },
      ],
    },
    {
      icon: <Calendar className="w-7 h-7 text-green-600 mb-3" />,
      title: "Automated Scheduling & Coordination",
      description:
        "AI handles interview scheduling with hiring managers and candidates, saving time and avoiding conflicts.",
      data: [
        { label: "Interview with HR", value: "2" },
        { label: "Interview with HM", value: "8" },
      ],
    },
    {
      icon: <GitCompareIcon className="w-7 h-7 text-green-600 mb-3" />,
      title: "Compare candidates side-by-side.",
      description:
        "AI-powered comparison of shortlisted candidates across skills, performance metrics, and weighted suitability.",
      data: [
        { label: "Shortlisted", value: "12" },
        { label: "Top Match", value: "95%" },
      ],
    },
    {
      icon: <GitGraph className="w-7 h-7 text-green-600 mb-3" />,
      title: "Actionable insights, smarter hires",
      description:
        "Get data-driven recommendations—bias alerts, next steps, and suggested interview questions.",
      data: [
        { label: "Bias Alerts", value: "2" },
        { label: "Recommendations", value: "8" },
      ],
    },
  ];

  const renderCardData = (card) => {
    if (card.progress) {
      return (
        <div className="mt-3 h-2 bg-gray-200 rounded-full">
          <div
            className={`h-full bg-green-400 rounded-full ${card.progress}`}
          ></div>
        </div>
      );
    }

    if (Array.isArray(card.data)) {
      return (
        <div className="mt-3 space-y-1 text-xs">
          {card.data.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span>{item.label}</span>
              <span className="font-semibold text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <section id="product" className="py-20 bg-green-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Experience RecruitoAI in Action
          </h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Discover how AI transforms hiring—from smart assessments to seamless
            collaboration—all in one demo.
          </p>
        </motion.div>

        {/* Product Cards in Grid */}
        <motion.div
          className="relative mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="relative bg-green-100 rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="ml-3 text-xs text-gray-700">
                RecruitoAI Dashboard
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {productCards.map((card, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col"
                >
                  {card.icon}
                  <h3 className="text-base font-semibold mb-2 text-gray-900">
                    {card.title}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed flex-1">
                    {card.description}
                  </p>
                  {renderCardData(card)}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
