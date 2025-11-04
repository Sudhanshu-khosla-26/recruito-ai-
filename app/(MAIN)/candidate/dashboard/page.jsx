"use client"
import React, { useState } from 'react';
import { Briefcase, Calendar, TrendingUp, CheckCircle, Clock, XCircle, AlertCircle, User, FileText, Award, Target, BarChart3, Sparkles, Eye } from 'lucide-react';

const CandidateAnalyticsDashboard = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('month');

    // Dummy data
    const stats = {
        totalApplications: 24,
        active: 8,
        interviews: 5,
        offers: 2,
        rejected: 9,
        pending: 6
    };

    const profileScore = 78;
    const profileMissing = [
        { field: 'Portfolio URL', icon: Briefcase },
        { field: 'LinkedIn Profile', icon: User },
        { field: 'Cover Letter Template', icon: FileText },
        { field: 'Skills Certification', icon: Award }
    ];

    const upcomingInterviews = [
        { id: 1, company: 'TechCorp Inc', position: 'Senior Frontend Developer', date: '2025-11-05', time: '10:00 AM', type: 'Technical Round', status: 'confirmed' },
        { id: 2, company: 'CloudTech', position: 'Frontend Lead', date: '2025-11-06', time: '2:00 PM', type: 'HR Round', status: 'confirmed' },
        { id: 3, company: 'InnovateLab', position: 'React Specialist', date: '2025-11-08', time: '11:30 AM', type: 'Final Round', status: 'pending' },
        { id: 4, company: 'StartupX', position: 'Full Stack Engineer', date: '2025-11-10', time: '3:00 PM', type: 'System Design', status: 'pending' },
    ];

    const recentApplications = [
        { id: 1, company: 'TechCorp Inc', position: 'Senior Frontend Developer', status: 'interview', date: '2025-11-01', match: 92 },
        { id: 2, company: 'StartupX', position: 'Full Stack Engineer', status: 'pending', date: '2025-10-30', match: 85 },
        { id: 3, company: 'MegaSoft', position: 'React Developer', status: 'offer', date: '2025-10-28', match: 95 },
        { id: 4, company: 'DevCo', position: 'UI Engineer', status: 'rejected', date: '2025-10-25', match: 78 },
    ];

    const applicationTrend = [
        { month: 'Jun', applied: 3, interviews: 1 },
        { month: 'Jul', applied: 5, interviews: 2 },
        { month: 'Aug', applied: 4, interviews: 2 },
        { month: 'Sep', applied: 6, interviews: 3 },
        { month: 'Oct', applied: 8, interviews: 4 },
        { month: 'Nov', applied: 7, interviews: 5 },
    ];

    const getStatusColor = (status) => {
        const colors = {
            interview: 'bg-blue-50 text-blue-700 border-blue-200',
            pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            offer: 'bg-green-50 text-green-700 border-green-200',
            rejected: 'bg-red-50 text-red-700 border-red-200',
        };
        return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
    };

    const getStatusIcon = (status) => {
        const icons = {
            interview: Calendar,
            pending: Clock,
            offer: CheckCircle,
            rejected: XCircle,
        };
        const Icon = icons[status] || AlertCircle;
        return <Icon size={14} />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-600 flex items-center gap-2">
                                <BarChart3 size={32} className="hidden sm:block" />
                                Analytics Dashboard
                            </h1>
                            <p className="text-gray-600 text-xs sm:text-sm mt-1">
                                Track your job search progress and insights
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {['week', 'month', 'year'].map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setSelectedPeriod(period)}
                                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${selectedPeriod === period
                                        ? 'bg-orange-600 text-white shadow-md'
                                        : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'
                                        }`}
                                >
                                    {period.charAt(0).toUpperCase() + period.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
                    {[
                        { label: 'Total Applications', value: stats.totalApplications, icon: Briefcase, color: 'orange', trend: '+12%' },
                        { label: 'Active', value: stats.active, icon: Clock, color: 'blue', trend: '+5%' },
                        { label: 'Interviews', value: stats.interviews, icon: Calendar, color: 'green', trend: '+25%' },
                        { label: 'Offers', value: stats.offers, icon: CheckCircle, color: 'green', trend: '+100%' },
                        { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'red', trend: '-10%' },
                        { label: 'Pending', value: stats.pending, icon: AlertCircle, color: 'yellow', trend: '0%' },
                    ].map((stat, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 hover:shadow-lg hover:border-orange-300 transition-all duration-300 animate-slideUp"
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className={`p-2 rounded-lg bg-${stat.color}-50`}>
                                    <stat.icon size={18} className={`text-${stat.color}-600`} />
                                </div>
                                <span className={`text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded ${stat.trend.startsWith('+') ? 'bg-green-50 text-green-700' : stat.trend.startsWith('-') ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
                                    }`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</div>
                            <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 truncate">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Main Grid */}
                <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Left Column - 2/3 width */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        {/* Profile Completion */}
                        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 animate-scaleIn">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg sm:text-xl font-bold text-orange-600 flex items-center gap-2">
                                    <Target size={20} />
                                    Profile Completion
                                </h2>
                                <span className="text-2xl font-bold text-orange-600">{profileScore}%</span>
                            </div>
                            <div className="relative w-full bg-gray-200 rounded-full h-3 sm:h-4 mb-4 overflow-hidden">
                                <div
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-1000 animate-slideRight"
                                    style={{ width: `${profileScore}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                                </div>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                                Complete your profile to increase your chances by <span className="font-semibold text-orange-600">35%</span>
                            </p>
                            <div className="grid sm:grid-cols-2 gap-2 sm:gap-3">
                                {profileMissing.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-2 p-2 sm:p-3 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-all duration-200 cursor-pointer animate-slideUp"
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        <item.icon size={16} className="text-orange-600 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm text-gray-700 truncate">{item.field}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Application Trend Chart */}
                        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn">
                            <h2 className="text-lg sm:text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
                                <TrendingUp size={20} />
                                Application Trend
                            </h2>
                            <div className="flex items-end justify-between gap-1 sm:gap-2 h-48 sm:h-64">
                                {applicationTrend.map((data, idx) => (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full flex flex-col gap-1 items-center justify-end h-full">
                                            <div
                                                className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg hover:from-orange-600 hover:to-orange-500 transition-all duration-300 cursor-pointer relative group animate-growUp"
                                                style={{
                                                    height: `${(data.applied / 8) * 100}%`,
                                                    animationDelay: `${idx * 100}ms`
                                                }}
                                            >
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                                                    {data.applied} applied
                                                </div>
                                            </div>
                                            <div
                                                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg hover:from-blue-600 hover:to-blue-500 transition-all duration-300 cursor-pointer relative group animate-growUp"
                                                style={{
                                                    height: `${(data.interviews / 8) * 100}%`,
                                                    animationDelay: `${idx * 100 + 50}ms`
                                                }}
                                            >
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                                                    {data.interviews} interviews
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] sm:text-xs text-gray-600 font-medium">{data.month}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 text-xs sm:text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-gradient-to-br from-orange-500 to-orange-400"></div>
                                    <span className="text-gray-600">Applications</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-gradient-to-br from-blue-500 to-blue-400"></div>
                                    <span className="text-gray-600">Interviews</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Applications */}
                        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn">
                            <h2 className="text-lg sm:text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
                                <Briefcase size={20} />
                                Recent Applications
                            </h2>
                            <div className="space-y-2 sm:space-y-3">
                                {recentApplications.map((app, idx) => (
                                    <div
                                        key={app.id}
                                        className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 hover:bg-orange-50 rounded-lg border border-gray-200 hover:border-orange-300 transition-all duration-200 cursor-pointer animate-slideUp"
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                                    {app.position}
                                                </h3>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border ${getStatusColor(app.status)} whitespace-nowrap flex items-center gap-1`}>
                                                    {getStatusIcon(app.status)}
                                                    <span className="hidden sm:inline">{app.status}</span>
                                                </span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-gray-600">
                                                <span className="truncate">{app.company}</span>
                                                <span className="hidden sm:inline">•</span>
                                                <span className="text-[10px] sm:text-xs">{app.date}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 ml-2">
                                            <div className="flex items-center gap-1">
                                                <Sparkles size={12} className="text-orange-600" />
                                                <span className="text-sm sm:text-base font-bold text-orange-600">{app.match}%</span>
                                            </div>
                                            <span className="text-[10px] text-gray-500">match</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - 1/3 width */}
                    <div className="space-y-4 sm:space-y-6">
                        {/* Upcoming Interviews */}
                        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 animate-scaleIn">
                            <h2 className="text-lg sm:text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
                                <Calendar size={20} />
                                Upcoming Interviews
                            </h2>
                            <div className="space-y-3">
                                {upcomingInterviews.map((interview, idx) => (
                                    <div
                                        key={interview.id}
                                        className="p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-white rounded-lg border border-orange-200 hover:shadow-md transition-all duration-200 animate-slideUp"
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-semibold text-gray-900 truncate mb-0.5">
                                                    {interview.company}
                                                </h3>
                                                <p className="text-xs text-gray-600 truncate">{interview.position}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${interview.status === 'confirmed'
                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                                }`}>
                                                {interview.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                            <Calendar size={12} className="text-orange-600 flex-shrink-0" />
                                            <span>{interview.date}</span>
                                            <span>•</span>
                                            <Clock size={12} className="text-orange-600 flex-shrink-0" />
                                            <span>{interview.time}</span>
                                        </div>
                                        <div className="inline-block px-2 py-1 bg-orange-100 text-orange-700 rounded text-[10px] font-medium">
                                            {interview.type}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-gradient-to-br from-orange-600 to-orange-500 rounded-xl p-4 sm:p-5 text-white shadow-lg animate-scaleIn">
                            <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                                <Award size={20} />
                                Success Metrics
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <span className="text-sm">Interview Rate</span>
                                    <span className="text-lg font-bold">20.8%</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <span className="text-sm">Offer Rate</span>
                                    <span className="text-lg font-bold">40%</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <span className="text-sm">Avg. Match Score</span>
                                    <span className="text-lg font-bold">87.5%</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <span className="text-sm">Response Time</span>
                                    <span className="text-lg font-bold">4.2 days</span>
                                </div>
                            </div>
                        </div>

                        {/* Profile Views */}
                        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn">
                            <h2 className="text-lg sm:text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
                                <Eye size={20} />
                                Profile Analytics
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Profile Views</span>
                                    <span className="text-xl font-bold text-gray-900">342</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Recruiter Searches</span>
                                    <span className="text-xl font-bold text-gray-900">28</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Profile Saves</span>
                                    <span className="text-xl font-bold text-gray-900">15</span>
                                </div>
                                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                    <p className="text-xs text-green-700 flex items-center gap-2">
                                        <TrendingUp size={14} />
                                        <span>Your profile is performing <span className="font-bold">better than 78%</span> of candidates</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideRight {
          from {
            width: 0;
          }
          to {
            width: ${profileScore}%;
          }
        }
        @keyframes growUp {
          from {
            height: 0;
            opacity: 0;
          }
          to {
            height: var(--final-height);
            opacity: 1;
          }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
          animation-fill-mode: both;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
        .animate-slideRight {
          animation: slideRight 1.5s ease-out;
        }
        .animate-growUp {
          animation: growUp 0.8s ease-out;
          animation-fill-mode: both;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
        </div>
    );
};

export default CandidateAnalyticsDashboard;