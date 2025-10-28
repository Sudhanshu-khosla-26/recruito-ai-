"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Circle, Save, ChevronUp, ChevronDown } from "lucide-react";

// --- Candidate Data ---
const candidates = [
  {
    name: "Sana Shaikh",
    position: "HR Manager",
    location: "Mumbai",
    score: 9.5,
    appliedDate: "2025-09-10",
    aiRating: 9,
    hrRating: 8,
    hmRating: 9,
    finalStatus: "Selected",
  },
  {
    name: "Ratikant Mishra",
    position: "HR Manager",
    location: "Delhi",
    score: 8.5,
    appliedDate: "2025-09-12",
    aiRating: 8,
    hrRating: 7,
    hmRating: 8,
    finalStatus: "On Hold",
  },
  {
    name: "Rohan Singh",
    position: "HR Manager",
    location: "Bangalore",
    score: 7,
    appliedDate: "2025-09-15",
    aiRating: 7,
    hrRating: 6,
    hmRating: 7,
    finalStatus: "Rejected",
  },
  {
    name: "John Nderitu",
    position: "HR Manager",
    location: "Delhi",
    score: 7,
    appliedDate: "2025-09-16",
    aiRating: 7,
    hrRating: 7,
    hmRating: 6,
    finalStatus: "Interview Pending",
  },
  {
    name: "Yashashwi Andhre",
    position: "HR Manager",
    location: "Andhra Pradesh",
    score: 6,
    appliedDate: "2025-09-18",
    aiRating: 6,
    hrRating: 5,
    hmRating: 6,
    finalStatus: "Rejected",
  },
];

const interviewOptions = [
  "Selected",
  "On Hold",
  "Rejected",
  "Interview Pending",
  "Schedule Again",
  "Hold",
  "Skip",
  "Not Suitable",
  "Completed",
];

const perPageOptions = [10, 20, 50, 100];

export default function CandidateTable() {
  const router = useRouter();

  const [candidateData, setCandidateData] = useState(
    candidates.map((c) => ({ ...c }))
  );
  const [interviewSelections, setInterviewSelections] = useState(
    candidates.reduce((acc, _, idx) => {
      acc[idx] = candidates[idx].finalStatus;
      return acc;
    }, {})
  );
  const [statusChanges, setStatusChanges] = useState({});
  const [selectedJD, setSelectedJD] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [minScore, setMinScore] = useState("");
  const [maxScore, setMaxScore] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [candidatesPerPage, setCandidatesPerPage] = useState(
    perPageOptions[1]
  );

  const handleDropdownChange = useCallback(
    (index, value) => {
      const oldValue = candidateData[index].finalStatus;
      setInterviewSelections((prev) => ({ ...prev, [index]: value }));

      if (oldValue !== value) {
        setStatusChanges((prev) => ({
          ...prev,
          [index]: { from: oldValue, to: value },
        }));
      } else {
        setStatusChanges((prev) => {
          const copy = { ...prev };
          delete copy[index];
          return copy;
        });
      }
    },
    [candidateData]
  );

  const handleSaveStatus = useCallback(
    (index) => {
      const newStatus = interviewSelections[index];
      const oldStatus = candidateData[index].finalStatus;

      // Update candidateData with the new status
      setCandidateData((prev) =>
        prev.map((c, i) => (i === index ? { ...c, finalStatus: newStatus } : c))
      );

      // Keep the status change for the info icon, but clear the selection
      setSelectedCandidates((prev) => prev.filter((i) => i !== index));

      // The key change: The status change icon should persist.
      // Instead of deleting the status change, we update the 'from' value
      // to the old 'to' value, so the icon remains with updated text.
      setStatusChanges((prev) => ({
        ...prev,
        [index]: { from: oldStatus, to: newStatus },
      }));

      if (newStatus === "Schedule Again") {
        router.push("/dashboard/interviews/schedule");
      }
    },
    [interviewSelections, candidateData, router]
  );

  const handleSelectCandidate = useCallback((index) => {
    setSelectedCandidates((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      let direction = "asc";
      if (prev.key === key && prev.direction === "asc") {
        direction = "desc";
      } else if (prev.key === key && prev.direction === "desc") {
        return { key: null, direction: null };
      }
      return { key, direction };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={16} />
    ) : (
      <ChevronDown size={16} />
    );
  };

  const getScoreColor = (score) => {
    if (score >= 9) return "bg-green-600 text-white";
    if (score >= 8) return "bg-green-300 text-black";
    if (score >= 7) return "bg-yellow-300 text-black";
    return "bg-red-500 text-white";
  };

  const resetFilters = useCallback(() => {
    setSelectedJD("");
    setSelectedLocation("");
    setMinScore("");
    setMaxScore("");
    setFromDate("");
    setToDate("");
    setSearchTerm("");
    setSortConfig({ key: null, direction: null });
    setCurrentPage(1);
  }, []);

  const filteredCandidates = useMemo(() => {
    let result = candidateData.filter((c) => {
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

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [
    candidateData,
    selectedJD,
    selectedLocation,
    minScore,
    maxScore,
    fromDate,
    toDate,
    searchTerm,
    sortConfig,
  ]);

  const indexOfLast = currentPage * candidatesPerPage;
  const indexOfFirst = indexOfLast - candidatesPerPage;
  const currentCandidates = filteredCandidates.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);

  const renderStatusDisplay = (globalIdx) => {
    if (statusChanges[globalIdx]) {
      const { from, to } = statusChanges[globalIdx];
      return (
        <span className="relative inline-flex items-center gap-1 group">
          <Circle
            size={12}
            fill="currentColor"
            className="text-yellow-500"
          />
          <span className="absolute left-full ml-2 w-max px-2 py-1 bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Status changed from {from} to {to}
          </span>
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-sm">
      {/* Filters Section */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 mb-6 flex flex-wrap gap-6 items-center">
        <select
          value={selectedJD}
          onChange={(e) => setSelectedJD(e.target.value)}
          className="border rounded px-3 py-2 text-sm shadow-sm"
        >
          <option value="">Select JD</option>
          <option value="HR Manager">HR Manager</option>
          <option value="Software Engineer">Software Engineer</option>
          <option value="Data Analyst">Data Analyst</option>
        </select>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="border rounded px-3 py-2 text-sm shadow-sm"
        >
          <option value="">All Locations</option>
          {[...new Set(candidates.map((c) => c.location))].map((loc, idx) => (
            <option key={idx} value={loc}>
              {loc}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-3">
          <label className="text-gray-600 text-sm">Score:</label>
          <input
            type="number"
            placeholder="Min"
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
            className="border rounded px-2 py-1 w-20 text-sm shadow-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxScore}
            onChange={(e) => setMaxScore(e.target.value)}
            className="border rounded px-2 py-1 w-20 text-sm shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-gray-600 text-sm">From:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded px-2 py-1 text-sm shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-gray-600 text-sm">To:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded px-2 py-1 text-sm shadow-sm"
          />
        </div>
        <button
          onClick={resetFilters}
          className="ml-2 px-4 py-2 border rounded text-sm bg-gray-200 hover:bg-gray-300"
        >
          Reset Filters
        </button>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-gray-600">Show:</label>
          <select
            value={candidatesPerPage}
            onChange={(e) => setCandidatesPerPage(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm shadow-sm"
          >
            {perPageOptions.map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidate Data Table Section */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 overflow-x-auto">
        <table className="border-collapse text-sm text-left w-full">
          <thead>
            <tr className="text-gray-700 font-semibold">
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Position (JD)</th>
              <th className="px-4 py-3">Location</th>
              <th
                className="px-4 py-3 cursor-pointer select-none"
                onClick={() => handleSort("score")}
              >
                <div className="flex items-center gap-1">
                  Resume Score {getSortIcon("score")}
                </div>
              </th>
              <th
                className="px-4 py-3 cursor-pointer select-none"
                onClick={() => handleSort("aiRating")}
              >
                <div className="flex items-center gap-1">
                  AI Rating {getSortIcon("aiRating")}
                </div>
              </th>
              <th
                className="px-4 py-3 cursor-pointer select-none"
                onClick={() => handleSort("hrRating")}
              >
                <div className="flex items-center gap-1">
                  HR Rating {getSortIcon("hrRating")}
                </div>
              </th>
              <th
                className="px-4 py-3 cursor-pointer select-none"
                onClick={() => handleSort("hmRating")}
              >
                <div className="flex items-center gap-1">
                  HM Rating {getSortIcon("hmRating")}
                </div>
              </th>
              <th className="px-4 py-3 w-52">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentCandidates.length > 0 ? (
              currentCandidates.map((c, idx) => {
                const globalIdx = candidateData.findIndex(
                  (cand) => cand.name === c.name
                );
                const isSelected = selectedCandidates.includes(globalIdx);
                const hasStatusChanged = !!statusChanges[globalIdx];
                const selectedStatus = interviewSelections[globalIdx];
                const showSaveButton = isSelected && hasStatusChanged && selectedStatus !== "Schedule Again";
                const showScheduleButton = isSelected && selectedStatus === "Schedule Again";

                return (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectCandidate(globalIdx)}
                      />
                    </td>
                    <td className="font-medium px-4 py-3 flex items-center gap-1">
                      {c.name}
                      {hasStatusChanged && renderStatusDisplay(globalIdx)}
                    </td>
                    <td className="px-4 py-3">{c.position}</td>
                    <td className="px-4 py-3">{c.location}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getScoreColor(
                          c.score
                        )}`}
                      >
                        {c.score}/10
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getScoreColor(
                          c.aiRating
                        )}`}
                      >
                        {c.aiRating}/10
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getScoreColor(
                          c.hrRating
                        )}`}
                      >
                        {c.hrRating}/10
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getScoreColor(
                          c.hmRating
                        )}`}
                      >
                        {c.hmRating}/10
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={
                            interviewSelections[globalIdx] || c.finalStatus
                          }
                          onChange={(e) =>
                            handleDropdownChange(globalIdx, e.target.value)
                          }
                          disabled={!isSelected}
                          className={`border rounded px-2 py-1 text-sm flex-shrink-0 shadow-sm ${
                            !isSelected ? "bg-gray-100 cursor-not-allowed" : ""
                          }`}
                        >
                          {interviewOptions.map((opt, i) => (
                            <option key={i} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        {showSaveButton && (
                          <button
                            onClick={() => handleSaveStatus(globalIdx)}
                            className="flex items-center px-3 py-1 rounded text-white text-xs shadow-sm bg-green-500 hover:bg-green-600"
                          >
                            <Save size={14} className="mr-1" />
                            Save
                          </button>
                        )}
                        {showScheduleButton && (
                          <button
                            onClick={() => handleSaveStatus(globalIdx)}
                            className="px-3 py-1 rounded text-white text-xs shadow-sm bg-blue-500 hover:bg-blue-600"
                          >
                            Schedule
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="text-center text-gray-500 py-4">
                  No candidates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex justify-end gap-3 mt-6">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-3 py-2 border rounded text-sm disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-3 py-2 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-3 py-2 border rounded text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}