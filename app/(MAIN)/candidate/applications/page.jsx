"use client"

import React, { useEffect, useState } from "react";
import { ChevronDown, FileText, Calendar, MapPin, Search, X, Loader2, Briefcase, DollarSign, Award, ChevronLeft } from "lucide-react";
import axios from "axios";

const CandidateApplications = () => {
    const [expandedId, setExpandedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [jobDetails, setJobDetails] = useState({});
    const [loadingJobId, setLoadingJobId] = useState(null);
    const [showJobModal, setShowJobModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    const transformApplicationData = (apiData) => {
        return apiData.map((app) => {
            const appliedDate = new Date(app.applied_at._seconds * 1000)
                .toISOString()
                .split("T")[0];

            const interviews = app.interviews_list || [];
            const interviewTypeMap = {
                Wai: "AI Interview",
                Whr: "HR Interview",
                hm: "Hiring Manager Interview"
            };

            const completedInterviews = interviews.filter(i => i.status === "completed");
            const scheduledInterviews = interviews.filter(i => i.status === "scheduled");

            let currentStage = "Application Submitted";
            let nextStep = "Waiting for review";

            if (scheduledInterviews.length > 0) {
                const interview = scheduledInterviews[0];
                currentStage = interviewTypeMap[interview.mode] || interview.mode;
                nextStep = `${currentStage} scheduled`;
            } else if (completedInterviews.length > 0 && interviews.length > completedInterviews.length) {
                const nextInterview = interviews[completedInterviews.length];
                currentStage = interviewTypeMap[nextInterview.mode] || nextInterview.mode;
                nextStep = `Awaiting ${currentStage}`;
            } else if (completedInterviews.length === interviews.length && interviews.length > 0) {
                currentStage = "All Interviews Completed";
                nextStep = "Awaiting final decision";
            }

            const statusMap = {
                interview_scheduled: "Interview Scheduled",
                under_review: "Under Review",
                completed: "Completed",
                not_suitable: "Not Suitable",
            };

            const statusColorMap = {
                interview_scheduled: "bg-green-50 text-green-700 border-green-200",
                under_review: "bg-blue-50 text-blue-700 border-blue-200",
                completed: "bg-gray-50 text-gray-700 border-gray-200",
                not_suitable: "bg-red-50 text-red-700 border-red-200",
            };

            return {
                id: app.id,
                job_id: app.job_id,
                jobposition: app.jobposition,
                location: app.location,
                appliedDate: appliedDate,
                status: statusMap[app.status] || app.status,
                statusColor: statusColorMap[app.status] || "bg-gray-50 text-gray-700 border-gray-200",
                matchPercentage: app.match_percentage,
                interviews_list: interviews,
                completedInterviews,
                scheduledInterviews,
                currentStage,
                nextStep,
                description: app.description || "No description available",
                salary: app.salary || "Not specified",
                applicantName: app.applicant_name,
                applicantEmail: app.applicant_email,
                applicantPhone: app.applicant_phone,
                resumeUrl: app.resume_url,
            };
        });
    };

    const filteredApplications = applications?.filter((app) => {
        const matchesSearch = app?.jobposition
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesStatus =
            filterStatus === "all" ||
            app.status.toLowerCase().replace(" ", "") === filterStatus.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const getJobDetails = async (jobId) => {
        try {
            if (jobDetails[jobId]) {
                return;
            }
            setLoadingJobId(jobId);
            const response = await axios.get(`/api/job/${jobId}`);
            setJobDetails((prev) => ({
                ...prev,
                [jobId]: response.data,
            }));
        } catch (error) {
            console.error("Error fetching job details:", error);
        } finally {
            setLoadingJobId(null);
        }
    };

    const getApplications = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/Applications/get-candidate-applications");
            const transformedData = transformApplicationData(response.data.applications);
            setApplications(transformedData);
        } catch (error) {
            console.error("Error fetching applications:", error);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewFullDetails = (app) => {
        const job = jobDetails[app.job_id];
        if (job) {
            setSelectedJob({ ...job, application: app });
            setShowJobModal(true);
        }
    };

    const handleCloseExpanded = () => {
        setExpandedId(null);
    };

    useEffect(() => {
        getApplications();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-green-200 rounded-full animate-ping opacity-75"></div>
                        <div className="relative border-4 border-green-600 border-t-transparent rounded-full w-16 h-16 animate-spin"></div>
                    </div>
                    <p className="text-gray-600 font-medium text-sm">Loading applications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header with Search and Filters */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                    {/* Mobile: Back Button when expanded */}
                    {expandedId && (
                        <button
                            onClick={handleCloseExpanded}
                            className="flex lg:hidden items-center gap-2 text-gray-600 hover:text-green-600 mb-3 transition-colors"
                        >
                            <ChevronLeft size={20} />
                            <span className="text-sm font-medium">Back to Applications</span>
                        </button>
                    )}

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
                        {/* Title - Center on large screens */}
                        <div className="lg:flex-1 lg:text-left">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">
                                My Applications
                            </h1>
                            <p className="text-gray-500 text-xs sm:text-sm mt-0.5 hidden sm:block">
                                Track and manage your job applications
                            </p>
                        </div>

                        {/* Search and Filter */}
                        <div className="flex gap-2 sm:gap-3 lg:min-w-[400px]">
                            <div className="flex-1 relative min-w-0">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex-shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search jobs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-white min-w-[100px] sm:min-w-[140px]"
                            >
                                <option value="all">All Status</option>
                                <option value="interviewscheduled">Scheduled</option>
                                <option value="underreview">Review</option>
                                <option value="completed">Completed</option>
                                <option value="notsuitable">Not Suitable</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
                    {[
                        { label: "Total", value: applications.length, color: "text-green-600" },
                        {
                            label: "Scheduled",
                            value: applications.filter((a) => a.status === "Interview Scheduled").length,
                            color: "text-blue-600",
                        },
                        {
                            label: "Review",
                            value: applications.filter((a) => a.status === "Under Review").length,
                            color: "text-yellow-600",
                        },
                        {
                            label: "Avg Match",
                            value:
                                applications.length > 0
                                    ? Math.round(
                                        applications.reduce((sum, a) => sum + a.matchPercentage, 0) /
                                        applications.length
                                    ) + "%"
                                    : "0%",
                            color: "text-green-600",
                        },
                    ].map((stat, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-lg p-2.5 sm:p-3 lg:p-4 border border-gray-200 hover:shadow-md transition-all duration-200 animate-scaleIn"
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            <div className="text-[10px] sm:text-xs text-gray-600 truncate">{stat.label}</div>
                            <div className={`text-base sm:text-lg lg:text-xl font-bold ${stat.color} truncate`}>
                                {stat.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Applications List */}
                <div className="space-y-2 sm:space-y-3">
                    {filteredApplications.length > 0 ? (
                        filteredApplications.map((app, idx) => (
                            <div
                                key={app.id}
                                className="animate-slideUp"
                                style={{ animationDelay: `${idx * 30}ms` }}
                            >
                                <div
                                    onClick={() => {
                                        setExpandedId(expandedId === app.id ? null : app.id);
                                        if (expandedId !== app.id) {
                                            getJobDetails(app.job_id);
                                        }
                                    }}
                                    className="bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-300 cursor-pointer group"
                                >
                                    {/* Card Header */}
                                    <div className="p-3 sm:p-4">
                                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start sm:items-center gap-2 mb-1 flex-col sm:flex-row">
                                                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                                        {app.jobposition}
                                                    </h3>
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border transition-all duration-200 ${app.statusColor} whitespace-nowrap`}
                                                    >
                                                        {app.status}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-3 text-xs text-gray-600 mt-1.5">
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
                                            <ChevronDown
                                                size={18}
                                                className={`text-gray-400 group-hover:text-green-600 transition-all duration-300 flex-shrink-0 ${expandedId === app.id ? "rotate-180" : ""
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedId === app.id && (
                                        <div className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white p-3 sm:p-4 lg:p-5 animate-expandDown">
                                            {loadingJobId === app.job_id ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <div className="text-center">
                                                        <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-2" />
                                                        <p className="text-xs text-gray-600">Loading job details...</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                                                    {/* Left Column */}
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">
                                                                About the Role
                                                            </h4>
                                                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-4">
                                                                {jobDetails[app.job_id]?.description?.about || app.description}
                                                            </p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                                            <div>
                                                                <h4 className="text-xs font-semibold text-gray-900 mb-1">
                                                                    CTC Range
                                                                </h4>
                                                                <p className="text-xs sm:text-sm text-green-600 font-medium">
                                                                    {jobDetails[app.job_id]?.ctc_range
                                                                        ? `${jobDetails[app.job_id].ctc_range} LPA`
                                                                        : app.salary}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-xs font-semibold text-gray-900 mb-1">
                                                                    Experience
                                                                </h4>
                                                                <p className="text-xs sm:text-sm text-gray-600">
                                                                    {jobDetails[app.job_id]?.experience_required
                                                                        ? `${jobDetails[app.job_id].experience_required} years`
                                                                        : "Not specified"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {jobDetails[app.job_id]?.key_skills && (
                                                            <div>
                                                                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">
                                                                    Key Skills
                                                                </h4>
                                                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                                    {jobDetails[app.job_id].key_skills.slice(0, 6).map((skill, i) => (
                                                                        <span
                                                                            key={i}
                                                                            className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-[10px] sm:text-xs border border-green-200"
                                                                        >
                                                                            {skill}
                                                                        </span>
                                                                    ))}
                                                                    {jobDetails[app.job_id].key_skills.length > 6 && (
                                                                        <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-[10px] sm:text-xs">
                                                                            +{jobDetails[app.job_id].key_skills.length - 6}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Right Column */}
                                                    <div className="space-y-3">
                                                        <div className="bg-white rounded-lg p-3 sm:p-4 border border-green-100">
                                                            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3">
                                                                Interview Status
                                                            </h4>
                                                            <div className="space-y-2.5">
                                                                <div>
                                                                    <p className="text-[10px] sm:text-xs text-gray-600 mb-0.5">Current Stage</p>
                                                                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                                                                        {app.currentStage}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] sm:text-xs text-gray-600 mb-0.5">Progress</p>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                                                            <div
                                                                                className="bg-green-600 h-1.5 rounded-full transition-all"
                                                                                style={{
                                                                                    width: `${(app.completedInterviews.length / Math.max(app.interviews_list.length, 1)) * 100}%`
                                                                                }}
                                                                            ></div>
                                                                        </div>
                                                                        <p className="text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">
                                                                            {app.completedInterviews.length}/{app.interviews_list.length}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] sm:text-xs text-gray-600 mb-0.5">Next Step</p>
                                                                    <p className="text-xs sm:text-sm font-medium text-green-600">
                                                                        {app.nextStep}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleViewFullDetails(app);
                                                                }}
                                                                disabled={!jobDetails[app.job_id]}
                                                                className="w-full bg-white hover:bg-green-50 text-green-600 text-xs font-medium py-2 px-2 rounded-lg border border-green-600 flex items-center justify-center gap-1.5 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <Briefcase size={14} />
                                                                <span className="hidden sm:inline">Full Details</span>
                                                                <span className="sm:hidden">Details</span>
                                                            </button>
                                                            <a
                                                                href={app.resumeUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 hover:shadow-md"
                                                            >
                                                                <FileText size={14} />
                                                                Resume
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-12 text-center animate-fadeIn">
                            <Search size={40} className="mx-auto text-gray-300 mb-3" />
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                                No applications found
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600">Try adjusting your filters</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Job Details Modal */}
            {showJobModal && selectedJob && (
                <div
                    className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn"
                    onClick={() => setShowJobModal(false)}
                >
                    <div
                        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-start justify-between z-10">
                            <div className="flex-1 min-w-0 pr-4">
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 break-words">
                                    {selectedJob.title}
                                </h2>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <Briefcase size={14} className="text-green-600 flex-shrink-0" />
                                        <span className="truncate">{selectedJob.companyName}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin size={14} className="text-green-600 flex-shrink-0" />
                                        <span className="truncate">{selectedJob.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <DollarSign size={14} className="text-green-600 flex-shrink-0" />
                                        <span>{selectedJob.ctc_range} LPA</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowJobModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                            >
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                            {/* About */}
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                                    <Briefcase size={18} className="text-green-600" />
                                    About the Role
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                    {selectedJob.description.about}
                                </p>
                            </div>

                            {/* Skills */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                                        <Award size={18} className="text-green-600" />
                                        Key Skills
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                        {selectedJob.key_skills.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="px-2 sm:px-3 py-1 sm:py-0.5 bg-green-50 text-green-700 rounded-lg text-xs sm:text-sm font-medium border border-green-200"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {selectedJob.good_to_have_skills && selectedJob.good_to_have_skills.length > 0 && (
                                    <div>
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                                            Good to Have
                                        </h3>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            {selectedJob.good_to_have_skills.map((skill, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 sm:px-3 py-1 sm:py-0.5 bg-blue-50 text-blue-700 rounded-lg text-xs sm:text-sm border border-blue-200"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Key Responsibilities */}
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                                    Key Responsibilities
                                </h3>
                                <ul className="space-y-2">
                                    {selectedJob.description.key_responsibilities.map((resp, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                                            <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></span>
                                            <span>{resp}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Qualifications */}
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                                    Qualifications
                                </h3>
                                <ul className="space-y-2">
                                    {selectedJob.description.qualifications.map((qual, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></span>
                                            <span>{qual}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* What We Offer */}
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                                    What We Offer
                                </h3>
                                <ul className="space-y-2">
                                    {selectedJob.description.what_we_offer.map((offer, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                            <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                                            <span>{offer}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Application Info */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                                    Your Application Status
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <p className="text-gray-600">Applied On</p>
                                        <p className="font-medium text-gray-900">{selectedJob.application.appliedDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Status</p>
                                        <span className={`inline-block px-2 py-0.5 rounded-full font-medium ${selectedJob.application.statusColor}`}>
                                            {selectedJob.application.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Match Score</p>
                                        <p className="font-medium text-green-600">{selectedJob.application.matchPercentage}%</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Next Step</p>
                                        <p className="font-medium text-gray-900">{selectedJob.application.nextStep}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
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
        </div >
    );
};

export default CandidateApplications;