"use client";
import { ChevronDown, X, CheckCircle } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";

const managerOptions = ["Hiring Manager", "Human Resource", "Additional Round Manager"];

function Managers() {
  const searchParams = useSearchParams();
  const jdTitle = searchParams.get("jd");
  const candidateId = searchParams.get("candidate_id");
  const modeParam = searchParams.get("mode");

  useEffect(() => {
    if (modeParam) {
      const modeMap = {
        'hr': 'Human Resource',
        'hm': 'Hiring Manager',
        'additional': 'Additional Round Manager'
      };

      const mappedManager = modeMap[modeParam.toLowerCase()];
      if (mappedManager) {
        setManager(mappedManager);
      }
    }
  }, [modeParam]);

  // JD State
  const [jdList, setJdList] = useState([]);
  const [selectedJD, setSelectedJD] = useState(null);
  const [jdSearch, setJdSearch] = useState("");
  const [jdLoading, setJdLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Candidate State
  const [candidateList, setCandidateList] = useState([]);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [scheduledPage, setScheduledPage] = useState(1);

  // Right side inputs
  const [manager, setManager] = useState("");
  const [hmEmail, setHmEmail] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [duration, setDuration] = useState("");

  // Availability
  const [availableSlots, setAvailableSlots] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [interviewerId, setInterviewerId] = useState("");
  const [interviewerName, setInterviewerName] = useState("");

  // Send email modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSendingTo, setEmailSendingTo] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [bookedInterviewData, setBookedInterviewData] = useState(null);

  // Send button clicked state
  const [sentToManager, setSentToManager] = useState(false);
  const [sentToCandidate, setSentToCandidate] = useState(false);

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
      if (!selectedJD) {
        setCandidateList([]);
        return;
      }
      try {
        setCandidatesLoading(true);
        const res = await axios.get(
          `/api/Applications/get-all-applications?jobid=${selectedJD.id}`
        );
        console.log("Fetched candidates:", res.data.applications);
        // Log first candidate to check structure
        if (res.data.applications && res.data.applications.length > 0) {
          console.log("First candidate interviews_list:", res.data.applications[0].interviews_list);
        }
        setCandidateList(res.data.applications);
      } catch (error) {
        console.error("Failed to fetch candidates:", error);
        setCandidateList([]);
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
        setSelectedCandidate(candidate);
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

  // Helper function to check if candidate has scheduled interview for selected manager type
  const hasScheduledInterviewForType = (candidate) => {
    if (!candidate.interviews_list || !Array.isArray(candidate.interviews_list)) {
      return false;
    }

    const modeMap = {
      'Hiring Manager': 'Whm',
      'Human Resource': 'Whr',
      'Additional Round Manager': 'Whm'
    };

    const selectedMode = modeMap[manager];

    // If no manager selected, don't filter
    if (!selectedMode) return false;

    // Check if any interview with the selected mode is scheduled
    return candidate.interviews_list.some(
      (interview) => interview.mode === selectedMode && interview.status === 'scheduled'
    );
  };

  // Filter JD list based on search
  const filteredJDs = jdList.filter(
    (jd) =>
      jd.title?.toLowerCase().includes(jdSearch.toLowerCase()) ||
      jd.location?.toLowerCase().includes(jdSearch.toLowerCase())
  );

  // Separate candidates into available and scheduled based on manager type
  const availableCandidates = candidateList.filter((c) => {
    const matchesSearch = c.applicant_name.toLowerCase().includes(candidateSearch.toLowerCase());
    const notScheduled = !hasScheduledInterviewForType(c);
    return matchesSearch && notScheduled;
  });

  const scheduledCandidates = candidateList.filter((c) => {
    const matchesSearch = c.applicant_name.toLowerCase().includes(candidateSearch.toLowerCase());
    const isScheduled = hasScheduledInterviewForType(c);
    return matchesSearch && isScheduled;
  });

  const totalPages = Math.ceil(availableCandidates.length / perPage);
  const startIndex = (page - 1) * perPage;
  const paginatedCandidates = availableCandidates.slice(
    startIndex,
    startIndex + perPage
  );

  const totalScheduledPages = Math.ceil(scheduledCandidates.length / perPage);
  const scheduledStartIndex = (scheduledPage - 1) * perPage;
  const paginatedScheduledCandidates = scheduledCandidates.slice(
    scheduledStartIndex,
    scheduledStartIndex + perPage
  );

  const handleCandidateSelect = (candidate) => {
    if (selectedCandidate?.id === candidate.id) {
      setSelectedCandidate(null);
    } else {
      setSelectedCandidate(candidate);
    }
    resetAvailability();
  };

  const resetJD = () => {
    setSelectedJD(null);
    setJdSearch("");
    setPage(1);
    setScheduledPage(1);
    setSelectedCandidate(null);
  };

  const resetCandidateSearch = () => {
    setCandidateSearch("");
    setPage(1);
    setScheduledPage(1);
  };

  const resetAvailability = () => {
    setAvailableSlots({});
    setSelectedSlot(null);
    setSentToManager(false);
    setSentToCandidate(false);
    setInterviewerId("");
    setInterviewerName("");
    setBookedInterviewData(null);
  };

  // Reset availability when right side inputs change
  useEffect(() => {
    resetAvailability();
  }, [manager, hmEmail, fromDate, toDate, duration]);

  // Reset pagination and selected candidate when manager type changes
  useEffect(() => {
    setPage(1);
    setScheduledPage(1);
    if (selectedCandidate && hasScheduledInterviewForType(selectedCandidate)) {
      setSelectedCandidate(null);
    }
  }, [manager]);

  const handleJDSelect = (jd) => {
    setSelectedJD(jd);
    setDropdownOpen(false);
    setJdSearch(jd.title);
    setPage(1);
    setScheduledPage(1);
    setCandidateSearch("");
    setSelectedCandidate(null);
  };

  // Helper function to format the Firestore timestamp
  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp._seconds) return "N/A";
    return new Date(timestamp._seconds * 1000).toLocaleDateString("en-CA");
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata"
    });
  };

  // Fetch availability slots from API
  const fetchAvailability = async () => {
    try {
      setAvailabilityLoading(true);

      // Map manager selection to correct mode
      const modeMap = {
        'Hiring Manager': 'Whm',
        'Human Resource': 'Whr',
        'Additional Round Manager': 'Whm'
      };

      const selectedOption = modeMap[manager];

      if (!selectedOption) {
        alert('Please select a valid manager type');
        return;
      }

      const response = await axios.post("/api/calender/slots", {
        interviewer_email: hmEmail,
        startDate: fromDate,
        endDate: toDate,
        duration: parseInt(duration),
        selectedOption: selectedOption
      });

      if (response.data.success) {
        setAvailableSlots(response.data.availableSlots || {});
        setInterviewerId(response.data.interviewer.id);
        setInterviewerName(response.data.interviewer.name);
        setSelectedSlot(null);
        setSentToManager(false);
        setSentToCandidate(false);

        if (Object.keys(response.data.availableSlots || {}).length === 0) {
          alert("No available slots found for the selected date range.");
        }
      } else {
        alert("Failed to fetch availability");
        setAvailableSlots({});
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      alert(error.response?.data?.error || "Failed to fetch availability. Please try again.");
      setAvailableSlots({});
    } finally {
      setAvailabilityLoading(false);
    }
  };


  const isFormComplete = manager && hmEmail && fromDate && toDate && duration;

  const handleBookInterview = async () => {
    try {
      setBookingLoading(true);

      // Map manager selection to correct mode
      const modeMap = {
        'Hiring Manager': 'Whm',
        'Human Resource': 'Whr',
        'Additional Round Manager': 'Whm' // Additional rounds use same as HM
      };

      const selectedOption = modeMap[manager];

      if (!selectedOption) {
        alert('Please select a valid manager type');
        return;
      }

      const response = await axios.post("/api/calender/book", {
        interviewer_email: hmEmail,
        interviewer_id: interviewerId,
        application_id: selectedCandidate.id,
        job_id: selectedJD.id,
        candidate_email: selectedCandidate.applicant_email,
        candidate_name: selectedCandidate.applicant_name,
        candidate_id: selectedCandidate.candidate_id || null,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        mode: selectedOption,
        send_to: "both"
      });

      if (response.data.success) {
        setBookedInterviewData({
          interviewId: response.data.interview_id,
          meetingLink: response.data.meeting_link,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          managerType: manager,
          managerEmail: hmEmail,
          managerName: interviewerName,
          candidateEmail: selectedCandidate.applicant_email,
          candidateName: selectedCandidate.applicant_name,
          jobTitle: selectedJD.title,
          message: response.data.message
        });
        alert(`Interview booked successfully! ${response.data.message}`);
      } else {
        alert("Failed to book interview");
      }
    } catch (error) {
      console.error("Error booking interview:", error);

      if (error.response?.status === 409) {
        alert("This slot is no longer available. Please select another slot.");
        fetchAvailability();
      } else {
        alert(error.response?.data?.error || "Failed to book interview. Please try again.");
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const sendEmailNotification = async (recipient) => {
    try {
      setEmailLoading(true);

      const isManager = recipient === "manager";
      const recipientEmail = isManager ? bookedInterviewData.managerEmail : bookedInterviewData.candidateEmail;
      const recipientName = isManager ? bookedInterviewData.managerName : bookedInterviewData.candidateName;

      const emailSubject = isManager
        ? `Interview Scheduled - ${bookedInterviewData.candidateName} for ${bookedInterviewData.jobTitle}`
        : `Interview Scheduled - ${bookedInterviewData.jobTitle}`;

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
            .detail-row { margin: 15px 0; padding: 10px; background-color: white; border-left: 3px solid #4F46E5; }
            .detail-label { font-weight: bold; color: #4F46E5; }
            .button { display: inline-block; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Interview Scheduled</h2>
            </div>
            <div class="content">
              <p>Dear ${recipientName},</p>
              
              <p>An interview has been scheduled with the following details:</p>
              
              <div class="detail-row">
                <span class="detail-label">Position:</span> ${bookedInterviewData.jobTitle}
              </div>
              
              <div class="detail-row">
                <span class="detail-label">${isManager ? 'Candidate' : 'Interviewer'}:</span> ${isManager ? bookedInterviewData.candidateName : bookedInterviewData.managerName}
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Email:</span> ${isManager ? bookedInterviewData.candidateEmail : bookedInterviewData.managerEmail}
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Date & Time:</span> ${formatDateTime(bookedInterviewData.startTime)}
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Duration:</span> ${duration} minutes
              </div>
              
              ${bookedInterviewData.meetingLink ? `
                <div style="text-align: center;">
                  <a href="${bookedInterviewData.meetingLink}" class="button">Join Meeting</a>
                </div>
              ` : ''}
              
              <p style="margin-top: 20px;">Please make sure to be available at the scheduled time. If you need to reschedule, please contact us as soon as possible.</p>
              
              <p>Best regards,<br>Recruitment Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply directly to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const response = await axios.post("/api/Notification/Email", {
        to: recipientEmail,
        subject: emailSubject,
        html: emailHtml,
        text: `Interview scheduled for ${bookedInterviewData.jobTitle} on ${formatDateTime(bookedInterviewData.startTime)}`
      });

      if (response.data.message) {
        alert(`Email sent successfully to ${isManager ? bookedInterviewData.managerType : 'Candidate'}!`);
        if (isManager) {
          setSentToManager(true);
        } else {
          setSentToCandidate(true);
        }
        setEmailSendingTo(null);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert(`Failed to send email: ${error.response?.data?.error || error.message}`);
    } finally {
      setEmailLoading(false);
    }
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    setEmailSendingTo(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Email Modal */}
      {showEmailModal && bookedInterviewData && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Send Email Notification</h3>

            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">✓ Interview booked successfully!</p>
              <p className="text-xs text-gray-600 mt-1">Interview ID: {bookedInterviewData.interviewId}</p>
            </div>

            <p className="text-sm text-gray-600 mb-4">Who would you like to notify about this interview?</p>

            <div className="space-y-3">
              <button
                onClick={() => sendEmailNotification("manager")}
                disabled={emailLoading || sentToManager}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition ${sentToManager
                  ? "bg-gray-100 border-gray-300 cursor-not-allowed"
                  : "bg-white border-green-500 hover:bg-green-50"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">
                      {sentToManager ? "✓ Sent to " : "Send to "}{bookedInterviewData.managerType}
                    </p>
                    <p className="text-xs text-gray-500">{bookedInterviewData.managerEmail}</p>
                  </div>
                  {emailLoading && emailSendingTo === "manager" && (
                    <span className="text-xs text-blue-600">Sending...</span>
                  )}
                </div>
              </button>

              <button
                onClick={() => sendEmailNotification("candidate")}
                disabled={emailLoading || sentToCandidate}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition ${sentToCandidate
                  ? "bg-gray-100 border-gray-300 cursor-not-allowed"
                  : "bg-white border-purple-500 hover:bg-purple-50"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">
                      {sentToCandidate ? "✓ Sent to " : "Send to "}Candidate
                    </p>
                    <p className="text-xs text-gray-500">{bookedInterviewData.candidateEmail}</p>
                  </div>
                  {emailLoading && emailSendingTo === "candidate" && (
                    <span className="text-xs text-blue-600">Sending...</span>
                  )}
                </div>
              </button>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={closeEmailModal}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition"
              >
                Close
              </button>
              {(sentToManager || sentToCandidate) && (
                <button
                  onClick={() => {
                    closeEmailModal();
                    resetAvailability();
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* JD Selection */}
      <div
        className="bg-white w-full border border-gray-200 rounded-lg p-4 relative"
        ref={dropdownRef}
      >
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select JD
        </label>
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

      {/* Main layout */}
      {selectedJD && (
        <div className="flex gap-4">
          {/* Candidate List */}
          <div
            className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm min-h-[360px] flex flex-col transition-all ${selectedCandidate ? "w-1/2" : "w-full"
              }`}
          >
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="text-sm font-semibold text-gray-800">
                Available Candidates for {selectedJD.title}
                {manager && ` (${manager})`}
              </h3>
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

            {!manager && (
              <div className="flex-1 flex items-center justify-center text-amber-600 text-sm bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p>Please select a Manager type to filter candidates</p>
              </div>
            )}

            {manager && candidatesLoading ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                Loading candidates...
              </div>
            ) : manager && availableCandidates.length > 0 ? (
              <>
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
                          <span className="text-sm font-medium text-gray-800">
                            {c.applicant_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {selectedJD.title} • Applied on:{" "}
                            {formatDate(c.applied_at)}
                          </span>
                        </div>
                      </div>
                    </label>
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
            ) : manager ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                <p>
                  {candidateSearch
                    ? "No available candidates found matching your search."
                    : "No available candidates for this manager type."}
                </p>
              </div>
            ) : null}
          </div>

          {/* Right Side Card */}
          {selectedCandidate && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm w-1/2">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {selectedCandidate.applicant_name} – {selectedJD.title}
              </h3>

              {/* Manager dropdown & Email */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <select
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Select Manager</option>
                  {managerOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
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
                <input
                  type="date"
                  value={fromDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="date"
                  value={toDate}
                  min={fromDate || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setToDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Duration</option>
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="60">60 min</option>
                  <option value="120">120 min</option>
                </select>
              </div>

              {/* Get Availability */}
              {isFormComplete && Object.keys(availableSlots).length === 0 && (
                <button
                  type="button"
                  onClick={fetchAvailability}
                  disabled={availabilityLoading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg px-4 py-2 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {availabilityLoading ? "Fetching..." : "Get Availability"}
                </button>
              )}

              {/* Show Slots */}
              {Object.keys(availableSlots).length > 0 && (
                <div className="mt-4 space-y-4 max-h-64 overflow-y-auto">
                  {Object.entries(availableSlots).map(([date, slots]) => (
                    <div key={date}>
                      <p className="font-medium text-gray-700 mb-2">{date}</p>
                      <div className="flex gap-2 flex-wrap">
                        {slots.map((slot, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedSlot({
                              date,
                              slot: slot.time,
                              startTime: slot.startTime,
                              endTime: slot.endTime
                            })}
                            className={`px-3 py-1 rounded-lg border text-sm ${selectedSlot?.startTime === slot.startTime
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 hover:bg-gray-200"
                              }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Book Interview or Send Email Buttons */}
              {selectedSlot && (
                <div className="mt-4">
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Selected Slot:</p>
                    <p className="text-xs text-blue-600 mt-1">
                      {selectedSlot.date} at {selectedSlot.slot}
                    </p>
                  </div>

                  {/* Show Book button if not booked yet */}
                  {!bookedInterviewData && (
                    <button
                      onClick={handleBookInterview}
                      disabled={bookingLoading}
                      className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg px-4 py-2 transition disabled:bg-green-300 disabled:cursor-not-allowed"
                    >
                      {bookingLoading ? "Booking..." : "Book Interview"}
                    </button>
                  )}

                  {/* Show email buttons after booking */}
                  {bookedInterviewData && (
                    <div className="space-y-2">
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
                        <p className="text-sm text-green-800 font-medium">✓ Interview Booked!</p>
                        <p className="text-xs text-gray-600 mt-1">ID: {bookedInterviewData.interviewId}</p>
                      </div>

                      <button
                        onClick={() => sendEmailNotification("manager")}
                        disabled={emailLoading || sentToManager}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition ${sentToManager
                          ? "bg-gray-100 border-gray-300 cursor-not-allowed"
                          : "bg-white border-green-500 hover:bg-green-50"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">
                              {sentToManager ? "✓ Sent to " : "Send to "}{bookedInterviewData.managerType}
                            </p>
                            <p className="text-xs text-gray-500">{bookedInterviewData.managerEmail}</p>
                          </div>
                          {emailLoading && (
                            <span className="text-xs text-blue-600">Sending...</span>
                          )}
                        </div>
                      </button>

                      <button
                        onClick={() => sendEmailNotification("candidate")}
                        disabled={emailLoading || sentToCandidate}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition ${sentToCandidate
                          ? "bg-gray-100 border-gray-300 cursor-not-allowed"
                          : "bg-white border-purple-500 hover:bg-purple-50"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">
                              {sentToCandidate ? "✓ Sent to " : "Send to "}Candidate
                            </p>
                            <p className="text-xs text-gray-500">{bookedInterviewData.candidateEmail}</p>
                          </div>
                          {emailLoading && (
                            <span className="text-xs text-blue-600">Sending...</span>
                          )}
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Already Scheduled Candidates Panel */}
      {selectedJD && manager && scheduledCandidates.length > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 shadow-sm min-h-[300px] flex flex-col">
          <div className="flex justify-between items-center mb-3 border-b border-green-200 pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="text-sm font-semibold text-green-800">
                Already Scheduled with {manager} ({scheduledCandidates.length})
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

export default Managers;