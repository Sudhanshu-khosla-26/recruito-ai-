"use client"
import React from "react";
import { motion } from "framer-motion";

export default function StatsSection() {
  const stats = [
    { number: "16+", label: "Companies Trust Us", color: "text-green-600" },
    { number: "10000+", label: "Assessments Completed", color: "text-green-600" },
    { number: "92%", label: "Hiring Success Rate", color: "text-green-600" },
    { number: "70%", label: "Faster Time-to-Hire", color: "text-green-600" }
  ];

  return (
    <section className="py-20 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className={`text-4xl lg:text-5xl font-bold ${stat.color} mb-2`}>
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}