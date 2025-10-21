"use client"
import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "VP of Engineering",
      company: "TechFlow Inc.",
      content: "RecruitoAI revolutionized our hiring process. We've reduced time-to-hire by 70% while significantly improving the quality of our hires. The AI insights are incredibly accurate.",
      rating: 5,
      avatar: "SM"
    },
    {
      name: "David Rodriguez",
      role: "Head of Talent",
      company: "InnovateCorp",
      content: "The bias-free assessment feature is a game-changer. We're now making more diverse and better hiring decisions based on pure merit and capability. Highly recommended!",
      rating: 5,
      avatar: "DR"
    },
    {
      name: "Emily Chen",
      role: "HR Director",
      company: "GlobalTech Solutions",
      content: "Implementation was seamless, and the ROI was immediate. Our hiring success rate improved by 40% in just the first quarter. The team collaboration features are fantastic.",
      rating: 5,
      avatar: "EC"
    },
    {
      name: "Michael Johnson",
      role: "CTO",
      company: "NexusTech",
      content: "The candidate matching algorithm is exceptional. We're finding perfect-fit candidates we would have otherwise missed with traditional screening methods.",
      rating: 5,
      avatar: "MJ"
    },
    {
      name: "Jessica Williams",
      role: "Talent Acquisition Lead",
      company: "CloudScale",
      content: "The analytics dashboard provides insights we never had before. We can now make data-driven decisions about our hiring strategy.",
      rating: 5,
      avatar: "JW"
    }
  ];

  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll effect
  useEffect(() => {
    if (!autoScroll || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const maxScroll = container.scrollWidth - container.clientWidth;
    let scrollDirection = 1;
    let scrollSpeed = 1;

    const interval = setInterval(() => {
      if (container.scrollLeft >= maxScroll - 10) {
        scrollDirection = -1;
      } else if (container.scrollLeft <= 10) {
        scrollDirection = 1;
      }
      
      container.scrollLeft += scrollDirection * scrollSpeed;
      
      // Gradually increase speed until reaching max
      if (scrollSpeed < 2) scrollSpeed += 0.05;
    }, 30);

    return () => clearInterval(interval);
  }, [autoScroll]);

  // Mouse drag to scroll functionality
  const startDrag = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    setAutoScroll(false);
    
    // Re-enable auto-scroll after 10 seconds of inactivity
    setTimeout(() => setAutoScroll(true), 10000);
  };

  const duringDrag = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const endDrag = () => {
    setIsDragging(false);
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollLeft += direction * scrollAmount;
      setAutoScroll(false);
      setTimeout(() => setAutoScroll(true), 10000);
    }
  };

  return (
    <section id="testimonials" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-bold bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent mb-6">
            Loved by HR Leaders
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See why thousands of companies trust RecruitoAI to transform their hiring process.
          </p>
        </motion.div>

        {/* Scrollable cards container */}
        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-hidden gap-6 py-4 px-2 cursor-grab active:cursor-grabbing"
            onMouseDown={startDrag}
            onMouseLeave={endDrag}
            onMouseUp={endDrag}
            onMouseMove={duringDrag}
            style={{ scrollBehavior: 'smooth' }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-80"
              >
                <Card className="h-full transition-all duration-300 border border-green-100/30 shadow-md bg-white/70 backdrop-blur-sm group hover:bg-white/90 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-green-500 text-green-500" />
                      ))}
                    </div>
                    
                    <div className="relative mb-5">
                      <Quote className="absolute -top-2 -left-2 w-6 h-6 text-green-100/70" />
                      <p className="text-gray-700 text-sm leading-relaxed pl-5">
                        "{testimonial.content}"
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{testimonial.name}</div>
                        <div className="text-gray-600 text-xs">{testimonial.role}</div>
                        <div className="text-green-600 text-xs font-medium">{testimonial.company}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Navigation buttons */}
          <button 
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-green-600 hover:bg-green-50 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-green-600 hover:bg-green-50 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Trust Indicators */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="text-gray-500 mb-6 text-sm">Trusted by leading companies</div>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {["ABG Softnet", "MPH Power", "CZ Technology", "Aaryan Softnet", "Epoch Technet", "Shree Engineering"].map((company, index) => (
              <div key={index} className="text-lg font-bold text-gray-400">
                {company}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}