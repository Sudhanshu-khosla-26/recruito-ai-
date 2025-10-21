"use client"

import { useState, useEffect } from 'react'
import axios from 'axios'
import { FileText, ChevronLeft, ChevronRight, Briefcase, MapPin, Calendar } from 'lucide-react'
import { useRouter } from "next/navigation";

const JobsPage = () => {
    const router = useRouter();
    const [jobDescriptions, setJobDescriptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalJobs: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        limit: 16
    });

    const fetchJobDescriptions = async (page = 1) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/job/all-jd?page=${page}&limit=16`);
            setJobDescriptions(response.data.jobs);
            setPagination(response.data.pagination);
            console.log(response.data);
        } catch (error) {
            console.error("Error fetching job descriptions:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleJobClick = (jobId) => {
        router.push(`candidate-dashboard/${jobId}`);
    }

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchJobDescriptions(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    useEffect(() => {
        fetchJobDescriptions();
    }, [])

    return (
        <div className='flex flex-col w-full min-h-0'>
            {/* Header */}
            <div className="mb-4 md:mb-6 px-2 mt-3">
                <span className="text-orange-500 font-bold text-sm md:text-base">
                    Available Jobs
                </span>
                <p className="text-gray-600 text-xs md:text-sm mt-1">
                    Showing {jobDescriptions.length} of {pagination.totalJobs} jobs
                </p>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    <span className="ml-3 text-gray-600 text-sm">Loading jobs...</span>
                </div>
            ) : (
                <div className="flex flex-col min-h-0 flex-1">
                    {/* Jobs Grid - Scrollable */}
                    <div className="flex-1 overflow-y-auto px-2 pb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-4">
                            {jobDescriptions.length > 0 ? (
                                jobDescriptions.map((job, index) => (
                                    <div
                                        key={job?.id || index}
                                        onClick={() => handleJobClick(job?.id)}
                                        className="flex gap-3 bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all duration-200 cursor-pointer group"
                                    >
                                        {/* Job Icon */}
                                        <div className="bg-orange-50 group-hover:bg-orange-100 p-2 md:p-3 rounded-lg transition-colors duration-200 h-fit">
                                            <Briefcase className='w-4 h-4 md:w-5 md:h-5 text-orange-500' />
                                        </div>

                                        {/* Job Details */}
                                        <div className="space-y-1.5 md:space-y-2 flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-800 text-xs md:text-sm line-clamp-2 group-hover:text-orange-600 transition-colors duration-200">
                                                {job?.title || 'Job Title'}
                                            </h3>

                                            <div className="flex items-center text-gray-500 text-xs">
                                                <MapPin className='w-3 h-3 mr-1 flex-shrink-0' />
                                                <span className="truncate">{job?.location || 'Location not specified'}</span>
                                            </div>

                                            {job?.company && (
                                                <div className="flex items-center text-gray-500 text-xs">
                                                    <FileText className='w-3 h-3 mr-1 flex-shrink-0' />
                                                    <span className="truncate">{job.company}</span>
                                                </div>
                                            )}

                                            {job?.createdAt && (
                                                <div className="flex items-center text-gray-400 text-xs">
                                                    <Calendar className='w-3 h-3 mr-1 flex-shrink-0' />
                                                    <span className="whitespace-nowrap">
                                                        {new Date(job.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            )}

                                            {job?.type && (
                                                <div className="mt-2">
                                                    <span className="inline-block bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full">
                                                        {job.type}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                                    <div className="bg-gray-100 rounded-full p-6 mb-4">
                                        <Briefcase className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No jobs available</h3>
                                    <p className="text-gray-500 text-sm">Check back later for new job opportunities.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pagination - Fixed at bottom */}
                    {pagination.totalPages > 1 && (
                        <div className="flex-shrink-0 border-t border-gray-200 pt-4 pb-2 px-2">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="flex items-center space-x-2 flex-wrap justify-center">
                                    {/* Previous Button */}
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={!pagination.hasPreviousPage}
                                        className="flex items-center px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 transition-colors duration-200"
                                    >
                                        <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                        <span className="hidden sm:inline">Previous</span>
                                        <span className="sm:hidden">Prev</span>
                                    </button>

                                    {/* Page Numbers */}
                                    <div className="flex items-center space-x-1">
                                        {/* First page */}
                                        {pagination.currentPage > 3 && (
                                            <>
                                                <button
                                                    onClick={() => handlePageChange(1)}
                                                    className="px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200"
                                                >
                                                    1
                                                </button>
                                                {pagination.currentPage > 4 && (
                                                    <span className="px-1 md:px-2 py-1.5 md:py-2 text-gray-500 text-xs md:text-sm">...</span>
                                                )}
                                            </>
                                        )}

                                        {/* Current page and surrounding pages */}
                                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                            .filter(page =>
                                                page >= Math.max(1, pagination.currentPage - 1) &&
                                                page <= Math.min(pagination.totalPages, pagination.currentPage + 1)
                                            )
                                            .map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium rounded-lg transition-colors duration-200 ${page === pagination.currentPage
                                                        ? 'bg-orange-500 text-white border border-orange-500'
                                                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}

                                        {/* Last page */}
                                        {pagination.currentPage < pagination.totalPages - 2 && (
                                            <>
                                                {pagination.currentPage < pagination.totalPages - 3 && (
                                                    <span className="px-1 md:px-2 py-1.5 md:py-2 text-gray-500 text-xs md:text-sm">...</span>
                                                )}
                                                <button
                                                    onClick={() => handlePageChange(pagination.totalPages)}
                                                    className="px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200"
                                                >
                                                    {pagination.totalPages}
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Next Button */}
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={!pagination.hasNextPage}
                                        className="flex items-center px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 transition-colors duration-200"
                                    >
                                        <span className="hidden sm:inline">Next</span>
                                        <span className="sm:hidden">Next</span>
                                        <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                                    </button>
                                </div>

                                {/* Page info */}
                                <div className="text-xs md:text-sm text-gray-600">
                                    Page {pagination.currentPage} of {pagination.totalPages}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default JobsPage