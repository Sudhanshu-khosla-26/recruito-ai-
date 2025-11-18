"use client"
import React, { useState, useEffect, useMemo } from "react"
import { Calendar, Clock, Video, User, Building2, ChevronLeft, ChevronRight, Search, ExternalLink, FileText, CheckCircle, XCircle, AlertCircle, ArrowLeft, RefreshCw, MessageSquare } from "lucide-react"
import axios from "axios"

// Helper Components
function Input(props) {
    return (
        <input
            {...props}
            className={
                "w-full h-9 rounded-xl border bg-card text-sm px-3 outline-none transition-colors " +
                "border-input focus:ring-1 ring-ring focus:border-ring " +
                (props.className || "")
            }
        />
    )
}

function Button({
    children,
    variant = "solid",
    size = "default",
    className = "",
    ...props
}) {
    let base = "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
    if (variant === "solid") base += " bg-emerald-500 text-white hover:bg-emerald-600"
    if (variant === "outline") base += " border border-input bg-card hover:bg-accent"
    if (variant === "ghost") base += " text-emerald-600 hover:bg-accent"
    if (variant === "danger") base += " bg-red-500 text-white hover:bg-red-600"
    if (variant === "warning") base += " bg-amber-500 text-white hover:bg-amber-600"
    if (size === "icon") base += " h-9 w-9"
    else if (size === "sm") base += " h-8 px-3 text-xs"
    else base += " h-9 px-4 text-sm"

    return (
        <button className={`${base} ${className}`} {...props}>
            {children}
        </button>
    )
}

function Badge({ children, variant = "default", className = "" }) {
    let base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-2xs font-semibold"
    if (variant === "scheduled") base += " bg-blue-100 text-blue-700"
    if (variant === "confirmed") base += " bg-green-100 text-green-700"
    if (variant === "completed") base += " bg-gray-100 text-gray-700"
    if (variant === "cancelled") base += " bg-red-100 text-red-700"
    if (variant === "in_progress") base += " bg-amber-100 text-amber-700"
    if (variant === "rescheduled") base += " bg-purple-100 text-purple-700"
    if (variant === "pending") base += " bg-yellow-100 text-yellow-700"
    if (variant === "default") base += " bg-gray-100 text-gray-700"

    return <span className={`${base} ${className}`}>{children}</span>
}

// Reschedule Request Modal
function RescheduleRequestModal({ interview, onClose, onAccept, onReject }) {
    const [processing, setProcessing] = useState(false)
    const [rejectReason, setRejectReason] = useState("")
    const [showRejectForm, setShowRejectForm] = useState(false)

    const formatDateTime = (timestamp) => {
        if (!timestamp) return "N/A"
        const date = timestamp._seconds
            ? new Date(timestamp._seconds * 1000)
            : new Date(timestamp)
        return date.toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short"
        })
    }

    const handleAccept = async () => {
        setProcessing(true)
        try {
            await onAccept(interview.id)
            onClose()
        } catch (error) {
            console.error("Error accepting reschedule:", error)
            alert("Failed to accept reschedule request")
        } finally {
            setProcessing(false)
        }
    }

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            alert("Please provide a reason for rejection")
            return
        }
        setProcessing(true)
        try {
            await onReject(interview.id, rejectReason)
            onClose()
        } catch (error) {
            console.error("Error rejecting reschedule:", error)
            alert("Failed to reject reschedule request")
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Reschedule Request</h3>
                        <p className="text-xs text-gray-600 mt-1">
                            {interview.candidate_name} - {interview.candidate_email}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {/* Current Schedule */}
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Current Schedule</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {formatDateTime(interview.start_time)}
                        </div>
                    </div>

                    {/* Requested Schedule */}
                    {interview.requested_time && (
                        <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-blue-700 mb-2">Requested New Time</p>
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                                <Calendar className="w-4 h-4" />
                                {formatDateTime(interview.requested_time)}
                            </div>
                        </div>
                    )}

                    {/* Reason */}
                    {interview.reschedule_reason && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-xs font-semibold text-amber-700 mb-2">Candidate's Reason</p>
                            <p className="text-sm text-amber-800">{interview.reschedule_reason}</p>
                        </div>
                    )}

                    {/* Actions */}
                    {!showRejectForm ? (
                        <div className="flex gap-2">
                            <Button
                                variant="solid"
                                className="flex-1"
                                onClick={handleAccept}
                                disabled={processing}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {processing ? "Processing..." : "Accept Request"}
                            </Button>
                            <Button
                                variant="danger"
                                className="flex-1"
                                onClick={() => setShowRejectForm(true)}
                                disabled={processing}
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject Request
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">
                                    Reason for Rejection *
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    rows="3"
                                    placeholder="Explain why you're rejecting this request..."
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="danger"
                                    className="flex-1"
                                    onClick={handleReject}
                                    disabled={processing || !rejectReason.trim()}
                                >
                                    {processing ? "Processing..." : "Confirm Rejection"}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowRejectForm(false)
                                        setRejectReason("")
                                    }}
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Interview Detail Component
function InterviewDetail({ interview, onUpdate, onBack, onRescheduleRequest }) {
    const [isUpdating, setIsUpdating] = useState(false)
    const [comments, setComments] = useState("")
    const [result, setResult] = useState("")

    if (!interview) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <p className="text-xs text-muted-foreground text-center">
                    Select an interview from the list to view its details.
                </p>
            </div>
        )
    }

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A"
        const date = timestamp._seconds
            ? new Date(timestamp._seconds * 1000)
            : new Date(timestamp)
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const formatTime = (timestamp) => {
        if (!timestamp) return "N/A"
        const date = timestamp._seconds
            ? new Date(timestamp._seconds * 1000)
            : new Date(timestamp)
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const canStartInterview = () => {
        if (!interview.start_time) return false
        const now = new Date()
        const start = interview.start_time._seconds
            ? new Date(interview.start_time._seconds * 1000)
            : new Date(interview.start_time)
        const minutesDiff = (start - now) / (1000 * 60)
        return minutesDiff <= 15 && minutesDiff >= -60
    }

    const handleStartInterview = async () => {
        setIsUpdating(true)
        try {
            await onUpdate(interview.id, {
                status: "in_progress",
                started_at: new Date().toISOString(),
            })
            if (interview.meeting_link) {
                window.open(interview.meeting_link, "_blank")
            }
        } catch (error) {
            console.error("Error starting interview:", error)
            alert("Failed to start interview")
        } finally {
            setIsUpdating(false)
        }
    }

    const handleCompleteInterview = async () => {
        if (!result) {
            alert("Please select a result before completing")
            return
        }
        setIsUpdating(true)
        try {
            await onUpdate(interview.id, {
                status: "completed",
                result,
                comments,
            })
            setComments("")
            setResult("")
        } catch (error) {
            console.error("Error completing interview:", error)
            alert("Failed to complete interview")
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="space-y-4 overflow-auto max-h-[calc(100vh-12rem)]">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-lg font-bold">{interview.candidate_name}</h2>
                    <p className="text-xs text-muted-foreground">{interview.candidate_email}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div onClick={onBack} className="flex items-center gap-1 cursor-pointer text-sm hover:bg-gray-100 px-2 py-0 rounded-full">
                        <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                        back
                    </div>
                    <Badge variant={interview.status || "default"}>
                        {interview.status?.replace("_", " ").toUpperCase() || "UNKNOWN"}
                    </Badge>
                </div>
            </div>

            {/* Reschedule Request Alert */}
            {interview.status === "rescheduled" && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <RefreshCw className="w-5 h-5 text-purple-600 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-purple-800 mb-1">
                                Reschedule Request Pending
                            </p>
                            <p className="text-xs text-purple-700 mb-3">
                                The candidate has requested to reschedule this interview.
                            </p>
                            <Button
                                variant="warning"
                                size="sm"
                                onClick={() => onRescheduleRequest(interview)}
                            >
                                <RefreshCw className="w-3 h-3 mr-2" />
                                Review Request
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Interview Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-accent rounded-xl p-3 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                        <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="text-sm font-semibold">{formatDate(interview.start_time)}</p>
                    </div>
                </div>
                <div className="bg-accent rounded-xl p-3 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100">
                        <Clock className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Time</p>
                        <p className="text-sm font-semibold">
                            {formatTime(interview.start_time)} - {formatTime(interview.end_time)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Mode & Status */}
            <div className="bg-accent rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Interview Mode:</span>
                    <span className="text-sm font-semibold">{interview.mode === "Whm" ? "Hiring Manager" : "HR"}</span>
                </div>
                {interview.meeting_link && (
                    <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Meeting Link:</span>
                        <a
                            href={interview.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-emerald-600 hover:underline flex items-center gap-1"
                        >
                            Join Meeting <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                )}
            </div>

            {/* Reschedule History */}
            {(interview.reschedule_reason || interview.reschedule_count > 0) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-amber-600" />
                        <span className="text-xs font-semibold text-amber-800">Reschedule Information</span>
                    </div>
                    {interview.reschedule_reason && (
                        <div className="text-xs text-amber-700">
                            <span className="font-semibold">Reason: </span>
                            {interview.reschedule_reason}
                        </div>
                    )}
                    {interview.reschedule_count > 0 && (
                        <div className="text-xs text-amber-700">
                            <span className="font-semibold">Reschedule Count: </span>
                            {interview.reschedule_count}
                        </div>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
                {interview.status === "scheduled" || interview.status === "confirmed" ? (
                    <>
                        {canStartInterview() ? (
                            <Button
                                variant="solid"
                                className="w-full gap-2"
                                onClick={handleStartInterview}
                                disabled={isUpdating}
                            >
                                <Video className="h-4 w-4" />
                                {isUpdating ? "Starting..." : "Start Interview"}
                            </Button>
                        ) : (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                                <p className="text-xs text-amber-800">
                                    Interview can be started 15 minutes before scheduled time
                                </p>
                            </div>
                        )}
                    </>
                ) : interview.status === "in_progress" ? (
                    <div className="space-y-3">
                        <Button
                            variant="solid"
                            className="w-full gap-2"
                            onClick={() => interview.meeting_link && window.open(interview.meeting_link, "_blank")}
                        >
                            <Video className="h-4 w-4" />
                            Rejoin Meeting
                        </Button>

                        <div className="bg-accent rounded-xl p-4 space-y-3">
                            <label className="text-xs font-semibold">Interview Result</label>
                            <select
                                className="w-full h-9 rounded-xl border border-input bg-card text-sm px-3"
                                value={result}
                                onChange={(e) => setResult(e.target.value)}
                            >
                                <option value="">Select Result</option>
                                <option value="selected">Selected</option>
                                <option value="rejected">Rejected</option>
                                <option value="on_hold">On Hold</option>
                            </select>

                            <label className="text-xs font-semibold">Comments (Optional)</label>
                            <textarea
                                className="w-full rounded-xl border border-input bg-card text-sm px-3 py-2 outline-none resize-none"
                                rows="3"
                                placeholder="Add your feedback..."
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                            />

                            <Button
                                variant="solid"
                                className="w-full gap-2"
                                onClick={handleCompleteInterview}
                                disabled={isUpdating || !result}
                            >
                                <CheckCircle className="h-4 w-4" />
                                {isUpdating ? "Completing..." : "Complete Interview"}
                            </Button>
                        </div>
                    </div>
                ) : interview.status === "completed" ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-semibold text-green-800">Interview Completed</span>
                        </div>
                        {interview.result && (
                            <div className="text-xs">
                                <span className="text-muted-foreground">Result: </span>
                                <span className="font-semibold capitalize">{interview.result}</span>
                            </div>
                        )}
                        {interview.comments && (
                            <div className="text-xs">
                                <span className="text-muted-foreground">Comments: </span>
                                <p className="text-gray-700 mt-1">{interview.comments}</p>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            {/* Additional Details */}
            <div className="bg-accent rounded-xl p-4 space-y-2">
                <h3 className="text-xs font-bold uppercase text-muted-foreground">Additional Information</h3>
                <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Application ID:</span>
                        <span className="font-mono">{interview.application_id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Job ID:</span>
                        <span className="font-mono">{interview.job_id}</span>
                    </div>
                    {interview.google_event_id && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Google Event:</span>
                            <span className="font-mono text-xs">{interview.google_event_id.slice(0, 20)}...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Main Component
export default function HMInterviewsPage() {
    const [interviews, setInterviews] = useState([])
    const [selectedInterviewId, setSelectedInterviewId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showRescheduleModal, setShowRescheduleModal] = useState(false)
    const [selectedRescheduleInterview, setSelectedRescheduleInterview] = useState(null)

    // Filters
    const [query, setQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [modeFilter, setModeFilter] = useState("")

    // Pagination
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(6)

    const fetchInterviews = async () => {
        setLoading(true)
        try {
            const res = await axios.get("/api/Interviews/hm-hr-interviews")
            console.log("Interviews fetched:", res.data)
            const rawInterviews = res.data.interviews || []
            setInterviews(rawInterviews)
        } catch (error) {
            console.error("Error fetching interviews:", error)
            alert("Could not fetch interviews")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInterviews()
    }, [])

    const filtered = useMemo(() => {
        return interviews.filter((i) => {
            const matchesQuery =
                !query ||
                i.candidate_name?.toLowerCase().includes(query.toLowerCase()) ||
                i.candidate_email?.toLowerCase().includes(query.toLowerCase())
            const matchesStatus = !statusFilter || i.status === statusFilter
            const matchesMode = !modeFilter || i.mode === modeFilter
            return matchesQuery && matchesStatus && matchesMode
        })
    }, [interviews, query, statusFilter, modeFilter])

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))

    const pageItems = useMemo(() => {
        const start = (page - 1) * perPage
        return filtered.slice(start, start + perPage)
    }, [filtered, page, perPage])

    useEffect(() => {
        setPage(1)
    }, [query, statusFilter, modeFilter, perPage])

    const handleUpdateInterview = async (interviewId, data) => {
        try {
            const response = await axios.patch(`/api/Interviews/${interviewId}`, data)
            console.log("Interview updated:", response.data)
            if (response.status === 200) {
                await fetchInterviews()
            }
        } catch (error) {
            console.error("Error updating interview:", error)
            throw error
        }
    }

    const handleAcceptReschedule = async (interviewId) => {
        try {
            const response = await axios.post("/api/calender/accept", {
                interview_id: interviewId
            })
            console.log("Reschedule accepted:", response.data)
            alert("Reschedule request accepted successfully!")
            await fetchInterviews()
        } catch (error) {
            console.error("Error accepting reschedule:", error)
            throw error
        }
    }

    const handleRejectReschedule = async (interviewId, reason) => {
        try {
            const response = await axios.post("/api/Interviews/reschedule/reject", {
                interview_id: interviewId,
                admin_reason: reason
            })
            console.log("Reschedule rejected:", response.data)
            alert("Reschedule request rejected")
            await fetchInterviews()
        } catch (error) {
            console.error("Error rejecting reschedule:", error)
            throw error
        }
    }

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A"
        const date = timestamp._seconds
            ? new Date(timestamp._seconds * 1000)
            : new Date(timestamp)
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        })
    }

    const formatTime = (timestamp) => {
        if (!timestamp) return "N/A"
        const date = timestamp._seconds
            ? new Date(timestamp._seconds * 1000)
            : new Date(timestamp)
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const rescheduleRequestsCount = interviews.filter(i => i.status === "rescheduled").length

    return (
        <div className="min-h-dvh py-2 text-xs">
            {showRescheduleModal && selectedRescheduleInterview && (
                <RescheduleRequestModal
                    interview={selectedRescheduleInterview}
                    onClose={() => {
                        setShowRescheduleModal(false)
                        setSelectedRescheduleInterview(null)
                    }}
                    onAccept={handleAcceptReschedule}
                    onReject={handleRejectReschedule}
                />
            )}

            <div className="bg-card border rounded-xl p-4 md:p-5 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">My Interviews</h1>
                        <p className="text-xs text-muted-foreground">Manage and join your scheduled interviews</p>
                    </div>
                    {rescheduleRequestsCount > 0 && (
                        <div className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2">
                            <RefreshCw className="w-3 h-3" />
                            {rescheduleRequestsCount} Reschedule Request{rescheduleRequestsCount > 1 ? 's' : ''}
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                        <Input
                            placeholder="Search by candidate name or email"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <div>
                        <select
                            className="w-full h-9 rounded-xl border border-input bg-card text-sm px-3"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="rescheduled">Reschedule Requested</option>
                        </select>
                    </div>
                    <div>
                        <select
                            className="w-full h-9 rounded-xl border border-input bg-card text-sm px-3"
                            value={modeFilter}
                            onChange={(e) => setModeFilter(e.target.value)}
                        >
                            <option value="">All Modes</option>
                            <option value="Whm">Hiring Manager</option>
                            <option value="Whr">HR</option>
                        </select>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[60vh]">
                    {/* Left: Interviews List */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold">Interviews ({filtered.length})</h2>
                            <select
                                className="h-9 rounded-xl border border-input bg-card text-sm px-3"
                                value={perPage}
                                onChange={(e) => setPerPage(Number(e.target.value))}
                            >
                                {[6, 10, 15, 20].map((n) => (
                                    <option key={n} value={n}>
                                        Show {n}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <p className="text-xs text-muted-foreground">Loading interviews...</p>
                            </div>
                        ) : pageItems.length === 0 ? (
                            <div className="flex items-center justify-center h-40">
                                <p className="text-xs text-muted-foreground">No interviews found</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pageItems.map((interview) => {
                                    const selected = selectedInterviewId === interview.id
                                    const hasRescheduleRequest = interview.status === "rescheduled"

                                    return (
                                        <button
                                            key={interview.id}
                                            onClick={() => setSelectedInterviewId(interview.id)}
                                            className={`text-left bg-card border rounded-xl p-3 w-full transition-all hover:shadow-md relative ${selected ? "ring-2 ring-emerald-500 border-transparent" : ""
                                                } ${hasRescheduleRequest ? "border-purple-300" : ""}`}
                                        >
                                            {hasRescheduleRequest && (
                                                <div className="absolute top-2 right-2">
                                                    <RefreshCw className="h-4 w-4 text-purple-600" />
                                                </div>
                                            )}
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1 pr-6">
                                                    <h3 className="font-semibold text-sm">{interview.candidate_name}</h3>
                                                    <p className="text-xs text-muted-foreground truncate">{interview.candidate_email}</p>
                                                </div>
                                                <Badge variant={interview.status || "default"}>
                                                    {interview.status?.replace("_", " ") || "Unknown"}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(interview.start_time)}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatTime(interview.start_time)}
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="flex items-center justify-end gap-2 mt-auto pt-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-xs text-muted-foreground">
                                Page {page} | {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Right: Interview Details */}
                    <div className="bg-card border rounded-xl p-5">
                        <InterviewDetail
                            interview={interviews.find((i) => i.id === selectedInterviewId)}
                            onUpdate={handleUpdateInterview}
                            onBack={() => setSelectedInterviewId(null)}
                            onRescheduleRequest={(interview) => {
                                setSelectedRescheduleInterview(interview)
                                setShowRescheduleModal(true)
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}