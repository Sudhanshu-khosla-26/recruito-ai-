"use client"
import React, { useState, useEffect, useMemo } from "react"
import { Calendar, Clock, Video, User, Building2, ChevronLeft, ChevronRight, Search, ExternalLink, FileText, CheckCircle, XCircle, AlertCircle, Edit, RefreshCw, Send } from "lucide-react"
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
    let base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
    if (variant === "scheduled") base += " bg-blue-100 text-blue-700"
    if (variant === "confirmed") base += " bg-green-100 text-green-700"
    if (variant === "completed") base += " bg-gray-100 text-gray-700"
    if (variant === "cancelled") base += " bg-red-100 text-red-700"
    if (variant === "in_progress") base += " bg-amber-100 text-amber-700"
    if (variant === "default") base += " bg-gray-100 text-gray-700"

    return <span className={`${base} ${className}`}>{children}</span>
}

// Stats Card Component
function StatsCard({ title, count, icon: Icon, color }) {
    return (
        <div className="bg-card border rounded-xl p-4 flex items-center gap-3">
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold">{count}</p>
            </div>
        </div>
    )
}

// Interview Detail Component
function InterviewDetail({ interview, onUpdate }) {
    const [isUpdating, setIsUpdating] = useState(false)
    const [showFeedbackForm, setShowFeedbackForm] = useState(false)
    const [showReschedule, setShowReschedule] = useState(false)

    // Feedback form state
    const [comments, setComments] = useState("")
    const [result, setResult] = useState("")
    const [suggestion, setSuggestion] = useState("")

    // Reschedule state
    const [newDate, setNewDate] = useState("")
    const [newStartTime, setNewStartTime] = useState("")
    const [newEndTime, setNewEndTime] = useState("")

    if (!interview) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                    <p className="text-sm text-muted-foreground">
                        Select an interview from the list to view details
                    </p>
                </div>
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

    const handleSubmitFeedback = async () => {
        if (!result) {
            alert("Please select a result before submitting")
            return
        }
        setIsUpdating(true)
        try {
            await onUpdate(interview.id, {
                status: "completed",
                result,
                comments,
                suggestion,
            })
            setComments("")
            setResult("")
            setSuggestion("")
            setShowFeedbackForm(false)
        } catch (error) {
            console.error("Error submitting feedback:", error)
            alert("Failed to submit feedback")
        } finally {
            setIsUpdating(false)
        }
    }

    const handleReschedule = async () => {
        if (!newDate || !newStartTime || !newEndTime) {
            alert("Please fill all reschedule fields")
            return
        }
        setIsUpdating(true)
        try {
            const startDateTime = new Date(`${newDate}T${newStartTime}`)
            const endDateTime = new Date(`${newDate}T${newEndTime}`)

            await onUpdate(interview.id, {
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                scheduled_at: new Date().toISOString(),
            })
            setShowReschedule(false)
            setNewDate("")
            setNewStartTime("")
            setNewEndTime("")
        } catch (error) {
            console.error("Error rescheduling interview:", error)
            alert("Failed to reschedule interview")
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="space-y-4 overflow-auto max-h-[calc(100vh-12rem)]">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-5 text-white">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h2 className="text-xl font-bold">{interview.candidate_name}</h2>
                        <p className="text-sm opacity-90">{interview.candidate_email}</p>
                    </div>
                    <Badge variant={interview.status || "default"}>
                        {interview.status?.replace("_", " ").toUpperCase() || "UNKNOWN"}
                    </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white/20 rounded-lg p-2">
                        <p className="text-xs opacity-75">Interview Mode</p>
                        <p className="font-semibold">{interview.mode === "Whm" ? "Hiring Manager" : "HR"}</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-2">
                        <p className="text-xs opacity-75">Application ID</p>
                        <p className="font-semibold font-mono text-xs">{interview.application_id?.slice(0, 8)}...</p>
                    </div>
                </div>
            </div>

            {/* Date & Time Card */}
            <div className="bg-card border rounded-xl p-4">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule Details
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-accent rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Date</p>
                        <p className="text-sm font-semibold">{formatDate(interview.start_time)}</p>
                    </div>
                    <div className="bg-accent rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Time</p>
                        <p className="text-sm font-semibold">
                            {formatTime(interview.start_time)} - {formatTime(interview.end_time)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons based on Status */}
            {interview.status === "scheduled" || interview.status === "confirmed" ? (
                <div className="space-y-3">
                    {canStartInterview() ? (
                        <Button
                            variant="solid"
                            className="w-full gap-2"
                            onClick={handleStartInterview}
                            disabled={isUpdating}
                        >
                            <Video className="h-4 w-4" />
                            {isUpdating ? "Starting..." : "Join Interview Now"}
                        </Button>
                    ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <p className="text-xs text-amber-800">
                                Interview can be joined 15 minutes before scheduled time
                            </p>
                        </div>
                    )}

                    <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => setShowReschedule(!showReschedule)}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Reschedule Interview
                    </Button>

                    {showReschedule && (
                        <div className="bg-accent rounded-xl p-4 space-y-3">
                            <h4 className="text-sm font-semibold">Reschedule Interview</h4>
                            <div className="space-y-2">
                                <div>
                                    <label className="text-xs font-semibold mb-1 block">New Date</label>
                                    <input
                                        type="date"
                                        className="w-full h-9 rounded-xl border border-input bg-card text-sm px-3"
                                        value={newDate}
                                        onChange={(e) => setNewDate(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs font-semibold mb-1 block">Start Time</label>
                                        <input
                                            type="time"
                                            className="w-full h-9 rounded-xl border border-input bg-card text-sm px-3"
                                            value={newStartTime}
                                            onChange={(e) => setNewStartTime(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold mb-1 block">End Time</label>
                                        <input
                                            type="time"
                                            className="w-full h-9 rounded-xl border border-input bg-card text-sm px-3"
                                            value={newEndTime}
                                            onChange={(e) => setNewEndTime(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <Button
                                    variant="solid"
                                    className="w-full gap-2"
                                    onClick={handleReschedule}
                                    disabled={isUpdating}
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Confirm Reschedule
                                </Button>
                            </div>
                        </div>
                    )}

                    {interview.meeting_link && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                            <p className="text-xs text-blue-700 mb-2 font-semibold">Meeting Link</p>
                            <a
                                href={interview.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline flex items-center gap-1 break-all"
                            >
                                {interview.meeting_link}
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            </a>
                        </div>
                    )}
                </div>
            ) : interview.status === "in_progress" ? (
                <div className="space-y-3">
                    <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-4 text-center">
                        <div className="inline-flex items-center gap-2 text-emerald-700 font-semibold mb-2">
                            <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse"></div>
                            Interview in Progress
                        </div>
                    </div>

                    <Button
                        variant="solid"
                        className="w-full gap-2"
                        onClick={() => interview.meeting_link && window.open(interview.meeting_link, "_blank")}
                    >
                        <Video className="h-4 w-4" />
                        Rejoin Meeting
                    </Button>

                    <Button
                        variant="warning"
                        className="w-full gap-2"
                        onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                    >
                        <Send className="h-4 w-4" />
                        Submit Feedback & Complete
                    </Button>

                    {showFeedbackForm && (
                        <div className="bg-accent rounded-xl p-4 space-y-3">
                            <h4 className="text-sm font-semibold">Interview Feedback</h4>

                            <div>
                                <label className="text-xs font-semibold mb-1 block">Result *</label>
                                <select
                                    className="w-full h-9 rounded-xl border border-input bg-card text-sm px-3"
                                    value={result}
                                    onChange={(e) => setResult(e.target.value)}
                                >
                                    <option value="">Select Result</option>
                                    <option value="selected">✅ Selected</option>
                                    <option value="rejected">❌ Rejected</option>
                                    <option value="on_hold">⏸️ On Hold</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold mb-1 block">Suggestion</label>
                                <select
                                    className="w-full h-9 rounded-xl border border-input bg-card text-sm px-3"
                                    value={suggestion}
                                    onChange={(e) => setSuggestion(e.target.value)}
                                >
                                    <option value="">Select Suggestion</option>
                                    <option value="proceed_to_next_round">Proceed to Next Round</option>
                                    <option value="needs_improvement">Needs Improvement</option>
                                    <option value="excellent_candidate">Excellent Candidate</option>
                                    <option value="not_suitable">Not Suitable</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold mb-1 block">Comments</label>
                                <textarea
                                    className="w-full rounded-xl border border-input bg-card text-sm px-3 py-2 outline-none resize-none"
                                    rows="4"
                                    placeholder="Provide detailed feedback about the candidate's performance..."
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                />
                            </div>

                            <Button
                                variant="solid"
                                className="w-full gap-2"
                                onClick={handleSubmitFeedback}
                                disabled={isUpdating || !result}
                            >
                                <CheckCircle className="h-4 w-4" />
                                {isUpdating ? "Submitting..." : "Submit Feedback"}
                            </Button>
                        </div>
                    )}
                </div>
            ) : interview.status === "completed" ? (
                <div className="space-y-3">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-semibold">Interview Completed</span>
                        </div>
                        {interview.result && (
                            <div className="bg-white/20 rounded-lg p-2 mt-2">
                                <span className="text-xs opacity-75">Result: </span>
                                <span className="font-bold capitalize">{interview.result}</span>
                            </div>
                        )}
                    </div>

                    {interview.suggestion && (
                        <div className="bg-card border rounded-xl p-4">
                            <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Suggestion</h4>
                            <p className="text-sm capitalize">{interview.suggestion.replace(/_/g, ' ')}</p>
                        </div>
                    )}

                    {interview.comments && (
                        <div className="bg-card border rounded-xl p-4">
                            <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Comments</h4>
                            <p className="text-sm text-gray-700">{interview.comments}</p>
                        </div>
                    )}

                    {interview.started_at && (
                        <div className="bg-accent rounded-xl p-3 text-xs">
                            <span className="text-muted-foreground">Started At: </span>
                            <span className="font-semibold">{new Date(interview.started_at).toLocaleString()}</span>
                        </div>
                    )}
                </div>
            ) : interview.status === "cancelled" ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-red-700">
                        <XCircle className="h-5 w-5" />
                        <span className="font-semibold">Interview Cancelled</span>
                    </div>
                </div>
            ) : null}

            {/* Additional Info Card */}
            <div className="bg-card border rounded-xl p-4">
                <h3 className="text-xs font-bold uppercase text-muted-foreground mb-3">Additional Information</h3>
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-dashed">
                        <span className="text-muted-foreground">Job ID:</span>
                        <span className="font-mono">{interview.job_id}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-dashed">
                        <span className="text-muted-foreground">Application ID:</span>
                        <span className="font-mono">{interview.application_id}</span>
                    </div>
                    {interview.google_event_id && (
                        <div className="flex justify-between py-1">
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

    // Calculate stats
    const stats = useMemo(() => {
        return {
            total: interviews.length,
            scheduled: interviews.filter(i => i.status === "scheduled" || i.status === "confirmed").length,
            inProgress: interviews.filter(i => i.status === "in_progress").length,
            completed: interviews.filter(i => i.status === "completed").length,
        }
    }, [interviews])

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
            if (response.status === 200) {
                await fetchInterviews()
            }
        } catch (error) {
            console.error("Error updating interview:", error)
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

    return (
        <div className="min-h-dvh py-2 text-xs">
            <div className="bg-card border rounded-xl p-4 md:p-5 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">My Interviews</h1>
                        <p className="text-sm text-muted-foreground">Manage and conduct your scheduled interviews</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatsCard title="Total" count={stats.total} icon={Calendar} color="bg-blue-100 text-blue-600" />
                    <StatsCard title="Scheduled" count={stats.scheduled} icon={Clock} color="bg-green-100 text-green-600" />
                    <StatsCard title="In Progress" count={stats.inProgress} icon={Video} color="bg-amber-100 text-amber-600" />
                    <StatsCard title="Completed" count={stats.completed} icon={CheckCircle} color="bg-gray-100 text-gray-600" />
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                        <Input
                            placeholder="🔍 Search by candidate name or email"
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
                            <option value="scheduled">📅 Scheduled</option>
                            <option value="confirmed">✅ Confirmed</option>
                            <option value="in_progress">🔴 In Progress</option>
                            <option value="completed">✔️ Completed</option>
                            <option value="cancelled">❌ Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <select
                            className="w-full h-9 rounded-xl border border-input bg-card text-sm px-3"
                            value={modeFilter}
                            onChange={(e) => setModeFilter(e.target.value)}
                        >
                            <option value="">All Modes</option>
                            <option value="Whm">👔 Hiring Manager</option>
                            <option value="Whr">👥 HR</option>
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
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
                                    <p className="text-xs text-muted-foreground">Loading interviews...</p>
                                </div>
                            </div>
                        ) : pageItems.length === 0 ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="text-center">
                                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-20" />
                                    <p className="text-xs text-muted-foreground">No interviews found</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3 overflow-auto">
                                {pageItems.map((interview) => {
                                    const selected = selectedInterviewId === interview.id
                                    return (
                                        <button
                                            key={interview.id}
                                            onClick={() => setSelectedInterviewId(interview.id)}
                                            className={`text-left bg-card border rounded-xl p-4 w-full transition-all hover:shadow-lg ${selected ? "ring-2 ring-emerald-500 border-transparent shadow-lg" : ""
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-sm">{interview.candidate_name}</h3>
                                                    <p className="text-xs text-muted-foreground">{interview.candidate_email}</p>
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
                        <div className="flex items-center justify-between mt-auto pt-4">
                            <p className="text-xs text-muted-foreground">
                                Showing {pageItems.length} of {filtered.length}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                    {page} / {totalPages}
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
                    </div>

                    {/* Right: Interview Details */}
                    <div className="bg-card border rounded-xl p-5">
                        <InterviewDetail
                            interview={interviews.find((i) => i.id === selectedInterviewId)}
                            onUpdate={handleUpdateInterview}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}