"use client";

import React, { useState } from "react";
import { ChevronDown, FileText, Calendar, MapPin, Briefcase, Search, X } from "lucide-react";
import axios from "axios";

const CandidateApplications = () => {
    const [expandedId, setExpandedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const [applications] = useState([
        {
            id: 1,
            jobTitle: "Senior Frontend Developer",
            company: "Tech Corp",
            location: "Bangalore, India",
            appliedDate: "2025-10-15",
            status: "Interview Scheduled",
            statusColor: "bg-green-50 text-green-700 border-green-200",
            matchPercentage: 92,
            interviewType: "Interview with HR",
            interviewDate: "2025-11-05",
            nextStep: "HR Round - 2:00 PM",
            description: "We are looking for a talented Frontend Developer with 5+ years of experience in React and Next.js.",
            salary: "12-15 LPA",
        },
        {
            id: 2,
            jobTitle: "Full Stack Developer",
            company: "StartUp XYZ",
            location: "Gurugram, India",
            appliedDate: "2025-10-12",
            status: "Under Review",
            statusColor: "bg-blue-50 text-blue-700 border-blue-200",
            matchPercentage: 85,
            interviewType: "Pending",
            interviewDate: null,
            nextStep: "Waiting for review",
            description: "Looking for a Full Stack Developer proficient in Node.js, React, and MongoDB.",
            salary: "10-13 LPA",
        },
        {
            id: 3,
            jobTitle: "React Developer",
            company: "Digital Solutions",
            location: "Delhi, India",
            appliedDate: "2025-10-08",
            status: "Completed",
            statusColor: "bg-gray-50 text-gray-700 border-gray-200",
            matchPercentage: 78,
            interviewType: "Completed",
            interviewDate: "2025-10-28",
            nextStep: "Result pending",
            description: "We need an experienced React Developer for our growing team.",
            salary: "8-11 LPA",
        },
        {
            id: 4,
            jobTitle: "UI/UX Designer",
            company: "Creative Agency",
            location: "Mumbai, India",
            appliedDate: "2025-10-05",
            status: "Not Suitable",
            statusColor: "bg-red-50 text-red-700 border-red-200",
            matchPercentage: 65,
            interviewType: "Not Selected",
            interviewDate: null,
            nextStep: "Thank you for applying",
            description: "Seeking a creative UI/UX Designer with portfolio.",
            salary: "6-9 LPA",
        },
        {
            id: 5,
            jobTitle: "DevOps Engineer",
            company: "Cloud Innovators",
            location: "Bangalore, India",
            appliedDate: "2025-10-20",
            status: "Interview Scheduled",
            statusColor: "bg-green-50 text-green-700 border-green-200",
            matchPercentage: 88,
            interviewType: "Interview with HM",
            interviewDate: "2025-11-08",
            nextStep: "HM Round - 10:00 AM",
            description: "Experienced DevOps Engineer needed for cloud infrastructure management.",
            salary: "15-18 LPA",
        },
    ]);

    const filteredApplications = applications.filter((app) => {
        const matchesSearch = app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || app.status.toLowerCase().replace(" ", "") === filterStatus.toLowerCase();
        return matchesSearch && matchesStatus;
    });


    useeffect(() => {
        // const getapplications = async () => {
        //     try {
        //         const response = await axios.
        //     } catch (error) {

        //     }
        // }
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 mt-3">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-3 md:px-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-green-600">My Applications</h1>
                    <p className="text-gray-500 text-xs md:text-sm mt-0.5">Track and manage your job applications</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 py-4 md:px-6">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-3 md:p-4 mb-4 border border-gray-200 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <div className="flex-1 relative">
                            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search jobs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="interviewscheduled">Interview Scheduled</option>
                            <option value="underreview">Under Review</option>
                            <option value="completed">Completed</option>
                            <option value="notsuitable">Not Suitable</option>
                        </select>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4">
                    {[
                        { label: "Total", value: applications.length, color: "text-green-600" },
                        { label: "Scheduled", value: applications.filter((a) => a.status === "Interview Scheduled").length, color: "text-blue-600" },
                        { label: "Under Review", value: applications.filter((a) => a.status === "Under Review").length, color: "text-yellow-600" },
                        { label: "Avg Match", value: Math.round(applications.reduce((sum, a) => sum + a.matchPercentage, 0) / applications.length) + "%", color: "text-green-600" },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-2.5 md:p-3 border border-gray-200 hover:shadow-md transition-all duration-200 animate-scaleIn" style={{ animationDelay: `${idx * 50}ms` }}>
                            <div className="text-xs text-gray-600">{stat.label}</div>
                            <div className={`text-lg md:text-xl font-bold ${stat.color}`}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Applications List */}
                <div className="space-y-2">
                    {filteredApplications.length > 0 ? (
                        filteredApplications.map((app, idx) => (
                            <div
                                key={app.id}
                                className="animate-slideUp"
                                style={{ animationDelay: `${idx * 30}ms` }}
                            >
                                <div
                                    onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                                    className="bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-300 cursor-pointer group"
                                >
                                    {/* Card Header */}
                                    <div className="p-3 md:p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate">
                                                        {app.jobTitle}
                                                    </h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-all duration-200 ${app.statusColor}`}>
                                                        {app.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs md:text-sm text-gray-600 mb-1.5">{app.company}</p>
                                                <div className="flex flex-wrap gap-2 md:gap-3 text-xs text-gray-600">
                                                    <div className="flex items-center gap-1 hover:text-green-600 transition-colors">
                                                        <MapPin size={14} className="text-green-600 flex-shrink-0" />
                                                        <span className="truncate">{app.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 hover:text-green-600 transition-colors">
                                                        <Calendar size={14} className="text-green-600 flex-shrink-0" />
                                                        <span className="whitespace-nowrap">{app.appliedDate}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-50 to-green-100 rounded-full border border-green-200 group-hover:shadow-md transition-all duration-300">
                                                    <div className="text-center">
                                                        <span className="text-xs md:text-sm font-bold text-green-600">{app.matchPercentage}</span>
                                                        <span className="text-xs text-green-600">%</span>
                                                    </div>
                                                </div>
                                                <ChevronDown
                                                    size={18}
                                                    className={`text-gray-400 group-hover:text-green-600 transition-all duration-300 ${expandedId === app.id ? "rotate-180" : ""}`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedId === app.id && (
                                        <div className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white p-3 md:p-4 animate-expandDown">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                                {/* Left Column */}
                                                <div className="space-y-3">
                                                    <div>
                                                        <h4 className="text-xs font-semibold text-gray-900 mb-1">Job Description</h4>
                                                        <p className="text-xs text-gray-600 line-clamp-3">{app.description}</p>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <div>
                                                            <h4 className="text-xs font-semibold text-gray-900 mb-0.5">Salary</h4>
                                                            <p className="text-xs text-green-600 font-medium">{app.salary}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Column */}
                                                <div className="space-y-2">
                                                    <div className="bg-white rounded-lg p-2.5 md:p-3 border border-green-100">
                                                        <h4 className="text-xs font-semibold text-gray-900 mb-2">Interview Status</h4>
                                                        <div className="space-y-2">
                                                            <div>
                                                                <p className="text-xs text-gray-600">Current Round</p>
                                                                <p className="text-xs font-medium text-gray-900">{app.interviewType}</p>
                                                            </div>
                                                            {app.interviewDate && (
                                                                <div>
                                                                    <p className="text-xs text-gray-600">Scheduled</p>
                                                                    <p className="text-xs font-medium text-gray-900">{app.interviewDate}</p>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-xs text-gray-600">Next Step</p>
                                                                <p className="text-xs font-medium text-green-600">{app.nextStep}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95">
                                                        <FileText size={14} />
                                                        View Resume
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-lg border border-gray-200 p-8 md:p-12 text-center animate-fadeIn">
                            <Search size={40} className="mx-auto text-gray-300 mb-3" />
                            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">No applications found</h3>
                            <p className="text-xs md:text-sm text-gray-600">Try adjusting your filters</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes expandDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        .animate-expandDown {
          animation: expandDown 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default CandidateApplications;