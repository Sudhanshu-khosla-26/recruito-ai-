"use client"

import React, { useEffect, useState } from "react";
import { ChevronDown, FileText, Calendar, MapPin, Search, X, Loader2, Briefcase, DollarSign, Users, Award } from "lucide-react";
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

            // Get interview statuses
            const completedInterviews = interviews.filter(i => i.status === "completed");
            const scheduledInterviews = interviews.filter(i => i.status === "scheduled");
            const pendingInterviews = interviews.filter(i => !i.status || i.status === "pending");

            // Determine current interview stage
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

    useEffect(() => {
        getApplications();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-white mt-3 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-green-200 rounded-full animate-ping opacity-75"></div>
                        <div className="relative border-4 border-green-600 border-t-transparent rounded-full w-16 h-16 animate-spin"></div>
                    </div>
                    <p className="text-gray-600 font-medium">Loading applications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white mt-3">
            {/* Header */}
            <div className="max-w-5xl mx-auto px-4 py-3 md:px-0">
                <h1 className="text-2xl md:text-3xl font-bold text-green-600">My Applications</h1>
                <p className="text-gray-500 text-xs md:text-sm mt-0.5">Track and manage your job applications</p>
            </div>

            {/* Main Content */}
            <div className="w-full px-4 py-4 md:px-4">
                {/* Filters */}
                <div className="rounded-lg p-3 md:p-4 md:px-0 mb-4 animate-fadeIn">
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
                        {
                            label: "Scheduled",
                            value: applications.filter((a) => a.status === "Interview Scheduled").length,
                            color: "text-blue-600",
                        },
                        {
                            label: "Under Review",
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
                            className="bg-white rounded-lg p-2.5 md:p-3 border border-gray-200 hover:shadow-md transition-all duration-200 animate-scaleIn"
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
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
                                    onClick={() => {
                                        setExpandedId(expandedId === app.id ? null : app.id);
                                        getJobDetails(app.job_id);
                                    }}
                                    className="bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-300 cursor-pointer group"
                                >
                                    {/* Card Header */}
                                    <div className="p-3 md:p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate">
                                                        {app.jobposition}
                                                    </h3>
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-all duration-200 ${app.statusColor}`}
                                                    >
                                                        {app.status}
                                                    </span>
                                                </div>
                                                {/* <p className="text-xs md:text-sm text-gray-600 mb-1.5">{app.company}</p> */}
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
                                            <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                                {/* <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-50 to-green-100 rounded-full border border-green-200 group-hover:shadow-md transition-all duration-300"> */}
                                                {/* <div className="text-center">
                                                        <span className="text-xs md:text-sm font-bold text-green-600">
                                                            {app.matchPercentage}
                                                        </span>
                                                        <span className="text-xs text-green-600">%</span>
                                                    </div> */}
                                                {/* </div> */}
                                                <ChevronDown
                                                    size={18}
                                                    className={`text-gray-400 group-hover:text-green-600 transition-all duration-300 ${expandedId === app.id ? "rotate-180" : ""
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedId === app.id && (
                                        <div className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white p-3 md:p-4 animate-expandDown">
                                            {loadingJobId === app.job_id ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <div className="text-center">
                                                        <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-2" />
                                                        <p className="text-xs text-gray-600">Loading job details...</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                                    {/* Left Column */}
                                                    <div className="space-y-3">
                                                        <div>
                                                            <h4 className="text-xs font-semibold text-gray-900 mb-1">
                                                                About the Role
                                                            </h4>
                                                            <p className="text-xs text-gray-600 line-clamp-3">
                                                                {jobDetails[app.job_id]?.description?.about || app.description}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <div>
                                                                <h4 className="text-xs font-semibold text-gray-900 mb-0.5">
                                                                    CTC Range
                                                                </h4>
                                                                <p className="text-xs text-green-600 font-medium">
                                                                    {jobDetails[app.job_id]?.ctc_range
                                                                        ? `${jobDetails[app.job_id].ctc_range} LPA`
                                                                        : app.salary}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-xs font-semibold text-gray-900 mb-0.5">
                                                                    Experience
                                                                </h4>
                                                                <p className="text-xs text-gray-600">
                                                                    {jobDetails[app.job_id]?.experience_required
                                                                        ? `${jobDetails[app.job_id].experience_required} years`
                                                                        : "Not specified"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {jobDetails[app.job_id]?.key_skills && (
                                                            <div>
                                                                <h4 className="text-xs font-semibold text-gray-900 mb-1">
                                                                    Key Skills
                                                                </h4>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {jobDetails[app.job_id].key_skills.slice(0, 4).map((skill, i) => (
                                                                        <span
                                                                            key={i}
                                                                            className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs border border-green-200"
                                                                        >
                                                                            {skill}
                                                                        </span>
                                                                    ))}
                                                                    {jobDetails[app.job_id].key_skills.length > 4 && (
                                                                        <span className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full text-xs">
                                                                            +{jobDetails[app.job_id].key_skills.length - 4} more
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Right Column */}
                                                    <div className="space-y-2">
                                                        <div className="bg-white rounded-lg p-2.5 md:p-3 border border-green-100">
                                                            <h4 className="text-xs font-semibold text-gray-900 mb-2">
                                                                Interview Status
                                                            </h4>
                                                            <div className="space-y-2">
                                                                <div>
                                                                    <p className="text-xs text-gray-600">Current Stage</p>
                                                                    <p className="text-xs font-medium text-gray-900">
                                                                        {app.currentStage}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-gray-600">Progress</p>
                                                                    <p className="text-xs font-medium text-gray-900">
                                                                        {app.completedInterviews.length} / {app.interviews_list.length} completed
                                                                    </p>
                                                                </div>
                                                                {app.scheduledInterviews.length > 0 && (
                                                                    <div>
                                                                        <p className="text-xs text-gray-600">Scheduled</p>
                                                                        {/* <p className="text-xs font-medium text-blue-600">
                                                                            {new Date(app?.scheduledInterviews[0]?.ended_at).toLocaleDateString()}
                                                                        </p> */}
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <p className="text-xs text-gray-600">Next Step</p>
                                                                    <p className="text-xs font-medium text-green-600">
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
                                                                className="w-full bg-white hover:bg-green-50 text-green-600 text-xs font-medium py-1.5 px-2 rounded-lg border border-green-600 flex items-center justify-center gap-1.5 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <Briefcase size={14} />
                                                                Full Details
                                                            </button>
                                                            <a
                                                                href={app.resumeUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 hover:shadow-md"
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
                        <div className="bg-white rounded-lg border border-gray-200 p-8 md:p-12 text-center animate-fadeIn">
                            <Search size={40} className="mx-auto text-gray-300 mb-3" />
                            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">
                                No applications found
                            </h3>
                            <p className="text-xs md:text-sm text-gray-600">Try adjusting your filters</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Job Details Modal */}
            {
                showJobModal && selectedJob && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
                        onClick={() => setShowJobModal(false)}
                    >
                        <div
                            className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 md:p-6 flex items-start justify-between">
                                <div className="flex-1">
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                                        {selectedJob.title}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Briefcase size={16} className="text-green-600" />
                                            <span>{selectedJob.companyName}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin size={16} className="text-green-600" />
                                            <span>{selectedJob.location}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <DollarSign size={16} className="text-green-600" />
                                            <span>{selectedJob.ctc_range} LPA</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowJobModal(false)}
                                    className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={20} className="text-gray-600" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-4 md:p-6 space-y-6">
                                {/* About */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <Briefcase size={18} className="text-green-600" />
                                        About the Role
                                    </h3>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {selectedJob.description.about}
                                    </p>
                                </div>

                                {/* Skills */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <Award size={18} className="text-green-600" />
                                            Key Skills
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedJob.key_skills.map((skill, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {selectedJob.good_to_have_skills && selectedJob.good_to_have_skills.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                Good to Have
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedJob.good_to_have_skills.map((skill, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200"
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
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                        Key Responsibilities
                                    </h3>
                                    <ul className="space-y-2">
                                        {selectedJob.description.key_responsibilities.map((resp, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                                                <span>{resp}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Qualifications */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                        Qualifications
                                    </h3>
                                    <ul className="space-y-2">
                                        {selectedJob.description.qualifications.map((qual, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                                                <span>{qual}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* What We Offer */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
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