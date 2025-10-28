"use client"

import { useState, useEffect } from 'react'
import { Calendar, Search, Clock, MapPin, Video, Bot } from 'lucide-react';
import axios from 'axios';

const InterviewDashboard = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const getInterviewList = async () => {
        try {
            setLoading(true);

            const response = await axios.get('/api/Interviews/candidate-interviews');
            console.log("Fetched Interviews:", response.data.interviews);
            // Use actual data from API
            // setInterviews(response.data.interviews);

            // const mockData = [
            //     {
            //         "id": "7lsmsCXU3ZkiNBFkIQJg",
            //         "job_id": "xVc4zemITKbWlQjGnYkf",
            //         "application_id": "CSHOuvxs0kNhfUXGSmMc",
            //         "candidate_id": null,
            //         "candidate_email": "sudhanshukhosla2004@gmail.com",
            //         "candidate_name": "Sudhanshu Khosla",
            //         "start_time": {
            //             "_seconds": 1761625800,
            //             "_nanoseconds": 0
            //         },
            //         "end_time": {
            //             "_seconds": 1761627600,
            //             "_nanoseconds": 0
            //         },
            //         "scheduled_at": {
            //             "_seconds": 1761625800,
            //             "_nanoseconds": 0
            //         },
            //         "started_at": {
            //             "_seconds": 1761625800,
            //             "_nanoseconds": 0
            //         },
            //         "ended_at": {
            //             "_seconds": 1761627600,
            //             "_nanoseconds": 0
            //         },
            //         "mode": "Whr",
            //         "meeting_link": null,
            //         "google_event_id": null,
            //         "status": "scheduled",
            //         "send_notification_to": "both",
            //         "created_by": "layGBgDsWBcce9lVEacns9oGqmj1",
            //         "hr_id": "Z0NDWe1aTGPpNrsNovSbd99Nm4E2",
            //         "hr_email": "techpanda168@gmail.com",
            //         "updated_at": {
            //             "_seconds": 1761582817,
            //             "_nanoseconds": 655000000
            //         },
            //         "created_at": {
            //             "_seconds": 1761582817,
            //             "_nanoseconds": 655000000
            //         }
            //     },
            //     {
            //         "id": "TeXVEbib3LYWGCID2WVf",
            //         "job_id": "xVc4zemITKbWlQjGnYkf",
            //         "application_id": "CSHOuvxs0kNhfUXGSmMc",
            //         "candidate_id": null,
            //         "mode": "Wai",
            //         "interview_type": [
            //             "Technical",
            //             "Behavioral",
            //             "Experience",
            //             "Problem Solving",
            //             "Leadership"
            //         ],
            //         "duration_minutes": "5 Min",
            //         "created_at": {
            //             "_seconds": 1761404402,
            //             "_nanoseconds": 374000000
            //         },
            //         "overall_score": 0,
            //         "ended_at": {
            //             "_seconds": 1761554151,
            //             "_nanoseconds": 940000000
            //         },
            //         "status": "completed",
            //         "candidate_email": "sudhanshukhosla2004@gmail.com"
            //     }
            // ];
            setInterviews(response.data.interviews);
        } catch (error) {
            console.error("Error fetching interviews:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getInterviewList();
    }, []);

    // Convert Firebase timestamp to readable format
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp._seconds * 1000);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }) + ' IST';
    };

    // Separate scheduled and completed interviews
    const scheduledInterviews = interviews.filter(
        interview => interview.status === 'scheduled' || interview.status === 'pending'
    );

    const completedInterviews = interviews.filter(
        interview => interview.status === 'completed' || interview.status === 'rejected'
    );

    // Filter by search query
    const filteredPreviousInterviews = completedInterviews.filter(interview => {
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        return (
            interview.candidate_name?.toLowerCase().includes(searchLower) ||
            interview.candidate_email?.toLowerCase().includes(searchLower) ||
            interview.mode?.toLowerCase().includes(searchLower) ||
            interview.job_id?.toLowerCase().includes(searchLower)
        );
    });

    const getInterviewTypeLabel = (mode) => {
        switch (mode) {
            case 'Wai': return 'AI Interview';
            case 'Whr': return 'HR Interview';
            case 'Whm': return 'HM Interview';
            default: return mode || 'Interview';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'text-green-600';
            case 'scheduled': return 'text-blue-600';
            case 'pending': return 'text-orange-600';
            case 'rejected': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const handleAction = (interviewId, action) => {
        console.log(`${action} interview ${interviewId}`);
        // Handle the action (Accept, Reject, Reschedule)
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-gray-600">Loading interviews...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <div className="flex-1 flex flex-col">
                <div className="flex-1 p-6 pt-0 overflow-auto">
                    {/* Debug Info */}
                    <div className="mb-4 p-2 bg-blue-50 rounded text-xs">
                        <p>Total Interviews: {interviews.length}</p>
                        <p>Scheduled: {scheduledInterviews.length}</p>
                        <p>Completed: {completedInterviews.length}</p>
                    </div>

                    {/* Scheduled Interviews Section */}
                    <div>
                        {scheduledInterviews.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-orange-500 text-lg">You don't have any active interviews</p>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-orange-500 text-[16px]">Your interviews schedule</h2>
                                <p className="text-gray-600 mb-3 w-full text-center text-sm">
                                    You have interviews that have been scheduled, have a check
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                    {scheduledInterviews.map((interview) => (
                                        <div
                                            key={interview.id}
                                            className="flex flex-col justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                                        >
                                            <div className="flex items-start mb-3">
                                                {interview.mode === 'Wai' ? (
                                                    <Bot className="w-8 h-8 text-purple-600 mr-3 flex-shrink-0" />
                                                ) : (
                                                    <Calendar className="w-8 h-8 text-blue-600 mr-3 flex-shrink-0" />
                                                )}
                                                <div className="flex-1 ">
                                                    <p className="text-blue-500 text-sm font-medium">
                                                        {interview.candidate_name || 'Interview Scheduled'}
                                                    </p>
                                                    <p className="text-gray-600 text-xs mt-1">
                                                        {interview.candidate_email}
                                                    </p>
                                                    <p className="text-gray-500 text-xs mt-1">
                                                        Type: {getInterviewTypeLabel(interview.mode)}
                                                    </p>
                                                    {interview.scheduled_at && (
                                                        <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                                                            <Clock className="w-3 h-3" />
                                                            {formatDate(interview.scheduled_at)}
                                                        </p>
                                                    )}
                                                    {interview.meeting_link && (
                                                        <p className="text-blue-500 text-xs flex items-center gap-1 mt-1">
                                                            <Video className="w-3 h-3" />
                                                            <a
                                                                href={interview.meeting_link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="hover:underline"
                                                            >
                                                                Join Meeting
                                                            </a>
                                                        </p>
                                                    )}
                                                    {interview.hr_email && (
                                                        <p className="text-gray-500 text-xs mt-1">
                                                            HR: {interview.hr_email}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => handleAction(interview.id, 'accept')}
                                                    className="px-4 py-1.5 bg-green-500 text-white rounded-full text-xs hover:bg-green-600 transition-colors"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleAction(interview.id, 'reject')}
                                                    className="px-2 py-1.5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => handleAction(interview.id, 'reschedule')}
                                                    className="px-4 py-1.5 bg-gray-300 text-gray-700 rounded-full text-xs hover:bg-gray-400 transition-colors"
                                                >
                                                    Reschedule
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-300 pb-4"></div>

                    {/* Previous Interviews Section */}
                    <div>
                        <div className="flex flex-col mb-4">
                            <h2 className="text-gray-600 text-[16px] ml-[12vw]">
                                The interviews you have given earlier
                            </h2>

                            <div className="relative flex items-center px-3 ml-auto border border-gray-300 focus:outline-none focus:border-gray-400 rounded-full">
                                <input
                                    type="text"
                                    placeholder="Search by name or email"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full md:w-96 px-1 py-1 text-sm outline-0 text-black"
                                />
                                <Search className="w-5 h-5 text-gray-400 cursor-pointer hover:text-black" />
                            </div>
                        </div>

                        {filteredPreviousInterviews.length > 0 ? (
                            <div className="space-y-4">
                                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-4">
                                    {filteredPreviousInterviews.map((interview) => (
                                        <li
                                            key={interview.id}
                                            className="bg-pink-100 rounded-lg p-2 cursor-pointer px-4 w-full max-w-xs border border-gray-300 hover:shadow-lg transition-shadow"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="bg-gray-200 p-2 rounded-lg">
                                                    {interview.mode === 'Wai' ? (
                                                        <Bot className="w-8 h-8 text-purple-600 flex-shrink-0" />
                                                    ) : (
                                                        <Calendar className="w-8 h-8 text-gray-600 flex-shrink-0" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[15px] text-gray-800">
                                                        {interview.candidate_name || 'Interview'}
                                                    </p>
                                                    <p className="text-gray-600 text-sm">
                                                        {getInterviewTypeLabel(interview.mode)}
                                                    </p>
                                                    <p className="text-gray-500 text-xs">
                                                        {formatDate(interview.ended_at || interview.created_at)}
                                                    </p>
                                                    {interview.overall_score !== undefined && (
                                                        <p className="text-gray-500 text-xs">
                                                            Score: {interview.overall_score}
                                                        </p>
                                                    )}
                                                    {interview.duration_minutes && (
                                                        <p className="text-gray-500 text-xs">
                                                            Duration: {interview.duration_minutes}
                                                        </p>
                                                    )}
                                                    <p className={`text-xs font-medium ${getStatusColor(interview.status)}`}>
                                                        Status: {interview.status?.charAt(0).toUpperCase() + interview.status?.slice(1)}
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="text-center pt-8 text-gray-500 mt-auto">
                                <span>No previous interview details found</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewDashboard;