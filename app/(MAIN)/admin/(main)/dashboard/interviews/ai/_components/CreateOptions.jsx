"use client";
import { Video, ChevronDown, X, FileSearch, CheckCircle } from "lucide-react";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";

function CreateOptions() {
  const searchParams = useSearchParams();
  const jdTitle = searchParams.get("jd");
  const candidateId = searchParams.get("candidate_id"); // Get candidate_id from URL

  const [jdList, setJdList] = useState([]);
  const [selectedJD, setSelectedJD] = useState(null);
  console.log("selectjd", selectedJD);
  const [jdSearch, setJdSearch] = useState("");
  const [candidateSearch, setCandidateSearch] = useState("");

  // State to hold candidates from the API
  const [candidateList, setCandidateList] = useState([]);

  const [selectedCandidates, setSelectedCandidates] = useState(null);
  console.log(selectedCandidates, "selected");
  const [page, setPage] = useState(1);
  const [scheduledPage, setScheduledPage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Separate loading states for JDs and Candidates
  const [jdLoading, setJdLoading] = useState(true);
  const [candidatesLoading, setCandidatesLoading] = useState(false);

  const perPage = 5;
  const dropdownRef = useRef(null);

  // Fetch JDs on component mount
  useEffect(() => {
    const fetchJD = async () => {
      try {
        setJdLoading(true);
        const res = await axios.get("/api/job/get-all-jd");
        console.log("Fetched JDs:", res.data.jobs);
        setJdList(res.data.jobs || []);
        if (jdTitle) {
          console.log("jdTitle", jdTitle);
          const jd = res.data.jobs.find((jd) => jd.title === jdTitle);
          setSelectedJD(jd);
        }
      } catch (err) {
        console.error("Failed to fetch JDs:", err);
        setJdList([]);
      } finally {
        setJdLoading(false);
      }
    };
    fetchJD();
  }, [jdTitle]);

  // Fetch candidates whenever a JD is selected
  useEffect(() => {
    const getCandidates = async () => {
      // Return early if no JD is selected
      if (!selectedJD) {
        setCandidateList([]); // Clear list if JD is deselected
        return;
      }
      try {
        setCandidatesLoading(true);
        const res = await axios.get(
          `/api/Applications/get-all-applications?jobid=${selectedJD.id}`
        );
        console.log("Fetched candidates:", res.data.applications);
        // Log the first candidate to see the structure
        if (res.data.applications && res.data.applications.length > 0) {
          console.log("First candidate structure:", res.data.applications[0]);
          console.log("Interview list:", res.data.applications[0].interviews_list);
        }
        setCandidateList(res.data.applications || []);
      } catch (error) {
        console.error("Failed to fetch candidates:", error);
        setCandidateList([]); // Clear list on error
      } finally {
        setCandidatesLoading(false);
      }
    };

    getCandidates();
  }, [selectedJD]);

  // Auto-select candidate when candidateId is in URL and candidates are loaded
  useEffect(() => {
    if (candidateId && candidateList.length > 0) {
      const candidate = candidateList.find((c) => c.id === candidateId);
      if (candidate) {
        console.log("Auto-selecting candidate:", candidate);
        setSelectedCandidates({ id: candidate.id, email: candidate.applicant_email });
      }
    }
  }, [candidateId, candidateList]);

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

  // Helper function to check if candidate has scheduled AI interview
  const hasScheduledAIInterview = (candidate) => {
    if (!candidate.interviews_list || !Array.isArray(candidate.interviews_list)) {
      return false;
    }
    // Check if any AI interview (mode: "Wai") in the list is scheduled
    return candidate.interviews_list.some(
      (interview) => interview.mode === 'Wai' && interview.status === 'scheduled'
    );
  };

  // Filter JD list based on search
  const filteredJDs = jdList.filter(
    (jd) =>
      jd.title?.toLowerCase().includes(jdSearch.toLowerCase()) ||
      jd.location?.toLowerCase().includes(jdSearch.toLowerCase()),
  );

  // Separate candidates into scheduled and not scheduled
  const availableCandidates = candidateList.filter((c) => {
    const matchesSearch = c.applicant_name.toLowerCase().includes(candidateSearch.toLowerCase());
    const notScheduled = !hasScheduledAIInterview(c);
    return matchesSearch && notScheduled;
  });

  const scheduledCandidates = candidateList.filter((c) => {
    const matchesSearch = c.applicant_name.toLowerCase().includes(candidateSearch.toLowerCase());
    const isScheduled = hasScheduledAIInterview(c);
    return matchesSearch && isScheduled;
  });

  const totalPages = Math.ceil(availableCandidates.length / perPage);
  const startIndex = (page - 1) * perPage;
  const paginatedCandidates = availableCandidates.slice(
    startIndex,
    startIndex + perPage,
  );

  const totalScheduledPages = Math.ceil(scheduledCandidates.length / perPage);
  const scheduledStartIndex = (scheduledPage - 1) * perPage;
  const paginatedScheduledCandidates = scheduledCandidates.slice(
    scheduledStartIndex,
    scheduledStartIndex + perPage,
  );

  const toggleCandidate = (id, email) => {
    setSelectedCandidates({ id, email });
  };

  // Reset functions
  const resetCandidateSearch = () => {
    setCandidateSearch("");
    setPage(1);
    setScheduledPage(1);
  };

  const handleJDSelect = (jd) => {
    setSelectedJD(jd);
    setDropdownOpen(false);
    setJdSearch(jd.title);
    setPage(1); // Reset pagination on new JD selection
    setScheduledPage(1);
    setCandidateSearch(""); // Reset candidate search on new JD
    setSelectedCandidates([]); // Clear selected candidates on new JD
  };

  // Helper function to format the Firestore timestamp
  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp._seconds) return "N/A";
    return new Date(timestamp._seconds * 1000).toLocaleDateString("en-CA"); // 'en-CA' gives YYYY-MM-DD format
  };

  return (
    <div className="flex flex-col gap-6">
      {/* JD Selection */}
      <div
        className="bg-white w-full border border-gray-200 rounded-lg p-4 relative"
        ref={dropdownRef}
      >
        <div className="flex justify-between items-start mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select JD
          </label>
          {selectedJD && (
            <Link
              href={{
                pathname: "/admin/dashboard/analyse-resume",
                query: {
                  jdId: selectedJD.id,
                  jdTitle: selectedJD.title,
                },
              }}
            >
              <button
                type="button"
                className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded px-3 py-1.5 transition-colors duration-200"
              >
                <FileSearch className="h-3.5 w-3.5" />
                Analyze Resumes
              </button>
            </Link>
          )}
        </div>

        <div
          className="w-full max-w-3xs border border-gray-300 rounded-lg p-2 text-sm flex justify-between items-center cursor-pointer"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span className="truncate">
            {selectedJD ? (
              <span>
                <span className="font-medium">{selectedJD.title}</span>
                <span className="text-gray-500 text-xs ml-2">
                  • {selectedJD.location}
                </span>
              </span>
            ) : (
              "-- Select JD --"
            )}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0 ml-2" />
        </div>

        {/* Dropdown options with type search */}
        {dropdownOpen && (
          <div className="absolute top-full left-4 w-full max-w-3xs border border-gray-300 rounded-lg bg-white mt-1 z-10 shadow-lg max-h-80 overflow-y-auto">
            <div className="flex items-center sticky top-0 bg-white border-b border-gray-200">
              <input
                type="text"
                value={jdSearch}
                onChange={(e) => setJdSearch(e.target.value)}
                placeholder="Search by title or location..."
                className="w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {jdSearch && (
                <X
                  className="h-4 w-4 text-gray-500 cursor-pointer mr-2 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setJdSearch("");
                  }}
                />
              )}
            </div>

            {jdLoading ? (
              <div className="px-3 py-3 text-sm text-gray-500 text-center">
                Loading JDs...
              </div>
            ) : filteredJDs.length > 0 ? (
              <div>
                {filteredJDs.map((jd) => (
                  <div
                    key={jd.id}
                    className="px-3 py-3 text-sm cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                    onClick={() => handleJDSelect(jd)}
                  >
                    <div className="font-medium text-gray-800 flex items-center">
                      {jd.title}
                      <span className="text-xs text-gray-500 ml-2">
                        📍 {jd.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-3 py-8 text-sm text-gray-500 text-center">
                {jdSearch
                  ? "No JD found matching your search"
                  : "No JDs available"}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Candidate Selection Card - Available Candidates */}
      {selectedJD && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm min-h-[360px] flex flex-col">
          <div className="flex justify-between items-center mb-3 border-b pb-2">
            <h3 className="text-sm font-semibold text-gray-800">
              Available Candidates for {selectedJD.title}
            </h3>
            {/* Candidate name type search with reset */}
            <div className="flex items-center gap-1">
              <input
                type="text"
                placeholder="Search candidate..."
                value={candidateSearch}
                onChange={(e) => {
                  setCandidateSearch(e.target.value);
                  setPage(1);
                  setScheduledPage(1);
                }}
                className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {candidateSearch && (
                <X
                  className="h-4 w-4 text-gray-500 cursor-pointer"
                  onClick={resetCandidateSearch}
                />
              )}
            </div>
          </div>

          {candidatesLoading ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              Loading candidates...
            </div>
          ) : availableCandidates.length > 0 ? (
            <>
              <div className="flex flex-col gap-2 flex-1">
                {paginatedCandidates.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition"
                  >
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCandidates?.id === c.id}
                        onChange={() =>
                          toggleCandidate(c.id, c.applicant_email)
                        }
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800">
                          {c.applicant_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {selectedJD.title} • Applied on:{" "}
                          {formatDate(c.applied_at)}
                        </span>
                      </div>
                    </label>

                    {selectedCandidates?.id === c.id && (
                      <Link href={`/admin/dashboard/interviews/ai/create-interview?id=${selectedCandidates.id}&jobid=${selectedJD.id}&emailid=${selectedCandidates.email}`}>
                        <button
                          type="button"
                          className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded px-2 py-1 transition-colors duration-200"
                        >
                          <Video className="h-3 w-3" />
                          Create Interview
                        </button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-2 py-1 text-xs border rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2 py-1 text-xs border rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              <p>
                {candidateSearch
                  ? "No available candidates found matching your search."
                  : "No available candidates for scheduling."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Already Scheduled Candidates Panel */}
      {selectedJD && scheduledCandidates.length > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 shadow-sm min-h-[300px] flex flex-col">
          <div className="flex justify-between items-center mb-3 border-b border-green-200 pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="text-sm font-semibold text-green-800">
                Already Scheduled AI Interviews ({scheduledCandidates.length})
              </h3>
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-1">
            {paginatedScheduledCandidates.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between bg-white border-2 border-green-200 rounded-lg px-3 py-2 opacity-75"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">
                      {c.applicant_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {selectedJD.title} • Interview Scheduled
                    </span>
                  </div>
                </div>
                <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                  Scheduled
                </span>
              </div>
            ))}
          </div>

          {/* Pagination for Scheduled */}
          {totalScheduledPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <button
                disabled={scheduledPage === 1}
                onClick={() => setScheduledPage((p) => Math.max(1, p - 1))}
                className="px-2 py-1 text-xs border border-green-300 rounded-lg bg-white hover:bg-green-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs text-green-700">
                Page {scheduledPage} of {totalScheduledPages}
              </span>
              <button
                disabled={scheduledPage === totalScheduledPages}
                onClick={() => setScheduledPage((p) => Math.min(totalScheduledPages, p + 1))}
                className="px-2 py-1 text-xs border border-green-300 rounded-lg bg-white hover:bg-green-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CreateOptions;