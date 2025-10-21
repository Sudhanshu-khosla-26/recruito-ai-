"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const candidates = [
  { name: "Sana Shaikh", position: "HR Manager", location: "Mumbai", score: 9.5, appliedDate: "2025-09-10" },
  { name: "Ratikant Mishra", position: "HR Manager", location: "Delhi", score: 8.5, appliedDate: "2025-09-12" },
  { name: "Rohan Singh", position: "HR Manager", location: "Bangalore", score: 7, appliedDate: "2025-09-15" },
  { name: "John Nderitu", position: "HR Manager", location: "Delhi", score: 7, appliedDate: "2025-09-16" },
  { name: "Yashashwi Andhre", position: "HR Manager", location: "Andhra Pradesh", score: 6, appliedDate: "2025-09-18" },
];

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

  const handleDropdownChange = (index, value) => {
    if (selectedCandidates.length > 1) {
      const updates = {};
      selectedCandidates.forEach((idx) => {
        updates[idx] = value;
      });
      setInterviewSelections((prev) => ({ ...prev, ...updates }));
    } else {
      setInterviewSelections((prev) => ({ ...prev, [index]: value }));
    }
  };

  const handleScheduleClick = (index) => {
    const selectedIndices = selectedCandidates.length > 1 ? selectedCandidates : [index];
    selectedIndices.forEach((idx) => {
      const value = interviewSelections[idx];
      if (!value) return;
      console.log(`Scheduled for candidate ${idx + 1}: ${value}`);
    });

    const firstValue = interviewSelections[selectedIndices[0]];
    switch (firstValue) {
      case "Interview with AI":
        router.push("/dashboard/interviews/ai");
        break;
      case "Interview with HR":
      case "Interview with HM":
      case "Additional Round":
        router.push("/dashboard/interviews/hm");
        break;
      default:
        router.push("/dashboard/interviews/Status");
        break;
    }
  };

  const handleSelectCandidate = (index) => {
    setSelectedCandidates((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSelectAll = () => {
    if (selectedCandidates.length === filteredCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(filteredCandidates.map((_, idx) => idx));
    }
  };

  const getScoreColor = (score) => {
    if (score >= 9) return "bg-green-600 text-white";
    if (score >= 8) return "bg-green-300 text-black";
    if (score >= 7) return "bg-yellow-300 text-black";
    return "bg-red-500 text-white";
  };

  // Reset Filters
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

  // Filtering
  let filteredCandidates = candidates.filter((c) => {
    const jdMatch = selectedJD ? c.position === selectedJD : true;
    const locMatch = selectedLocation ? c.location === selectedLocation : true;
    const scoreMatch =
      (minScore ? c.score >= Number(minScore) : true) &&
      (maxScore ? c.score <= Number(maxScore) : true);
    const fromMatch = fromDate ? new Date(c.appliedDate) >= new Date(fromDate) : true;
    const toMatch = toDate ? new Date(c.appliedDate) <= new Date(toDate) : true;
    const searchMatch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    return jdMatch && locMatch && scoreMatch && fromMatch && toMatch && searchMatch;
  });

  // Sorting
  if (sortOrder) {
    filteredCandidates = [...filteredCandidates].sort((a, b) =>
      sortOrder === "asc" ? a.score - b.score : b.score - a.score
    );
  }

  // Pagination
  const indexOfLast = currentPage * candidatesPerPage;
  const indexOfFirst = indexOfLast - candidatesPerPage;
  const currentCandidates = filteredCandidates.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-xs">
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
            <option value="HR Manager">HR Manager</option>
            <option value="Software Engineer">Software Engineer</option>
            <option value="Data Analyst">Data Analyst</option>
          </select>

          {/* Location Filter */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="border rounded px-2 py-1 text-xs shadow-sm"
          >
            <option value="">All Locations</option>
            {[...new Set(candidates.map((c) => c.location))].map((loc, idx) => (
              <option key={idx} value={loc}>
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
          <h2 className="text-orange-500 font-semibold text-xs">All Candidates</h2>
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
                <th className="pb-2 pr-4">Position (JD)</th>
                <th className="pb-2 pr-4">Candidate Location</th>
                <th
                  className="pb-2 pr-4 cursor-pointer"
                  onClick={() =>
                    setSortOrder((prev) =>
                      prev === "asc" ? "desc" : prev === "desc" ? null : "asc"
                    )
                  }
                >
                  Resume Score{" "}
                  {sortOrder === "asc" ? "↑" : sortOrder === "desc" ? "↓" : ""}
                </th>
                <th className="pb-2 w-48">Interview</th>
              </tr>
            </thead>
            <tbody>
              {currentCandidates.length > 0 ? (
                currentCandidates.map((c, idx) => (
                  <tr
                    key={idx}
                    className={`border-t hover:bg-gray-100 ${
                      selectedCandidates.includes(idx) ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="py-2 pr-4">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(idx)}
                        onChange={() => handleSelectCandidate(idx)}
                      />
                    </td>
                    <td className="py-2 pr-4 font-medium">{c.name}</td>
                    <td className="pr-4">{c.position}</td>
                    <td className="pr-4">{c.location}</td>
                    <td className="pr-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${getScoreColor(
                          c.score
                        )}`}
                      >
                        {c.score}/10
                      </span>
                    </td>
                    <td className="py-2 w-48">
                      <div className="flex items-center gap-1">
                        <select
                          value={interviewSelections[idx] || ""}
                          onChange={(e) =>
                            handleDropdownChange(idx, e.target.value)
                          }
                          className="border rounded px-1 py-0.5 text-[10px] flex-shrink-0 shadow-sm"
                        >
                          <option value="">Select</option>
                          {interviewOptions.map((opt, i) => (
                            <option key={i} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>

                        <div className="w-16">
                          {interviewSelections[idx] && (
                            <button
                              onClick={() => handleScheduleClick(idx)}
                              className={`px-1 py-0.5 rounded text-white text-[10px] w-full shadow-sm ${
                                autoSaveOptions.includes(interviewSelections[idx])
                                  ? "bg-green-500 hover:bg-green-600"
                                  : "bg-blue-500 hover:bg-blue-600"
                              }`}
                            >
                              {autoSaveOptions.includes(interviewSelections[idx])
                                ? "Save"
                                : "Schedule"}
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-2 text-center text-gray-500">
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
