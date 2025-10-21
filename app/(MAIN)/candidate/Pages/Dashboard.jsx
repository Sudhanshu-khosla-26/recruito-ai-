
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { motion } from "framer-motion";
import { Calendar, FileText, Briefcase, Star, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import WelcomeContainer from "../components/welcome/WelcomeContainer";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    }
    setIsLoading(false);
  };

  const upcomingInterviews = [
    {
      company: "Tech Innovators Inc.",
      position: "Senior Frontend Developer",
      date: "Tomorrow",
      time: "2:00 PM",
      type: "Technical Interview",
      status: "confirmed"
    },
    {
      company: "Digital Solutions Co.",
      position: "React Developer",
      date: "Friday",
      time: "10:00 AM",
      type: "Final Round",
      status: "pending"
    },
    {
      company: "Startup Ventures",
      position: "Full Stack Engineer",
      date: "Next Monday",
      time: "3:30 PM",
      type: "First Interview",
      status: "confirmed"
    }
  ];

  const recentDocuments = [
    { name: "Updated Resume.pdf", type: "Resume", lastModified: "2 hours ago" },
    { name: "Cover Letter - TechCorp.pdf", type: "Cover Letter", lastModified: "1 day ago" },
    { name: "Portfolio Website.pdf", type: "Portfolio", lastModified: "3 days ago" },
    { name: "Certifications.pdf", type: "Certificate", lastModified: "1 week ago" },
  ];

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-slate-200 rounded-3xl"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-200 rounded-2xl"></div>
            <div className="h-64 bg-slate-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto flex flex-col h-full">
      <WelcomeContainer user={user} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 mt-8">
        {/* Upcoming Interviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl w-full flex flex-col">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Upcoming Interviews
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col flex-1">
              <div className="space-y-4 flex-1 overflow-y-auto">
                {upcomingInterviews.map((interview, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">{interview.company}</h3>
                        <p className="text-slate-600 text-sm">{interview.position}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                          <span>{interview.date} • {interview.time}</span>
                          <Badge variant="outline" className="text-xs">
                            {interview.type}
                          </Badge>
                        </div>
                      </div>
                      <Badge 
                        className={`${
                          interview.status === 'confirmed' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {interview.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Button className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Schedule New Interview
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl w-full flex flex-col">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Recent Documents
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-emerald-600 hover:bg-emerald-50">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col flex-1">
              <div className="space-y-3 flex-1 overflow-y-auto">
                {recentDocuments.map((doc, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{doc.name}</p>
                      <p className="text-sm text-slate-500">{doc.type} • {doc.lastModified}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </motion.div>
                ))}
              </div>
              <Button className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Upload New Document
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="mt-8"
      >
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Briefcase className="w-5 h-5 text-green-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-16 flex-col gap-2 border-green-200 hover:bg-green-50 hover:border-green-300">
                <Star className="w-5 h-5 text-green-600" />
                Update Profile
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Schedule Interview
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2 border-teal-200 hover:bg-teal-50 hover:border-teal-300">
                <FileText className="w-5 h-5 text-teal-600" />
                Upload Resume
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
