"use client"

import { useState, useEffect } from 'react'
import { Calendar, Search, Clock, Video, Bot, X, AlertCircle, RefreshCw, CheckCircle, XCircle, User, ChevronDown, Loader2 } from 'lucide-react'

const CandidateInterviewDashboard = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [detailsInterview, setDetailsInterview] = useState(null)
    const [interviews, setInterviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(null)
    const [showRescheduleModal, setShowRescheduleModal] = useState(false)
    const [selectedInterview, setSelectedInterview] = useState(null)
    const [availableSlots, setAvailableSlots] = useState({})
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [selectedDate, setSelectedDate] = useState('')
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [rescheduleReason, setRescheduleReason] = useState('')
    const [notification, setNotification] = useState(null)
    const [activeTab, setActiveTab] = useState('upcoming')

    const getInterviewList = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/Interviews/candidate-interviews')
            const data = await response.json()

            if (response.ok) {
                setInterviews(data.interviews || [])
            } else {
                showNotification('Failed to load interviews', 'error')
            }
        } catch (error) {
            console.error("Error fetching interviews:", error)
            showNotification('Network error. Please try again.', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getInterviewList()
    }, [])

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 5000)
    }

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A'
        const date = new Date(timestamp._seconds * 1000)
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const getInterviewStatus = (interview) => {
        if (interview.mode === 'Wai') {
            return { canStart: true, message: 'Ready to start' }
        }

        const now = new Date()
        const startTime = getDateFromTimestamp(interview.start_time)
        const endTime = getDateFromTimestamp(interview.end_time)

        if (!startTime) return { canStart: false, message: 'Invalid time' }

        const timeDiff = (startTime - now) / (1000 * 60) // minutes

        if (timeDiff > 15) {
            return {
                canStart: false,
                message: `Interview starts in ${Math.floor(timeDiff)} minutes`,
                showDetails: true
            }
        } else if (timeDiff > 0) {
            return {
                canStart: true,
                message: 'Interview starting soon - You can join now!',
                urgent: true
            }
        } else if (now >= startTime && now <= endTime) {
            return {
                canStart: true,
                message: 'Interview is LIVE - Join now!',
                urgent: true,
                isLive: true
            }
        } else {
            return {
                canStart: false,
                message: 'Interview time has passed',
                showDetails: true
            }
        }
    }

    const getDateFromTimestamp = (timestamp) => {
        if (!timestamp) return null
        return timestamp._seconds
            ? new Date(timestamp._seconds * 1000)
            : timestamp.toDate?.() || new Date(timestamp)
    }

    const formatTime = (timestamp) => {
        if (!timestamp) return 'N/A'
        const date = new Date(timestamp._seconds * 1000)
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }

    const getDuration = (start, end) => {
        const startDate = getDateFromTimestamp(start)
        const endDate = getDateFromTimestamp(end)
        if (!startDate || !endDate) return "N/A"
        const diffMinutes = Math.floor((endDate - startDate) / 1000 / 60)
        return diffMinutes > 0 ? `${diffMinutes} min` : "N/A"
    }

    const formatDateTime = (timestamp) => {
        if (!timestamp) return 'N/A'
        return `${formatDate(timestamp)} at ${formatTime(timestamp)}`
    }

    const fetchAvailableSlots = async (interview) => {
        setLoadingSlots(true)
        try {
            const today = new Date()
            const endDate = new Date()
            endDate.setDate(today.getDate() + 14)

            const response = await fetch('/api/calender/slots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    interviewer_email: interview.hr_email || interview.hm_email,
                    startDate: today.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    duration: 30,
                    selectedOption: interview.mode === 'Whm' ? 'Whm' : 'Whr'
                })
            })

            const data = await response.json()

            if (response.ok && data.success) {
                setAvailableSlots(data.availableSlots || {})
            } else {
                showNotification('Failed to fetch available slots', 'error')
            }
        } catch (error) {
            console.error("Error fetching slots:", error)
            showNotification('Network error while fetching slots', 'error')
        } finally {
            setLoadingSlots(false)
        }
    }

    const handleAccept = async (interview) => {
        if (!confirm(`Confirm acceptance for interview on ${formatDateTime(interview.start_time)}?`)) return

        setActionLoading(interview.id)
        try {
            const response = await fetch('/api/Interviews/candidate/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ interview_id: interview.id })
            })

            const data = await response.json()

            if (response.ok) {
                showNotification('Interview accepted successfully!', 'success')
                await getInterviewList()
            } else {
                showNotification(data.error || 'Failed to accept interview', 'error')
            }
        } catch (error) {
            showNotification('Network error. Please try again.', 'error')
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (interview) => {
        const reason = prompt('Please provide a reason for rejection (optional):')
        if (reason === null) return

        setActionLoading(interview.id)
        try {
            const response = await fetch('/api/Interviews/candidate/reject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    interview_id: interview.id,
                    reason: reason || 'No reason provided'
                })
            })

            const data = await response.json()

            if (response.ok) {
                showNotification('Interview rejected successfully', 'success')
                await getInterviewList()
            } else {
                showNotification(data.error || 'Failed to reject interview', 'error')
            }
        } catch (error) {
            showNotification('Network error. Please try again.', 'error')
        } finally {
            setActionLoading(null)
        }
    }

    const openRescheduleModal = async (interview) => {
        setSelectedInterview(interview)
        setShowRescheduleModal(true)
        setSelectedDate('')
        setSelectedSlot(null)
        setRescheduleReason('')
        setAvailableSlots({})
        await fetchAvailableSlots(interview)
    }

    const handleRescheduleSubmit = async () => {
        if (!selectedSlot) {
            showNotification('Please select a time slot', 'error')
            return
        }

        if (!rescheduleReason.trim()) {
            showNotification('Please provide a reason for rescheduling', 'error')
            return
        }

        setActionLoading('reschedule')
        try {
            // Candidate requests reschedule - HR needs to approve
            const response = await fetch('/api/Interviews/candidate/reschedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    interview_id: selectedInterview.id,
                    new_scheduled_at: selectedSlot.startTime,
                    reason: rescheduleReason
                })
            })

            const data = await response.json()

            if (response.ok) {
                showNotification('Reschedule request sent to HR for approval!', 'success')
                setShowRescheduleModal(false)
                await getInterviewList()
            } else {
                showNotification(data.error || 'Failed to send reschedule request', 'error')
            }
        } catch (error) {
            showNotification('Network error. Please try again.', 'error')
        } finally {
            setActionLoading(null)
        }
    }

    const getInterviewsByStatus = () => {
        const upcoming = interviews.filter(i =>
            ['scheduled', 'pending', 'confirmed', 'rescheduled'].includes(i.status)
        )
        const completed = interviews.filter(i =>
            ['completed', 'cancelled', 'rejected'].includes(i.status)
        )
        return { upcoming, completed }
    }

    const { upcoming, completed } = getInterviewsByStatus()

    const displayInterviews = activeTab === 'upcoming' ? upcoming : completed.filter(interview => {
        if (!searchQuery) return true
        const searchLower = searchQuery.toLowerCase()
        return (
            interview.candidate_name?.toLowerCase().includes(searchLower) ||
            interview.candidate_email?.toLowerCase().includes(searchLower) ||
            interview.mode?.toLowerCase().includes(searchLower)
        )
    })

    const getInterviewTypeInfo = (mode) => {
        switch (mode) {
            case 'Wai': return { label: 'AI Interview', icon: Bot, color: 'from-purple-500 to-purple-600' }
            case 'Whr': return { label: 'HR Interview', icon: User, color: 'from-blue-500 to-blue-600' }
            case 'Whm': return { label: 'Hiring Manager', icon: User, color: 'from-green-500 to-green-600' }
            default: return { label: 'Interview', icon: Calendar, color: 'from-gray-500 to-gray-600' }
        }
    }

    const getStatusBadge = (status) => {
        const badges = {
            scheduled: { label: 'Scheduled', class: 'bg-blue-100 text-blue-700' },
            pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-700' },
            confirmed: { label: 'Confirmed', class: 'bg-green-100 text-green-700' },
            completed: { label: 'Completed', class: 'bg-gray-100 text-gray-700' },
            cancelled: { label: 'Cancelled', class: 'bg-red-100 text-red-700' },
            rejected: { label: 'Rejected', class: 'bg-red-100 text-red-700' },
            rescheduled: { label: 'Rescheduled', class: 'bg-purple-100 text-purple-700' }
        }
        return badges[status?.toLowerCase()] || badges.scheduled
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading interviews...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    } text-white max-w-sm`}>
                    {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="text-sm font-medium">{notification.message}</span>
                </div>
            )}

            {/* Reschedule Modal */}
            {showRescheduleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Request Reschedule</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Current: {formatDateTime(selectedInterview?.start_time)}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    Select your preferred slot - HR will review your request
                                </p>
                            </div>
                            <button
                                onClick={() => setShowRescheduleModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {loadingSlots ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                                </div>
                            ) : Object.keys(availableSlots).length === 0 ? (
                                <div className="text-center py-8">
                                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-600">No available slots found</p>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Select Date
                                        </label>
                                        <select
                                            value={selectedDate}
                                            onChange={(e) => {
                                                setSelectedDate(e.target.value)
                                                setSelectedSlot(null)
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Choose a date...</option>
                                            {Object.keys(availableSlots).map(date => (
                                                <option key={date} value={date}>
                                                    {date} ({availableSlots[date].length} slots)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {selectedDate && availableSlots[selectedDate] && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Select Time Slot
                                            </label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                                                {availableSlots[selectedDate].map((slot, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setSelectedSlot(slot)}
                                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedSlot === slot
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {slot.time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Reason for Rescheduling *
                                        </label>
                                        <textarea
                                            value={rescheduleReason}
                                            onChange={(e) => setRescheduleReason(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            rows="3"
                                            placeholder="Please explain why you need to reschedule..."
                                        />
                                    </div>

                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
                                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                        <p className="text-xs text-amber-800">
                                            Your reschedule request will be sent to HR for approval. You'll be notified once it's reviewed.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleRescheduleSubmit}
                                        disabled={actionLoading === 'reschedule' || !selectedSlot}
                                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {actionLoading === 'reschedule' ? (
                                            <>
                                                <Loader2 className="animate-spin h-5 w-5" />
                                                Sending Request...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="w-5 h-5" />
                                                Request Reschedule
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Interview Details Modal */}
            {showDetailsModal && detailsInterview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold">Interview Details</h3>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="text-white hover:bg-white/20 rounded-lg p-1"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3 pb-3 border-b">
                                {getInterviewTypeInfo(detailsInterview.mode).icon === Bot ? (
                                    <Bot className="w-10 h-10 text-purple-600" />
                                ) : (
                                    <User className="w-10 h-10 text-blue-600" />
                                )}
                                <div>
                                    <h4 className="font-bold text-gray-800">
                                        {getInterviewTypeInfo(detailsInterview.mode).label}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        {detailsInterview.mode === 'Wai'
                                            ? 'AI Assessment'
                                            : detailsInterview.hr_email || detailsInterview.hm_email}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500">Date</p>
                                        <p className="font-semibold text-gray-800">
                                            {detailsInterview.mode === 'Wai'
                                                ? formatDate(detailsInterview.scheduled_at || detailsInterview.created_at)
                                                : formatDate(detailsInterview.start_time)}
                                        </p>
                                    </div>
                                </div>

                                {detailsInterview.mode !== 'Wai' && (
                                    <div className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-green-500 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500">Time</p>
                                            <p className="font-semibold text-gray-800">
                                                {formatTime(detailsInterview.start_time)} - {formatTime(detailsInterview.end_time)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-purple-500 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500">Duration</p>
                                        <p className="font-semibold text-gray-800">
                                            {detailsInterview.mode === 'Wai'
                                                ? `${detailsInterview.duration_minutes || 30} minutes`
                                                : getDuration(detailsInterview.start_time, detailsInterview.end_time)}
                                        </p>
                                    </div>
                                </div>

                                {detailsInterview.mode !== 'Wai' && (() => {
                                    const status = getInterviewStatus(detailsInterview)
                                    return (
                                        <div className={`p-3 rounded-lg border ${status.urgent
                                            ? 'bg-red-50 border-red-200'
                                            : status.canStart
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-yellow-50 border-yellow-200'
                                            }`}>
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className={`w-5 h-5 ${status.urgent ? 'text-red-600' : 'text-yellow-600'
                                                    }`} />
                                                <p className={`text-sm font-semibold ${status.urgent ? 'text-red-800' : 'text-yellow-800'
                                                    }`}>
                                                    {status.message}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })()}
                            </div>

                            <div className="flex gap-2 pt-4">
                                {detailsInterview.mode === 'Wai' ? (
                                    <a
                                        href={`/interview/${detailsInterview.id}/start`}
                                        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg text-sm font-bold hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <Bot className="w-5 h-5" />
                                        Start AI Interview
                                    </a>
                                ) : (
                                    <>
                                        {getInterviewStatus(detailsInterview).canStart && detailsInterview.meeting_link ? (
                                            <a
                                                href={detailsInterview.meeting_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg text-sm font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                            >
                                                <Video className="w-5 h-5" />
                                                {getInterviewStatus(detailsInterview).isLive ? 'Join Now (LIVE)' : 'Join Meeting'}
                                            </a>
                                        ) : (
                                            <button
                                                disabled
                                                className="flex-1 bg-gray-300 text-gray-600 py-3 rounded-lg text-sm font-bold cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                <Video className="w-5 h-5" />
                                                Not Available Yet
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div >
            )
            }

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">My Interviews</h1>
                    <p className="text-gray-600 text-sm mt-1">Manage your interview schedule</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-xs mb-1">Upcoming</p>
                                <p className="text-2xl font-bold text-blue-600">{upcoming.length}</p>
                            </div>
                            <Calendar className="w-8 h-8 text-blue-600 opacity-20" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-xs mb-1">Completed</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {completed.filter(i => i.status === 'completed').length}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600 opacity-20" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-xs mb-1">Total</p>
                                <p className="text-2xl font-bold text-purple-600">{interviews.length}</p>
                            </div>
                            <Clock className="w-8 h-8 text-purple-600 opacity-20" />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'upcoming'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Upcoming ({upcoming.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'history'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            History ({completed.length})
                        </button>
                    </div>

                    {activeTab === 'history' && (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-48 px-3 py-2 pl-9 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        </div>
                    )}
                </div>

                {/* Content */}
                {displayInterviews.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                            {activeTab === 'upcoming' ? 'No upcoming interviews' : 'No interview history'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayInterviews.map((interview) => {
                            const typeInfo = getInterviewTypeInfo(interview.mode)
                            const statusBadge = getStatusBadge(interview.status)
                            const TypeIcon = typeInfo.icon

                            return (
                                <div
                                    key={interview.id}
                                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden"
                                >
                                    <div className={`bg-gradient-to-r ${typeInfo.color} p-4 text-white`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <TypeIcon className="w-6 h-6" />
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge.class}`}>
                                                {statusBadge.label}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-sm">{typeInfo.label}</h3>
                                        <p className="text-xs opacity-90 truncate mt-1">
                                            {interview.mode === 'Wai' ? 'AI Assessment' : interview.hr_email || 'HR Team'}
                                        </p>
                                    </div>

                                    <div className="p-4 space-y-3">
                                        <div className="space-y-1.5 text-xs">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                                <span className="font-medium">
                                                    {interview.mode === 'Wai'
                                                        ? formatDate(interview?.scheduled_at || interview?.created_at)
                                                        : formatDate(interview?.start_time)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Clock className="w-3.5 h-3.5 text-green-500" />
                                                <span>
                                                    {interview.mode === 'Wai'
                                                        ? `${interview?.duration_minutes || 30} min`
                                                        : getDuration(interview.start_time, interview.end_time)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Confirmed Status Badge */}
                                        {interview.status === 'confirmed' && (
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                                                <p className="text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Interview Confirmed
                                                </p>
                                                {interview.mode === 'Wai' ? (
                                                    <p className="text-xs text-blue-700">
                                                        Ready to start your AI assessment
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-blue-700">
                                                        Scheduled for {formatTime(interview.start_time)}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'upcoming' && (
                                            <>
                                                {/* Pending/Scheduled - Accept/Reschedule/Decline */}
                                                {['scheduled', 'pending'].includes(interview.status) && (
                                                    <div className="flex gap-2 pt-2">
                                                        <button
                                                            onClick={() => handleAccept(interview)}
                                                            disabled={actionLoading === interview.id}
                                                            className="flex-1 bg-green-500 text-white py-1.5 rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                                                        >
                                                            {actionLoading === interview.id ? (
                                                                <Loader2 className="animate-spin h-3 w-3" />
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="w-3 h-3" />
                                                                    Accept
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => openRescheduleModal(interview)}
                                                            className="flex-1 bg-blue-500 text-white py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                                                        >
                                                            <RefreshCw className="w-3 h-3" />
                                                            Reschedule
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(interview)}
                                                            disabled={actionLoading === interview.id}
                                                            className="flex-1 bg-red-500 text-white py-1.5 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                                                        >
                                                            {actionLoading === interview.id ? (
                                                                <Loader2 className="animate-spin h-3 w-3" />
                                                            ) : (
                                                                <>
                                                                    <XCircle className="w-3 h-3" />
                                                                    Decline
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Confirmed AI Interview - View Details Button */}
                                                {interview.status === 'confirmed' && interview.mode === 'Wai' && (
                                                    <button
                                                        onClick={() => {
                                                            setDetailsInterview(interview)
                                                            setShowDetailsModal(true)
                                                        }}
                                                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2.5 rounded-lg text-sm font-bold hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                                    >
                                                        <Bot className="w-4 h-4" />
                                                        View Details & Start
                                                    </button>
                                                )}

                                                {/* Confirmed HR/HM Interview - View Details Button */}
                                                {interview.status === 'confirmed' && interview.mode !== 'Wai' && (() => {
                                                    const status = getInterviewStatus(interview)
                                                    return (
                                                        <div className="space-y-2">
                                                            {status.urgent && (
                                                                <div className="bg-red-50 border border-red-200 rounded-lg p-2 animate-pulse">
                                                                    <p className="text-xs font-bold text-red-800 text-center flex items-center justify-center gap-1">
                                                                        <AlertCircle className="w-3 h-3" />
                                                                        {status.message}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {status.canStart && interview.meeting_link ? (
                                                                <a
                                                                    href={interview.meeting_link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={`block w-full text-white py-2.5 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${status.isLive
                                                                        ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 animate-pulse'
                                                                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                                                                        }`}
                                                                >
                                                                    <Video className="w-4 h-4" />
                                                                    {status.isLive ? 'JOIN NOW (LIVE)' : 'Join Meeting'}
                                                                </a>
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        setDetailsInterview(interview)
                                                                        setShowDetailsModal(true)
                                                                    }}
                                                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg text-sm font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                                                >
                                                                    <Calendar className="w-4 h-4" />
                                                                    View Details
                                                                </button>
                                                            )}
                                                        </div>
                                                    )
                                                })()}
                                            </>
                                        )}

                                        {/* Completed Score */}
                                        {interview.status === 'completed' && interview.overall_score !== undefined && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                                                <p className="text-xs text-green-800 font-semibold">
                                                    Score: {interview.overall_score}/10
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <style jsx>{`
        @keyframes slide-in {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        .animate-slide-in {
            animation: slide-in 0.3s ease-out;
        }
    `}</style>
        </div >
    )
}

export default CandidateInterviewDashboard