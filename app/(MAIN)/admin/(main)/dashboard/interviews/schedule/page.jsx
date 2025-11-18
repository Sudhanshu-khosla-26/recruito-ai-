"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

const interviewOptions = [
  "Interview with AI",
  "Interview with HR",
  "Interview with HM",
  "Additional Round",
  "Hold",
  "Skip",
  "Not Suitable",
  "Completed",
];

const autoSaveOptions = ["Skip", "Hold", "Not Suitable", "Completed"];

export default function CandidateTable() {
  const router = useRouter();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interviewSelections, setInterviewSelections] = useState({});
  const [selectedJD, setSelectedJD] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [minScore, setMinScore] = useState("");
  const [maxScore, setMaxScore] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [candidatesPerPage, setCandidatesPerPage] = useState(20);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  const getCandidates = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/Applications/get-all-candidates?company_id=uRTTg5rRpYWsutJQ18v6`
      );

      if (res.data && res.data.applications) {
        const formattedCandidates = res.data.applications.map((app) => ({
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

  useEffect(() => {
    getCandidates();
  }, []);

  const handleDropdownChange = (id, value) => {
    if (selectedCandidates.length > 1) {
      const updates = {};
      selectedCandidates.forEach((candId) => {
        updates[candId] = value;
      });
      setInterviewSelections((prev) => ({ ...prev, ...updates }));
    } else {
      setInterviewSelections((prev) => ({ ...prev, [id]: value }));
    }
  };

  const getNextAvailableInterview = (candidate) => {
    const interviews = candidate.interviews_list || [];
    const completedStages = interviews
      .filter((int) => int.status === "completed")
      .map((int) => int.mode?.toLowerCase());

    const stages = ["wai", "whr", "whm"]; // Changed to lowercase
    const nextStage = stages.find((stage) => !completedStages.includes(stage));

    if (!nextStage) return "Additional Round";
    if (nextStage === "wai") return "Interview with AI";
    if (nextStage === "whr") return "Interview with HR";
    if (nextStage === "whm") return "Interview with HM";
  };

  const canScheduleInterview = (candidate, option) => {
    const interviews = candidate.interviews_list || [];
    const completedStages = interviews
      .filter((int) => int.status === "completed")
      .map((int) => int.mode?.toLowerCase());

    const scheduledStages = interviews
      .filter((int) => int.status === "scheduled")
      .map((int) => int.mode?.toLowerCase());

    const optionMap = {
      "Interview with AI": "wai",
      "Interview with HR": "whr",
      "Interview with HM": "whm",
    };

    const mappedOption = optionMap[option]?.toLowerCase();

    // Only check if already scheduled or completed, remove sequential restrictions
    if (
      scheduledStages.includes(mappedOption) ||
      completedStages.includes(mappedOption)
    ) {
      return false;
    }

    return true;
  };

  const getInterviewStatus = (candidate, option) => {
    const interviews = candidate.interviews_list || [];
    const optionMap = {
      "Interview with AI": "wai", // Changed to lowercase
      "Interview with HR": "whr", // Changed to lowercase
      "Interview with HM": "whm", // Changed to lowercase
    };

    const mappedOption = optionMap[option]?.toLowerCase();
    const interview = interviews.find(
      (int) => int.mode?.toLowerCase() === mappedOption,
    );

    return interview?.status;
  };

  const isInterviewDisabled = (candidate, option) => {
    const interviews = candidate.interviews_list || [];
    const scheduledOrCompleted = interviews
      .filter((int) => int.status === "scheduled" || int.status === "completed")
      .map((int) => int.mode);

    const optionMap = {
      "Interview with AI": "Wai",
      "Interview with HR": "Whr",
      "Interview with HM": "Whm",
    };

    return scheduledOrCompleted.includes(optionMap[option]);
  };

  const handleScheduleClick = async (c) => {
    const id = c.id;
    const jd = c.position;
    const selectedIds = selectedCandidates.length > 1 ? selectedCandidates : [id];

    const firstValue = interviewSelections[selectedIds[0]];

    // Handle auto-save options (Skip, Hold, Not Suitable, Completed)
    if (autoSaveOptions.includes(firstValue)) {
      try {
        // Update status for all selected candidates
        await Promise.all(
          selectedIds.map(candId =>
            updateApplicationStatus(candId, firstValue)
          )
        );

        // Refresh candidates list after update
        await getCandidates();

        // Clear selections
        setInterviewSelections({});
        setSelectedCandidates([]);

        // Optional: Show success message
        toast.success(`Status updated to "${firstValue}" successfully`);
      } catch (error) {
        toast.error("Failed to update status. Please try again.");
      }
      return;
    }

    // Handle interview scheduling options
    switch (firstValue) {
      case "Interview with AI":
        router.push("/admin/dashboard/interviews/ai" + `?jd=${jd}&candidate_id=${id}`);
        break;
      case "Interview with HR":
        router.push("/admin/dashboard/interviews/manager" + `?jd=${jd}&candidate_id=${id}`);
        break;
      case "Interview with HM":
      case "Additional Round":
        router.push("/admin/dashboard/interviews/manager" + `?jd=${jd}&candidate_id=${id}`);
        break;
      default:
        router.push("/admin/dashboard/status");
        break;
    }
  };

  const handleSelectCandidate = (id) => {
    setSelectedCandidates((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedCandidates.length === filteredCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(filteredCandidates.map((c) => c.id));
    }
  };

  const getScoreColor = (score) => {
    if (score >= 9) return "bg-green-600 text-white";
    if (score >= 8) return "bg-green-300 text-black";
    if (score >= 7) return "bg-yellow-300 text-black";
    return "bg-red-500 text-white";
  };

  const resetFilters = () => {
    setSelectedJD("");
    setSelectedLocation("");
    setMinScore("");
    setMaxScore("");
    setFromDate("");
    setToDate("");
    setSearchTerm("");
    setSortOrder(null);
    setCurrentPage(1);
  };


  const updateApplicationStatus = async (applicationId, status) => {
    try {
      const res = await axios.patch(`/api/Applications/${applicationId}`, {
        status: status
      });
      return res.data;
    } catch (err) {
      console.error("Error updating application:", err);
      throw err;
    }
  };




  let filteredCandidates = candidates.filter((c) => {
    const jdMatch = selectedJD ? c.position === selectedJD : true;
    const locMatch = selectedLocation ? c.location === selectedLocation : true;
    const scoreMatch =
      (minScore ? c.score >= Number(minScore) : true) &&
      (maxScore ? c.score <= Number(maxScore) : true);
    const fromMatch = fromDate
      ? new Date(c.appliedDate) >= new Date(fromDate)
      : true;
    const toMatch = toDate ? new Date(c.appliedDate) <= new Date(toDate) : true;
    const searchMatch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = selectedStatus ? c.status === selectedStatus : true;
    return (
      jdMatch && locMatch && scoreMatch && fromMatch && toMatch && searchMatch && statusMatch
    );
  });

  if (sortOrder) {
    filteredCandidates = [...filteredCandidates].sort((a, b) =>
      sortOrder === "asc" ? a.score - b.score : b.score - a.score,
    );
  }

  const indexOfLast = currentPage * candidatesPerPage;
  const indexOfFirst = indexOfLast - candidatesPerPage;
  const currentCandidates = filteredCandidates.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);

  if (loading) {
    return (
      <div className="min-h-screen  p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen  p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
          <button
            onClick={getCandidates}
            className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 p-0 text-xs">
      {/* Filters Card */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* JD Filter */}
          <select
            value={selectedJD}
            onChange={(e) => setSelectedJD(e.target.value)}
            className="border rounded px-2 py-1 text-xs shadow-sm"
          >
            <option value="">Select JD</option>
            {[...new Set(candidates.map((c) => c.position))].map((pos, idx) => (
              <option
                key={idx}
                value={pos}
              >
                {pos}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border rounded px-2 py-1 text-xs shadow-sm"
          >
            <option value="">All Status</option>
            <option value="Applied">Applied</option>
            <option value="Hold">Hold</option>
            <option value="Skip">Skip</option>
            <option value="Not Suitable">Not Suitable</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Location Filter */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="border rounded px-2 py-1 text-xs shadow-sm"
          >
            <option value="">All Locations</option>
            {[...new Set(candidates.map((c) => c.location))].map((loc, idx) => (
              <option
                key={idx}
                value={loc}
              >
                {loc}
              </option>
            ))}
          </select>

          {/* Score Filter */}
          <div className="flex items-center gap-2">
            <label className="text-gray-600 text-xs">Score:</label>
            <input
              type="number"
              placeholder="Min"
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
              className="border rounded px-2 py-1 w-16 text-xs shadow-sm"
            />
            <input
              type="number"
              placeholder="Max"
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
              className="border rounded px-2 py-1 w-16 text-xs shadow-sm"
            />
          </div>

          {/* Date Filters */}
          <div className="flex items-center gap-2">
            <label className="text-gray-600 text-xs">From:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border rounded px-2 py-1 text-xs shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-gray-600 text-xs">To:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border rounded px-2 py-1 text-xs shadow-sm"
            />
          </div>

          {/* Reset Button */}
          <button
            onClick={resetFilters}
            className="ml-2 px-3 py-1 border rounded text-xs bg-gray-200 hover:bg-gray-300"
          >
            Reset Filters
          </button>

          {/* Candidates per page */}
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-gray-600 text-xs">Show:</label>
            <select
              value={candidatesPerPage}
              onChange={(e) => {
                setCandidatesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded px-2 py-1 text-xs shadow-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table Card */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-orange-500 font-semibold text-xs">
            All Candidates ({filteredCandidates.length})
          </h2>
          {/* Search */}
          <input
            type="text"
            placeholder="Search Candidate"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded px-2 py-1 text-xs shadow-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="border-collapse text-xs text-left w-full">
            <thead>
              <tr className="text-gray-700 font-semibold">
                <th className="pb-2 pr-4">
                  <input
                    type="checkbox"
                    checked={
                      selectedCandidates.length === filteredCandidates.length &&
                      filteredCandidates.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Email</th>
                <th className="pb-2 pr-4">Phone</th>
                <th className="pb-2 pr-4">Position (JD)</th>
                <th className="pb-2 pr-4">Location</th>
                <th
                  className="pb-2 pr-4 cursor-pointer"
                  onClick={() =>
                    setSortOrder((prev) =>
                      prev === "asc" ? "desc" : prev === "desc" ? null : "asc",
                    )
                  }
                >
                  Score{" "}
                  {sortOrder === "asc" ? "↑" : sortOrder === "desc" ? "↓" : ""}
                </th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Progress</th>
                <th className="pb-2 pr-4">Applied Date</th>
                <th className="pb-2 w-48">Interview</th>
              </tr>
            </thead>
            <tbody>
              {currentCandidates.length > 0 ? (
                currentCandidates.map((c) => (
                  <tr
                    key={c.id}
                    className={`border-t hover:bg-gray-100 ${selectedCandidates.includes(c.id) ? "bg-blue-50" : ""
                      }`}
                  >
                    <td className="py-2 pr-4">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(c.id)}
                        onChange={() => handleSelectCandidate(c.id)}
                      />
                    </td>
                    <td className="py-2 pr-4 font-medium">
                      {c.name}

                    </td>
                    <td className="py-2 pr-4 text-blue-600">{c.email}</td>
                    <td className="py-2 pr-4">{c.phone}</td>
                    <td className="py-2 pr-4">{c.position}</td>
                    <td className="py-2 pr-4">{c.location}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${getScoreColor(
                          c.score / 10,
                        )}`}
                      >
                        {c.score / 10}%
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      {c.status && c.status !== "Applied" ? (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${c.status === "Hold" ? "bg-yellow-100 text-yellow-800 border border-yellow-300" :
                          c.status === "Skip" ? "bg-gray-100 text-gray-800 border border-gray-300" :
                            c.status === "Not Suitable" ? "bg-red-100 text-red-800 border border-red-300" :
                              c.status === "Completed" ? "bg-green-100 text-green-800 border border-green-300" :
                                "bg-blue-100 text-blue-800 border border-blue-300"
                          }`}>
                          {c.status}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[10px]">Active</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex gap-1">
                        {["Wai", "Whr", "Whm"].map((stage, idx) => {
                          const interview = (c.interviews_list || []).find(
                            (int) => int.mode === stage,
                          );
                          const status = interview?.status;
                          // Update this line to check for Skip status from application
                          const isSkipped = c.status === "Skip";

                          return (
                            <div
                              key={idx}
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium ${isSkipped
                                ? "bg-gray-300 text-gray-600 line-through"
                                : status === "completed"
                                  ? "bg-green-500 text-white"
                                  : status === "scheduled"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 text-gray-500"
                                }`}
                              title={`${stage.toUpperCase()}: ${isSkipped ? "Application Skipped" : status || "pending"
                                }`}
                            >
                              {isSkipped
                                ? "✕"
                                : status === "completed"
                                  ? "✓"
                                  : status === "scheduled"
                                    ? "⏰"
                                    : idx + 1}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-2 pr-4">{c.appliedDate}</td>
                    <td className="py-2 w-48">
                      <div className="flex items-center gap-1">
                        <select
                          value={interviewSelections[c.id] || ""}
                          onChange={(e) =>
                            handleDropdownChange(c.id, e.target.value)
                          }

                          className={`border rounded px-1 py-0.5 text-[10px] flex-shrink-0 shadow-sm 
                            
                            `}
                        >
                          <option value="">Select</option>
                          {interviewOptions.map((opt, i) => {
                            const canSchedule = canScheduleInterview(c, opt);
                            const status = getInterviewStatus(c, opt);
                            const isNext = opt === getNextAvailableInterview(c);
                            const disabled =
                              !canSchedule && !autoSaveOptions.includes(opt);

                            return (
                              <option
                                key={i}
                                value={opt}
                                disabled={disabled}
                              >
                                {opt}
                                {status === "completed" ? " ✓" : ""}
                                {status === "scheduled" ? " (Scheduled)" : ""}
                              </option>
                            );
                          })}
                        </select>

                        <div className="w-20">
                          {interviewSelections[c.id] &&
                            (() => {
                              const selectedOption = interviewSelections[c.id];
                              const canSchedule = canScheduleInterview(
                                c,
                                selectedOption,
                              );
                              const status = getInterviewStatus(
                                c,
                                selectedOption,
                              );
                              const isAutoSave =
                                autoSaveOptions.includes(selectedOption);

                              return (
                                <button
                                  onClick={() => handleScheduleClick(c)}
                                  disabled={(!canSchedule && !isAutoSave) || updatingStatus}
                                  className={`px-1 py-0.5 rounded text-white text-[10px] w-full shadow-sm ${updatingStatus ? "bg-gray-400 cursor-wait" :
                                    status === "scheduled" ? "bg-gray-400 cursor-not-allowed" :
                                      !canSchedule && !isAutoSave ? "bg-gray-400 cursor-not-allowed" :
                                        isAutoSave ? "bg-green-500 hover:bg-green-600" :
                                          "bg-blue-500 hover:bg-blue-600"
                                    }`}
                                >
                                  {updatingStatus ? "Updating..." :
                                    status === "scheduled" ? "Scheduled" :
                                      !canSchedule && !isAutoSave ? "Locked" :
                                        isAutoSave ? "Save" : "Schedule"}
                                </button>
                              );
                            })()}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="py-4 text-center text-gray-500"
                  >
                    No candidates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end gap-2 mt-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-2 py-1 border rounded text-xs disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-2 py-1 text-xs">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-2 py-1 border rounded text-xs disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}