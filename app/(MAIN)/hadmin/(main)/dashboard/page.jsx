"use client"
import React, { useState } from 'react';
import {
    Users, Building2, Briefcase, DollarSign, TrendingUp, Activity,
    UserCheck, UserX, AlertCircle, Settings, Search, Filter,
    MoreVertical, Eye, Ban, Trash2, Edit, CheckCircle, XCircle,
    Calendar, Clock, Award, Target, BarChart3, PieChart
} from 'lucide-react';

const AdminDashboard = () => {
    const [selectedTab, setSelectedTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showActionMenu, setShowActionMenu] = useState(null);

    // Dummy data
    const stats = {
        totalUsers: 1247,
        activeUsers: 892,
        totalCompanies: 156,
        activeCompanies: 134,
        totalJobs: 3421,
        activeJobs: 2156,
        totalRevenue: 284750,
        monthlyRevenue: 47250,
        activeApplications: 8934,
        completedApplications: 12456
    };

    const revenueData = [
        { month: 'Jan', revenue: 35000, users: 180, companies: 28 },
        { month: 'Feb', revenue: 38500, users: 210, companies: 32 },
        { month: 'Mar', revenue: 42000, users: 245, companies: 38 },
        { month: 'Apr', revenue: 39500, users: 268, companies: 41 },
        { month: 'May', revenue: 44000, users: 295, companies: 45 },
        { month: 'Jun', revenue: 47250, users: 324, companies: 52 },
    ];

    const companies = [
        { id: 1, name: 'TechCorp Inc', admin: 'John Smith', users: 45, jobs: 23, billing: 'Premium', revenue: 15000, status: 'active', joined: '2024-01-15', lastActive: '2 hours ago' },
        { id: 2, name: 'StartupX', admin: 'Sarah Johnson', users: 12, jobs: 8, billing: 'Standard', revenue: 3500, status: 'active', joined: '2024-03-20', lastActive: '5 hours ago' },
        { id: 3, name: 'MegaSoft Solutions', admin: 'Mike Davis', users: 68, jobs: 34, billing: 'Enterprise', revenue: 28000, status: 'active', joined: '2023-11-10', lastActive: '1 hour ago' },
        { id: 4, name: 'CloudTech', admin: 'Emily Brown', users: 28, jobs: 15, billing: 'Premium', revenue: 8500, status: 'suspended', joined: '2024-02-05', lastActive: '2 days ago' },
        { id: 5, name: 'DevCo', admin: 'Alex Wilson', users: 19, jobs: 11, billing: 'Standard', revenue: 4200, status: 'active', joined: '2024-04-12', lastActive: '30 min ago' },
    ];

    const recentJobs = [
        { id: 1, title: 'Senior Frontend Developer', company: 'TechCorp Inc', applications: 45, status: 'active', posted: '2025-10-28', salary: '120k-150k' },
        { id: 2, title: 'Full Stack Engineer', company: 'StartupX', applications: 32, status: 'active', posted: '2025-10-30', salary: '100k-130k' },
        { id: 3, title: 'DevOps Engineer', company: 'MegaSoft Solutions', applications: 58, status: 'active', posted: '2025-10-25', salary: '110k-140k' },
        { id: 4, title: 'UI/UX Designer', company: 'CloudTech', applications: 23, status: 'suspended', posted: '2025-10-20', salary: '90k-120k' },
        { id: 5, title: 'Backend Developer', company: 'DevCo', applications: 28, status: 'active', posted: '2025-11-01', salary: '95k-125k' },
    ];

    const activityData = [
        { type: 'User Signup', count: 245, percentage: 35, color: 'bg-blue-500' },
        { type: 'Job Posts', count: 156, percentage: 22, color: 'bg-green-500' },
        { type: 'Applications', count: 189, percentage: 27, color: 'bg-orange-500' },
        { type: 'Companies Joined', count: 112, percentage: 16, color: 'bg-purple-500' },
    ];

    const maxRevenue = Math.max(...revenueData.map(d => d.revenue));

    const getBillingColor = (billing) => {
        const colors = {
            'Enterprise': 'bg-purple-50 text-purple-700 border-purple-200',
            'Premium': 'bg-orange-50 text-orange-700 border-orange-200',
            'Standard': 'bg-blue-50 text-blue-700 border-blue-200',
        };
        return colors[billing] || 'bg-gray-50 text-gray-700 border-gray-200';
    };

    const getStatusColor = (status) => {
        return status === 'active'
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-red-50 text-red-700 border-red-200';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-600 flex items-center gap-2">
                                <Settings size={32} className="hidden sm:block" />
                                Admin Dashboard
                            </h1>
                            <p className="text-gray-600 text-xs sm:text-sm mt-1">
                                Manage companies, users, jobs and billing
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {['overview', 'companies', 'jobs'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setSelectedTab(tab)}
                                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${selectedTab === tab
                                        ? 'bg-orange-600 text-white shadow-md'
                                        : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                    {[
                        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue', subtext: `${stats.activeUsers} active` },
                        { label: 'Companies', value: stats.totalCompanies, icon: Building2, color: 'purple', subtext: `${stats.activeCompanies} active` },
                        { label: 'Active Jobs', value: stats.activeJobs, icon: Briefcase, color: 'green', subtext: `${stats.totalJobs} total` },
                        { label: 'Monthly Revenue', value: `$${(stats.monthlyRevenue / 1000).toFixed(1)}k`, icon: DollarSign, color: 'orange', subtext: '+12% vs last month' },
                        { label: 'Applications', value: stats.activeApplications, icon: Activity, color: 'pink', subtext: `${stats.completedApplications} completed` },
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
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</div>
                            <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 truncate">{stat.label}</div>
                            <div className="text-[9px] sm:text-[10px] text-gray-500 mt-1">{stat.subtext}</div>
                        </div>
                    ))}
                </div>

                {selectedTab === 'overview' && (
                    <>
                        {/* Main Grid */}
                        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
                            {/* Revenue Chart - 2/3 width */}
                            <div className="lg:col-span-2 bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg sm:text-xl font-bold text-orange-600 flex items-center gap-2">
                                        <TrendingUp size={20} />
                                        Revenue & Growth
                                    </h2>
                                    <div className="flex gap-2 text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-3 h-3 rounded bg-orange-500"></div>
                                            <span className="text-gray-600">Revenue</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-3 h-3 rounded bg-blue-500"></div>
                                            <span className="text-gray-600">Users</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Revenue Bars */}
                                <div className="mb-6">
                                    <div className="flex items-end justify-between gap-1 sm:gap-2 h-48 sm:h-64">
                                        {revenueData.map((data, idx) => {
                                            const heightPercent = (data.revenue / maxRevenue) * 100;
                                            return (
                                                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                                    <div className="w-full flex flex-col gap-1 items-center justify-end h-full">
                                                        <div
                                                            className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg hover:from-orange-600 hover:to-orange-500 transition-all duration-300 cursor-pointer relative group"
                                                            style={{ height: `${heightPercent}%` }}
                                                        >
                                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                                                                ${(data.revenue / 1000).toFixed(1)}k
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] sm:text-xs text-gray-600 font-medium">{data.month}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* User Growth Line */}
                                <div className="border-t pt-4">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">User Growth</h3>
                                    <div className="relative h-20">
                                        <svg className="w-full h-full" viewBox="0 0 600 80" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="userGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                                                </linearGradient>
                                            </defs>
                                            {/* Area under the line */}
                                            <path
                                                d={`M 0 80 ${revenueData.map((d, i) => {
                                                    const x = (i / (revenueData.length - 1)) * 600;
                                                    const y = 80 - ((d.users - 150) / 200) * 60;
                                                    return `L ${x} ${y}`;
                                                }).join(' ')} L 600 80 Z`}
                                                fill="url(#userGradient)"
                                                className="animate-fadeIn"
                                            />
                                            {/* Line */}
                                            <path
                                                d={`M ${revenueData.map((d, i) => {
                                                    const x = (i / (revenueData.length - 1)) * 600;
                                                    const y = 80 - ((d.users - 150) / 200) * 60;
                                                    return `${x} ${y}`;
                                                }).join(' L ')}`}
                                                fill="none"
                                                stroke="#3b82f6"
                                                strokeWidth="2"
                                                className="animate-drawLine"
                                            />
                                            {/* Points */}
                                            {revenueData.map((d, i) => {
                                                const x = (i / (revenueData.length - 1)) * 600;
                                                const y = 80 - ((d.users - 150) / 200) * 60;
                                                return (
                                                    <circle
                                                        key={i}
                                                        cx={x}
                                                        cy={y}
                                                        r="4"
                                                        fill="#3b82f6"
                                                        className="animate-scaleIn"
                                                        style={{ animationDelay: `${i * 100}ms` }}
                                                    />
                                                );
                                            })}
                                        </svg>
                                    </div>
                                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                                        {revenueData.map((d, i) => (
                                            <span key={i}>{d.users}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Activity Breakdown - 1/3 width */}
                            <div className="space-y-4 sm:space-y-6">
                                {/* Activity Pie Chart */}
                                <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 animate-scaleIn">
                                    <h2 className="text-lg sm:text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
                                        <PieChart size={20} />
                                        Activity Breakdown
                                    </h2>

                                    {/* Pie Chart */}
                                    <div className="relative w-40 h-40 mx-auto mb-4">
                                        <svg viewBox="0 0 100 100" className="transform -rotate-90">
                                            {activityData.reduce((acc, item, idx) => {
                                                const prevPercentage = activityData.slice(0, idx).reduce((sum, i) => sum + i.percentage, 0);
                                                const circumference = 2 * Math.PI * 40;
                                                const offset = circumference - (item.percentage / 100) * circumference;
                                                const rotation = (prevPercentage / 100) * 360;

                                                acc.push(
                                                    <circle
                                                        key={idx}
                                                        cx="50"
                                                        cy="50"
                                                        r="40"
                                                        fill="none"
                                                        stroke={item.color.replace('bg-', '#')}
                                                        strokeWidth="20"
                                                        strokeDasharray={circumference}
                                                        strokeDashoffset={offset}
                                                        className="animate-drawCircle"
                                                        style={{
                                                            transformOrigin: '50% 50%',
                                                            transform: `rotate(${rotation}deg)`,
                                                            animationDelay: `${idx * 200}ms`
                                                        }}
                                                    />
                                                );
                                                return acc;
                                            }, [])}
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <div className="text-2xl font-bold text-gray-900">702</div>
                                            <div className="text-xs text-gray-600">Total</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {activityData.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-all animate-slideUp"
                                                style={{ animationDelay: `${idx * 100}ms` }}
                                            >
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <div className={`w-3 h-3 rounded ${item.color} flex-shrink-0`}></div>
                                                    <span className="text-xs sm:text-sm text-gray-700 truncate">{item.type}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-gray-900">{item.count}</span>
                                                    <span className="text-xs text-gray-500">({item.percentage}%)</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="bg-gradient-to-br from-orange-600 to-orange-500 rounded-xl p-4 sm:p-5 text-white shadow-lg animate-scaleIn">
                                    <h2 className="text-lg sm:text-xl font-bold mb-4">Quick Actions</h2>
                                    <div className="space-y-2">
                                        <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 text-left text-sm font-medium transition-all duration-200 flex items-center gap-2">
                                            <Building2 size={16} />
                                            Add New Company
                                        </button>
                                        <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 text-left text-sm font-medium transition-all duration-200 flex items-center gap-2">
                                            <Users size={16} />
                                            Manage Admins
                                        </button>
                                        <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 text-left text-sm font-medium transition-all duration-200 flex items-center gap-2">
                                            <DollarSign size={16} />
                                            Billing Settings
                                        </button>
                                        <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 text-left text-sm font-medium transition-all duration-200 flex items-center gap-2">
                                            <Activity size={16} />
                                            View Reports
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {selectedTab === 'companies' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm animate-fadeIn">
                        {/* Search and Filter */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search companies..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    />
                                </div>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                        </div>

                        {/* Companies Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Admin</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Users/Jobs</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Billing</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Revenue</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Active</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {companies.map((company, idx) => (
                                        <tr
                                            key={company.id}
                                            className="hover:bg-orange-50 transition-colors animate-slideUp"
                                            style={{ animationDelay: `${idx * 50}ms` }}
                                        >
                                            <td className="px-4 py-4">
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">{company.name}</div>
                                                    <div className="text-xs text-gray-500">Joined {company.joined}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm text-gray-900">{company.admin}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-xs">
                                                        <span className="font-semibold text-gray-900">{company.users}</span>
                                                        <span className="text-gray-500"> users</span>
                                                    </div>
                                                    <div className="text-xs">
                                                        <span className="font-semibold text-gray-900">{company.jobs}</span>
                                                        <span className="text-gray-500"> jobs</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getBillingColor(company.billing)}`}>
                                                    {company.billing}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-semibold text-green-600">
                                                    ${company.revenue.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${getStatusColor(company.status)}`}>
                                                    {company.status === 'active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                    {company.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-xs text-gray-600">{company.lastActive}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors group" title="View Details">
                                                        <Eye size={16} className="text-gray-600 group-hover:text-blue-600" />
                                                    </button>
                                                    <button className="p-1.5 hover:bg-orange-50 rounded-lg transition-colors group" title="Edit">
                                                        <Edit size={16} className="text-gray-600 group-hover:text-orange-600" />
                                                    </button>
                                                    <button className="p-1.5 hover:bg-yellow-50 rounded-lg transition-colors group" title="Suspend">
                                                        <Ban size={16} className="text-gray-600 group-hover:text-yellow-600" />
                                                    </button>
                                                    <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group" title="Delete">
                                                        <Trash2 size={16} className="text-gray-600 group-hover:text-red-600" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {selectedTab === 'jobs' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm animate-fadeIn">
                        {/* Search */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search jobs..."
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                                />
                            </div>
                        </div>

                        {/* Jobs List */}
                        <div className="divide-y divide-gray-200">
                            {recentJobs.map((job, idx) => (
                                <div
                                    key={job.id}
                                    className="p-4 hover:bg-orange-50 transition-colors animate-slideUp"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-sm sm:text-base font-semibold text-gray-900">{job.title}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                                                    {job.status}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Building2 size={14} className="text-orange-600" />
                                                    {job.company}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users size={14} className="text-orange-600" />
                                                    {job.applications} applications
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <DollarSign size={14} className="text-orange-600" />
                                                    {job.salary}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={14} className="text-orange-600" />
                                                    Posted {job.posted}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors group">
                                                <Eye size={16} className="text-gray-600 group-hover:text-blue-600" />
                                            </button>
                                            <button className="p-2hover:bg-orange-50 rounded-lg transition-colors group">
                                                <Edit size={16} className="text-gray-600 group-hover:text-orange-600" />
                                            </button>
                                            <button className="p-2 hover:bg-red-50 rounded-lg transition-colors group">
                                                <Trash2 size={16} className="text-gray-600 group-hover:text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Animations */}
            <style jsx>{`
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

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
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

        @keyframes drawLine {
          from {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
          }
        }

        @keyframes drawCircle {
          from {
            stroke-dashoffset: 251.2;
          }
          to {
            stroke-dashoffset: var(--dashoffset);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out forwards;
        }

        .animate-drawLine {
          animation: drawLine 1.5s ease-out forwards;
        }

        .animate-drawCircle {
          animation: drawCircle 1s ease-out forwards;
        }
      `}</style>
        </div>
    );
};

export default AdminDashboard;