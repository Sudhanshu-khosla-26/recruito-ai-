"use client";
import { ChevronDown, X } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

// Mock candidate data
const candidates = [
  { id: 1, name: "Sana Shaikh", position: "Frontend Developer", appliedDate: "2025-09-10", interviewType: "AI" },
  { id: 2, name: "Ratikant Mishra", position: "Backend Developer", appliedDate: "2025-09-12", interviewType: "HR" },
  { id: 3, name: "Anita Verma", position: "Frontend Developer", appliedDate: "2025-09-11", interviewType: "AI" },
  { id: 4, name: "Vikram Rao", position: "HR Manager", appliedDate: "2025-09-09", interviewType: "AI" },
  { id: 5, name: "Neha Sharma", position: "Frontend Developer", appliedDate: "2025-09-08", interviewType: "AI" },
  { id: 6, name: "Amit Singh", position: "Backend Developer", appliedDate: "2025-09-07", interviewType: "AI" },
];

const jdList = ["Frontend Developer", "Backend Developer", "HR Manager"];

const managerOptions = ["Hiring Manager", "Human Resource", "Additional Round Manager"];

function Managers() {
  const [selectedJD, setSelectedJD] = useState("");
  const [jdSearch, setJdSearch] = useState("");
  const [candidateSearch, setCandidateSearch] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [page, setPage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Right side inputs
  const [manager, setManager] = useState("");
  const [hmEmail, setHmEmail] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [duration, setDuration] = useState("");

  // Availability
  const [availableSlots, setAvailableSlots] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Send button clicked state
  const [sentToManager, setSentToManager] = useState(false);
  const [sentToCandidate, setSentToCandidate] = useState(false);

  const perPage = 5;
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter JD list
  const filteredJDs = jdList.filter((jd) =>
    jd.toLowerCase().includes(jdSearch.toLowerCase())
  );

  // Filter candidates
  const filteredCandidates = candidates.filter(
    (c) =>
      (!selectedJD || c.position === selectedJD) &&
      c.interviewType === "AI" &&
      c.name.toLowerCase().includes(candidateSearch.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCandidates.length / perPage);
  const startIndex = (page - 1) * perPage;
  const paginatedCandidates = filteredCandidates.slice(
    startIndex,
    startIndex + perPage
  );

  const handleCandidateSelect = (candidate) => {
    if (selectedCandidate?.id === candidate.id) {
      setSelectedCandidate(null); // Deselect
    } else {
      setSelectedCandidate(candidate);
    }
    resetAvailability();
  };

  const resetJD = () => {
    setSelectedJD("");
    setJdSearch("");
    setPage(1);
  };

  const resetCandidateSearch = () => {
    setCandidateSearch("");
    setPage(1);
  };

  const resetAvailability = () => {
    setAvailableSlots({});
    setSelectedSlot(null);
    setSentToManager(false);
    setSentToCandidate(false);
  };

  // Reset availability when right side inputs change
  useEffect(() => {
    resetAvailability();
  }, [manager, hmEmail, fromDate, toDate, duration]);

  // Mock fetching availability slots
  const fetchAvailability = () => {
    const slots = {
      [fromDate]: ["10:00 AM", "11:30 AM", "2:00 PM"],
      [toDate]: ["9:00 AM", "1:00 PM", "3:30 PM"],
    };
    setAvailableSlots(slots);
    setSelectedSlot(null);
    setSentToManager(false);
    setSentToCandidate(false);
  };

  const isFormComplete = manager && hmEmail && fromDate && toDate && duration;

  const handleSend = (type) => {
    const success = Math.random() > 0.1;
    if (success) {
      alert(`${type} sent successfully!`);
      if (type === "Manager") setSentToManager(true);
      else setSentToCandidate(true);
    } else {
      alert(`${type} sending failed!`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* JD Selection */}
      <div className="bg-white w-full border border-gray-200 rounded-lg p-4 relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-1">Select JD</label>
        <div
          className="w-64 border border-gray-300 rounded-lg p-2 text-sm flex justify-between items-center cursor-pointer"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span>{selectedJD || "-- Select JD --"}</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </div>
        {dropdownOpen && (
          <div className="absolute top-full left-0 w-64 border border-gray-300 rounded-lg bg-white mt-1 z-10 shadow max-h-40 overflow-y-auto">
            <div className="flex items-center">
              <input
                type="text"
                value={jdSearch}
                onChange={(e) => setJdSearch(e.target.value)}
                placeholder="Type to search..."
                className="w-full px-2 py-1 text-sm border-b border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {jdSearch && <X className="h-4 w-4 text-gray-500 cursor-pointer ml-1" onClick={resetJD} />}
            </div>
            {filteredJDs.length > 0 ? filteredJDs.map((jd) => (
              <div
                key={jd}
                className="px-2 py-2 text-sm cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setSelectedJD(jd);
                  setDropdownOpen(false);
                  setJdSearch(jd);
                  setPage(1);
                }}
              >
                {jd}
              </div>
            )) : <div className="px-2 py-2 text-sm text-gray-500">No JD found</div>}
          </div>
        )}
      </div>

      {/* Main layout */}
      {selectedJD && (
        <div className="flex gap-4">
          {/* Candidate List */}
          <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm min-h-[360px] transition-all ${selectedCandidate ? "w-1/2" : "w-full"}`}>
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="text-sm font-semibold text-gray-800">
                Candidates for {selectedJD} (Interview with Managers)
              </h3>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Search candidate..."
                  value={candidateSearch}
                  onChange={(e) => { setCandidateSearch(e.target.value); setPage(1); }}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {candidateSearch && <X className="h-4 w-4 text-gray-500 cursor-pointer" onClick={resetCandidateSearch} />}
              </div>
            </div>
            {filteredCandidates.length > 0 ? (
              <div className="flex flex-col gap-2 flex-1">
                {paginatedCandidates.map((c) => (
                  <label
                    key={c.id}
                    onDoubleClick={() => setSelectedCandidate(null)}
                    className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={selectedCandidate?.id === c.id}
                        onChange={() => handleCandidateSelect(c)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800">{c.name}</span>
                        <span className="text-xs text-gray-500">{c.position} • {c.appliedDate}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            ) : <p className="text-gray-500 text-sm flex-1">No candidates found.</p>}
          </div>

          {/* Right Side Card */}
          {selectedCandidate && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm w-1/2">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {selectedCandidate.name} – {selectedCandidate.position}
              </h3>

              {/* Manager dropdown & Email */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <select
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Select Manager</option>
                  {managerOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <input
                  type="email"
                  placeholder="Email"
                  value={hmEmail}
                  onChange={(e) => setHmEmail(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {/* Dates & Duration */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <input type="date" value={fromDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => setFromDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                <input type="date" value={toDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => setToDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                <select value={duration} onChange={(e) => setDuration(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Duration</option>
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="60">60 min</option>
                  <option value="120">120 min</option>
                </select>
              </div>

              {/* Get Availability */}
              {isFormComplete && Object.keys(availableSlots).length === 0 && (
                <button type="button" onClick={fetchAvailability} className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg px-4 py-2 transition">
                  Get Availability
                </button>
              )}

              {/* Show Slots */}
              {Object.keys(availableSlots).length > 0 && (
                <div className="mt-4 space-y-4">
                  {Object.entries(availableSlots).map(([date, slots]) => (
                    <div key={date}>
                      <p className="font-medium text-gray-700 mb-2">{date}</p>
                      <div className="flex gap-2 flex-wrap">
                        {slots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedSlot({ date, slot })}
                            className={`px-3 py-1 rounded-lg border text-sm ${selectedSlot?.slot === slot ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              {selectedSlot && (
                <div className="flex gap-2 mt-6">
                  {manager && (
                    <button
                      disabled={sentToManager}
                      onClick={() => handleSend("Manager")}
                      className={`flex-1 text-white text-sm rounded-lg px-3 py-2 ${sentToManager ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
                    >
                      Send to {manager}
                    </button>
                  )}
                  <button
                    disabled={sentToCandidate}
                    onClick={() => handleSend("Candidate")}
                    className={`flex-1 text-white text-sm rounded-lg px-3 py-2 ${sentToCandidate ? "bg-gray-400 cursor-not-allowed" : "bg-purple-500 hover:bg-purple-600"}`}
                  >
                    Send to Candidate
                  </button>
                  <button
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg px-3 py-2"
                    onClick={() => resetAvailability()}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Managers;
