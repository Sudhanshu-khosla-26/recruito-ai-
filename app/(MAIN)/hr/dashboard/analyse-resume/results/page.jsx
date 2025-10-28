"use client";

import React, { useState } from "react";

const candidates = [
  {
    name: "Sana Shaikh",
    position: "HR Manager",
    location: "Mumbai",
    score: 9.5,
    date: "2025-09-01",
    breakdown: {
      Skills: 9,
      Education: 9,
      Experience: 9,
      Location: 10,
      Certification: 9,
      Industry: 10,
      Relevance: 9,
      Stability: 9.5,
      Salary: 10,
    },
  },
  {
    name: "Ratikant Mishra",
    position: "HR Manager",
    location: "Delhi",
    score: 8.5,
    date: "2025-09-05",
    breakdown: {
      Skills: 8,
      Education: 9,
      Experience: 8,
      Location: 8,
      Certification: 8,
      Industry: 9,
      Relevance: 8.5,
      Stability: 8,
      Salary: 9,
    },
  },
  {
    name: "Rohan Singh",
    position: "HR Manager",
    location: "Bangalore",
    score: 7,
    date: "2025-09-10",
    breakdown: {
      Skills: 7,
      Education: 6.5,
      Experience: 7,
      Location: 8,
      Certification: 6,
      Industry: 7,
      Relevance: 7,
      Stability: 7,
      Salary: 7,
    },
  },
];

export default function CandidateDashboard() {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedJD, setSelectedJD] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewMode, setViewMode] = useState("table");

  const getScoreColor = (score) => {
    if (score >= 9) return "bg-green-600 hover:bg-green-700";
    if (score >= 8) return "bg-green-300 hover:bg-green-400 text-black";
    if (score >= 7) return "bg-red-300 hover:bg-red-400 text-black";
    return "bg-red-500 hover:bg-red-600";
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchJD = selectedJD === "All" || c.position === selectedJD;
    const matchDate =
      (!startDate || new Date(c.date) >= new Date(startDate)) &&
      (!endDate || new Date(c.date) <= new Date(endDate));
    return matchJD && matchDate;
  });

  const resetFilters = () => {
    setSelectedJD("All");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 text-sm p-6">
      <div className="bg-white rounded-lg shadow p-6">
        {/* Filters inside the card */}
        <div className="grid md:grid-cols-4 gap-4 mb-6 text-xs">
          {/* Date Range */}
          <div>
            <label className="block font-medium text-gray-600 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 w-full text-xs"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-600 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 w-full text-xs"
            />
          </div>

          {/* JD Filter */}
          <div>
            <label className="block font-medium text-gray-600 mb-1">
              Select JD
            </label>
            <select
              value={selectedJD}
              onChange={(e) => setSelectedJD(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 w-full text-xs"
            >
              <option value="All">All</option>
              <option value="HR Manager">HR Manager</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 items-end">
            <button
              onClick={resetFilters}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs"
            >
              Reset
            </button>
            <button
              onClick={() =>
                setViewMode(viewMode === "table" ? "tiles" : "table")
              }
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
            >
              {viewMode === "table" ? "Tiles View" : "Table View"}
            </button>
          </div>
        </div>

        {/* Candidate Views */}
        {viewMode === "table" ? (
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="pb-3">Date</th>
                <th className="pb-3">Name</th>
                <th className="pb-3">Position (JD)</th>
                <th className="pb-3">Location</th>
                <th className="pb-3">Resume Score</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((c, idx) => (
                <tr key={idx} className="border-t">
                  <td className="py-3">{c.date}</td>
                  <td className="py-3 flex items-center gap-2">
                    <span className="text-gray-400">{">"}</span>
                    <span className="font-semibold">{c.name}</span>
                  </td>
                  <td>{c.position}</td>
                  <td>{c.location}</td>
                  <td>
                    <button
                      onClick={() => setSelectedCandidate(c)}
                      className={`px-3 py-0.5 rounded-full text-white text-xs ${getScoreColor(
                        c.score
                      )}`}
                    >
                      {c.score}/10
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          // Tiles/Grid View
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCandidates.map((c, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-lg shadow p-4 flex flex-col justify-between text-xs"
              >
                <div>
                  <p className="text-gray-400">{c.date}</p>
                  <h3 className="font-bold text-sm">{c.name}</h3>
                  <p className="text-gray-600">{c.position}</p>
                  <p className="text-gray-500">{c.location}</p>
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => setSelectedCandidate(c)}
                    className={`px-3 py-0.5 rounded-full text-white text-xs ${getScoreColor(
                      c.score
                    )}`}
                  >
                    {c.score}/10
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg relative text-xs">
            <button
              onClick={() => setSelectedCandidate(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
            <h2 className="text-center text-orange-500 font-semibold text-sm mb-4">
              Resume Screening Score Status ( {selectedCandidate.score} Out of 10
              )
            </h2>
            <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-gray-700">
              {Object.entries(selectedCandidate.breakdown).map(
                ([key, value], i) => (
                  <p key={i}>
                    <span className="font-medium">{key} :</span> {value}
                  </p>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
