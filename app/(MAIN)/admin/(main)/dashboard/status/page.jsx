"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, User, Mail, Phone, MapPin, Calendar, FileText, Award, CheckCircle, Clock, Circle, Loader2 } from "lucide-react";

export default function InterviewStatusPage() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [interviewDetails, setInterviewDetails] = useState({});
  const [loadingInterview, setLoadingInterview] = useState({});

  const stages = [
    { id: "wai", name: "AI Interview", label: "Interview with AI" },
    { id: "whr", name: "HR Interview", label: "Interview with HR" },
    { id: "whm", name: "HM Interview", label: "Interview with HM" }
  ];

  const getCandidates = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/Applications/get-all-candidates?company_id=uRTTg5rRpYWsutJQ18v6`
      );

      if (!res.ok) throw new Error("Failed to fetch candidates");

      const data = await res.json();

      if (data && data.applications) {
        const formattedCandidates = data.applications.map((app) => ({
          id: app.id,
          name: app.applicant_name,
          email: app.applicant_email,
          phone: app.applicant_phone,
          position: app.jobposition,
          location: app.location,
          score: app.match_percentage,
          appliedDate: new Date(app.applied_at._seconds * 1000)
            .toISOString()
            .split("T")[0],
          status: app.status,
          resume_url: app.resume_url,
          interviews_list: app.interviews_list || [],
          analysis: app.analyze_parameter,
        }));
        setCandidates(formattedCandidates);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setError("Failed to load candidates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getInterviewDetailsById = async (interviewId) => {
    if (!interviewId || interviewDetails[interviewId]) return;

    try {
      setLoadingInterview(prev => ({ ...prev, [interviewId]: true }));
      const res = await fetch(`/api/Interviews/${interviewId}`);

      if (!res.ok) throw new Error("Failed to fetch interview details");

      const data = await res.json();

      if (data && data.interview) {
        setInterviewDetails(prev => ({
          ...prev,
          [interviewId]: data.interview
        }));
      }
    } catch (err) {
      console.error(`Error fetching interview ${interviewId}:`, err);
    } finally {
      setLoadingInterview(prev => ({ ...prev, [interviewId]: false }));
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const seconds = timestamp._seconds || timestamp;
    const date = new Date(seconds * 1000);
    return date.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const normalizeScore = (score) => {
    if (!score) return 0;
    if (score <= 10) return score;
    return (score / 10).toFixed(1);
  };

  useEffect(() => {
    getCandidates();
  }, []);

  useEffect(() => {
    if (selectedCandidate) {
      selectedCandidate.interviews_list.forEach(interview => {
        if (interview.id) {
          getInterviewDetailsById(interview.id);
        }
      });
    }
  }, [selectedCandidate]);

  const getInterviewFromList = (candidate, stageId) => {
    return candidate.interviews_list.find(
      (int) => int.mode?.toLowerCase() === stageId
    );
  };

  const getStageStatus = (candidate, stageId) => {
    const interview = getInterviewFromList(candidate, stageId);
    if (!interview) return "pending";
    return interview.status;
  };

  const getCompletedStagesCount = (candidate) => {
    return candidate.interviews_list.filter(
      (int) => int.status === "completed"
    ).length;
  };

  const handleCandidateClick = (candidate) => {
    setSelectedCandidate(candidate);
    const completedCount = getCompletedStagesCount(candidate);
    setCurrentStage(Math.min(completedCount, stages.length - 1));
  };

  const handleStageNavigation = (direction) => {
    if (direction === "next" && currentStage < stages.length - 1) {
      setCurrentStage(currentStage + 1);
    } else if (direction === "prev" && currentStage > 0) {
      setCurrentStage(currentStage - 1);
    }
  };

  const getScoreColor = (score) => {
    const normalizedScore = normalizeScore(score);
    if (normalizedScore >= 8) return "bg-green-500 text-white";
    if (normalizedScore >= 6) return "bg-blue-500 text-white";
    if (normalizedScore >= 4) return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  const getScoreBgColor = (score) => {
    const normalizedScore = normalizeScore(score);
    if (normalizedScore >= 8) return "bg-green-50 border-green-200";
    if (normalizedScore >= 6) return "bg-blue-50 border-blue-200";
    if (normalizedScore >= 4) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getProgressPercentage = (candidate) => {
    const total = stages.length;
    const completed = getCompletedStagesCount(candidate);
    return (completed / total) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading candidates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
          <button
            onClick={getCandidates}
            className="ml-3 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!selectedCandidate) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Interview Status</h1>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-semibold text-gray-700">All Candidates ({candidates.length})</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                    <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Position</th>
                    <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Location</th>
                    <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                    <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Applied</th>
                    <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {candidates.map((candidate) => {
                    const progress = getProgressPercentage(candidate);
                    const completedStages = getCompletedStagesCount(candidate);

                    return (
                      <tr key={candidate.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-orange-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{candidate.name}</div>
                              <div className="text-xs text-gray-500 truncate md:hidden">{candidate.position}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-900 hidden md:table-cell">{candidate.position}</td>
                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-500 hidden lg:table-cell">{candidate.location}</td>
                        <td className="px-3 sm:px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getScoreColor(candidate.score / 10)}`}>
                            {(candidate.score / 10).toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px] sm:min-w-[80px]">
                              <div
                                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600 whitespace-nowrap">{completedStages}/{stages.length}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-500 hidden sm:table-cell">{candidate.appliedDate}</td>
                        <td className="px-3 sm:px-4 py-3">
                          <button
                            onClick={() => handleCandidateClick(candidate)}
                            className="text-orange-600 hover:text-orange-700 text-xs sm:text-sm font-medium whitespace-nowrap"
                          >
                            View →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStageData = stages[currentStage];
  const interview = getInterviewFromList(selectedCandidate, currentStageData.id);
  const fullInterviewDetails = interview?.id ? interviewDetails[interview.id] : null;
  const isLoadingDetails = interview?.id ? loadingInterview[interview?.id] : false;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => setSelectedCandidate(null)}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-800 text-sm"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to List
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-3 w-full sm:w-auto">
              <div className="h-12 w-12 sm:h-14 sm:w-14 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 sm:h-7 sm:w-7 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 truncate">{selectedCandidate.name}</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">{selectedCandidate.position}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
                  <span className="flex items-center gap-1 truncate">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">{selectedCandidate.email}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    {selectedCandidate.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    {selectedCandidate.location}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto flex-shrink-0">
              <div className={`inline-block px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold ${getScoreColor(selectedCandidate.score / 10)}`}>
                Match: {(selectedCandidate.score / 10).toFixed(0)}%
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">Applied: {selectedCandidate.appliedDate}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Interview Progress</h2>

          <div className="relative px-2 sm:px-0">
            <div className="absolute left-[20px] right-[20px] sm:left-[25px] sm:right-[25px] top-[16px] sm:top-[20px] h-0.5 sm:h-1 bg-gray-200">
              <div
                className="h-full bg-orange-500 transition-all duration-500"
                style={{ width: `${getProgressPercentage(selectedCandidate)}%` }}
              ></div>
            </div>

            <div className="relative flex justify-between">
              {stages.map((stage, index) => {
                const status = getStageStatus(selectedCandidate, stage.id);
                const isActive = index === currentStage;

                return (
                  <div key={stage.id} className="flex flex-col items-center flex-1">
                    <button
                      onClick={() => setCurrentStage(index)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all z-10 ${status === "completed"
                        ? "bg-green-500 text-white"
                        : status === "scheduled"
                          ? "bg-blue-500 text-white"
                          : isActive
                            ? "bg-orange-500 text-white"
                            : "bg-gray-300 text-gray-600"
                        } ${isActive ? "ring-2 sm:ring-4 ring-orange-200" : ""}`}
                    >
                      {status === "completed" ? (
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : status === "scheduled" ? (
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <Circle className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </button>
                    <span className={`mt-2 text-[10px] sm:text-xs font-medium text-center ${isActive ? "text-orange-600" : "text-gray-600"}`}>
                      {stage.name}
                    </span>
                    {status !== "pending" && (
                      <span className={`mt-1 text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                        }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800">{currentStageData.label}</h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleStageNavigation("prev")}
                disabled={currentStage === 0}
                className="flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <button
                onClick={() => handleStageNavigation("next")}
                disabled={currentStage === stages.length - 1}
                className="flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>

          {isLoadingDetails ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 text-orange-500 mx-auto mb-3 animate-spin" />
              <p className="text-sm text-gray-600">Loading interview details...</p>
            </div>
          ) : interview ? (
            <div className="space-y-4">
              {/* Status and Basic Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="border border-gray-200 rounded-lg p-3 bg-gradient-to-br from-white to-gray-50">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs sm:text-sm font-medium">Status</span>
                  </div>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${interview.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : interview.status === "scheduled"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                    }`}>
                    {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                  </span>
                </div>

                {(fullInterviewDetails?.overall_score >= 0 || interview?.overall_score >= 0) && (
                  <div className={`border rounded-lg p-3  ${getScoreBgColor(fullInterviewDetails?.overall_score || interview?.overall_score)}`}>

                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <Award className="h-4 w-4" />
                      <span className="text-xs sm:text-sm font-medium">Overall Score</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                        {normalizeScore(fullInterviewDetails?.overall_score || interview?.overall_score)}
                      </p>
                      <span className="text-sm text-gray-600">/10</span>
                    </div>
                  </div>
                )}

                {(fullInterviewDetails?.duration_minutes || interview?.duration_minutes) && (
                  <div className="border border-gray-200 rounded-lg p-3 bg-gradient-to-br from-white to-gray-50">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs sm:text-sm font-medium">Duration</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      {fullInterviewDetails?.duration_minutes || interview.duration_minutes}
                    </p>
                  </div>
                )}
              </div>

              {/* Time Details */}
              {(fullInterviewDetails?.scheduled_at || fullInterviewDetails?.start_time ||
                fullInterviewDetails?.started_at || fullInterviewDetails?.ended_at) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(fullInterviewDetails?.scheduled_at || fullInterviewDetails?.start_time) && (
                      <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                        <div className="flex items-center gap-2 text-blue-700 mb-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-xs sm:text-sm font-medium">Scheduled Time</span>
                        </div>
                        <p className="text-xs sm:text-sm text-blue-900 font-medium">
                          {formatDate(fullInterviewDetails?.scheduled_at || fullInterviewDetails?.start_time)}
                        </p>
                      </div>
                    )}

                    {fullInterviewDetails?.started_at && (
                      <div className="border border-green-200 rounded-lg p-3 bg-green-50">
                        <div className="flex items-center gap-2 text-green-700 mb-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-xs sm:text-sm font-medium">Started At</span>
                        </div>
                        <p className="text-xs sm:text-sm text-green-900 font-medium">
                          {formatDate(fullInterviewDetails.started_at)}
                        </p>
                      </div>
                    )}

                    {fullInterviewDetails?.ended_at && (
                      <div className="border border-purple-200 rounded-lg p-3 bg-purple-50">
                        <div className="flex items-center gap-2 text-purple-700 mb-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-xs sm:text-sm font-medium">Ended At</span>
                        </div>
                        <p className="text-xs sm:text-sm text-purple-900 font-medium">
                          {formatDate(fullInterviewDetails.ended_at)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

              {/* Interview Types */}
              {(fullInterviewDetails?.interview_type && fullInterviewDetails.interview_type.length > 0) && (
                <div className="border border-gray-200 rounded-lg p-3 bg-gradient-to-br from-white to-gray-50">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Interview Types
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {fullInterviewDetails.interview_type.map((type, index) => (
                      <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* HR and Meeting Details */}
              {(fullInterviewDetails?.hr_email || fullInterviewDetails?.meeting_link) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {fullInterviewDetails?.hr_email && (
                    <div className="border border-gray-200 rounded-lg p-3 bg-gradient-to-br from-white to-gray-50">
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <User className="h-4 w-4" />
                        <span className="text-xs sm:text-sm font-medium">HR Email</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-800 font-medium truncate">
                        {fullInterviewDetails.hr_email}
                      </p>
                    </div>
                  )}

                  {fullInterviewDetails?.meeting_link && (
                    <div className="border border-gray-200 rounded-lg p-3 bg-gradient-to-br from-white to-gray-50">
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-xs sm:text-sm font-medium">Meeting Link</span>
                      </div>
                      <a href={fullInterviewDetails.meeting_link} target="_blank" rel="noopener noreferrer"
                        className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 underline truncate block">
                        Join Meeting
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Feedback and Notes */}
              {(fullInterviewDetails?.feedback || fullInterviewDetails?.notes) && (
                <div className="space-y-3">
                  {fullInterviewDetails?.feedback && (
                    <div className="border border-gray-200 rounded-lg p-3 bg-gradient-to-br from-white to-gray-50">
                      <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Feedback
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        {fullInterviewDetails.feedback}
                      </p>
                    </div>
                  )}

                  {fullInterviewDetails?.notes && (
                    <div className="border border-gray-200 rounded-lg p-3 bg-gradient-to-br from-white to-gray-50">
                      <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Notes
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        {fullInterviewDetails.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Scores Breakdown */}
              {fullInterviewDetails?.scores && Object.keys(fullInterviewDetails.scores).length > 0 && (
                <div className="border border-gray-200 rounded-lg p-3 bg-gradient-to-br from-white to-gray-50">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Score Breakdown
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(fullInterviewDetails.scores).map(([key, value]) => (
                      <div key={key} className={`border rounded-lg p-3 ${getScoreBgColor(value)}`}>
                        <p className="text-xs text-gray-600 mb-1 capitalize">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-gray-800">
                            {normalizeScore(value)}
                          </span>
                          <span className="text-xs text-gray-600">/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resume Link */}
              {selectedCandidate.resume_url && (
                <div className="border border-gray-200 rounded-lg p-3 bg-gradient-to-br from-white to-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Resume</span>
                    </div>
                    <a
                      href={selectedCandidate.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-orange-600 transition-colors">
                      View Resume
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Circle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No interview scheduled for this stage yet</p>
            </div>
          )}
        </div>
      </div>
    </div >
  );
}