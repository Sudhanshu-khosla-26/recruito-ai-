"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import Link from 'next/link';

// --- Self-contained mock components and hooks to avoid external dependencies ---

// Mock data for job descriptions


const mockCtcOptions = [
    { label: '0 Lacs', value: '0' },
    { label: '5 Lacs', value: '5' },
    { label: '10 Lacs', value: '10' },
    { label: '15 Lacs', value: '15' },
    { label: '20 Lacs', value: '20' },
];
const mockExperienceOptions = [
    { label: '0-2 years', value: '0-2' },
    { label: '3-5 years', value: '3-5' },
    { label: '6-8 years', value: '6-8' },
    { label: '8+ years', value: '8+' },
];


// Mock Button component using a standard button element with Tailwind classes
const Button = ({ variant, size, className, children, ...props }) => {
    let baseStyles = 'inline-flex items-center justify-center font-semibold transition-colors duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50';

    if (variant === 'outline') {
        baseStyles += ' border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800';
    } else if (variant === 'solid') {
        baseStyles += ' bg-green-500 text-white hover:bg-green-600';
    } else if (variant === 'ghost') {
        baseStyles += ' text-green-500 hover:bg-gray-100 dark:hover:bg-gray-800';
    }

    if (size === 'icon') {
        baseStyles += ' h-9 w-9';
    } else if (size === 'sm') {
        baseStyles += ' h-8 px-3 text-xs';
    } else {
        baseStyles += ' h-9 px-4';
    }

    return (
        <button className={`${baseStyles} ${className}`} {...props}>
            {children}
        </button>
    );
};

// Mock Input component using a standard input element with Tailwind classes
const Input = ({ className, ...props }) => (
    <input
        className={`w-full px-4 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition-colors duration-200 ${className}`}
        {...props}
    />
);

// Mock DropdownMenu and related components
const DropdownMenu = ({ children }) => <div className="relative">{children}</div>;
const DropdownMenuTrigger = ({ children, asChild, ...props }) => {
    if (asChild) {
        return React.cloneElement(React.Children.only(children), props);
    }
    return <button {...props}>{children}</button>;
};
const DropdownMenuContent = ({ children, className }) => (
    <div className={`absolute top-full mt-2 w-full p-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg z-50 transition-transform origin-top scale-100 ${className}`}>
        {children}
    </div>
);
const DropdownMenuItem = ({ children, onClick, className }) => (
    <div
        className={`px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 ${className}`}
        onClick={onClick}
    >
        {children}
    </div>
);
const DropdownMenuSeparator = () => (
    <div className="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
);


// The main App component
function App() {
    const [jobTitle, setJobTitle] = useState('');
    const [experience, setExperience] = useState('');
    const [location, setLocation] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [ctcRange, setCtcRange] = useState('');
    const [JOBS, setJOBS] = useState([])
    const [selectedJobs, setSelectedJobs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isCtcDropdownOpen, setIsCtcDropdownOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [jobsPerPage, setJobsPerPage] = useState(8);
    const [isJobsPerPageDropdownOpen, setIsJobsPerPageDropdownOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [emailToShare, setEmailToShare] = useState('');
    const [isLinkCopied, setIsLinkCopied] = useState(false);
    const [totalPages, setTotalPages] = useState(0);

    // State for the editable fields
    const firstSelectedJob = selectedJobs[0] || {};
    const [editedTitle, setEditedTitle] = useState(firstSelectedJob.title || '');
    const [editedLocation, setEditedLocation] = useState(firstSelectedJob.location || '');
    const [editedDescription, setEditedDescription] = useState(firstSelectedJob.description || '');

    const dropdownRef = useRef(null);
    const jobsPerPageDropdownRef = useRef(null);
    const shareModalRef = useRef(null);

    // Calculate total pages and jobs to display

    const displayedJobs = JOBS


    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await fetch(`/api/job/get-all-jd/?${searchQuery}&page=${currentPage}&limit=${jobsPerPage}`);
                if (!res.ok) throw new Error("Failed to fetch jobs");

                const data = await res.json();
                setJOBS(data?.jobs || []);
                setTotalPages(data.totalPages || 1);
            } catch (err) {
                console.error(err);
            }
        };

        fetchJobs();
    }, [currentPage, jobsPerPage, searchQuery]);



    const handleSearch = () => {
        // Keep separate query params instead of one combined string
        const params = new URLSearchParams({
            title: jobTitle,
            experience: experience,
            location: location,
            ctcRange: ctcRange,
        });

        setCurrentPage(1);
        setSearchQuery(params.toString()); // pass as query string
    };


    const handleJobSelect = (job) => {
        setSelectedJobs(prev =>
            prev.some(j => j.id === job.id)
                ? prev.filter(j => j.id !== job.id)
                : [...prev, job]
        );
    };

    const handlePageChange = (direction) => {
        if (direction === 'next' && currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        } else if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // const handleCreateJob = () => {
    //     // Implement logic for creating a new job description

    //     console.log("Create a new job description...");
    // }

    const generateShareContent = () => {
        const content = selectedJobs.map(job =>
            `Job Title: ${job.title}\nLocation: ${job.location}`
        ).join('\n\n');
        return content;
    };

    const handleShareEmail = () => {
        if (!emailToShare) {
            return;
        }
        const emailSubject = 'Check out these job descriptions!';
        const emailBody = generateShareContent();

        const mailtoLink = `mailto:${emailToShare}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.location.href = mailtoLink;
        setIsShareModalOpen(false);
    };

    const handleShareLinkedIn = () => {
        const shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent('Check out these jobs!')}`;
        window.open(shareUrl, '_blank');
        setIsShareModalOpen(false);
    };

    const handleCopyLink = () => {
        const shareContent = generateShareContent();
        navigator.clipboard.writeText(shareContent)
            .then(() => {
                setIsLinkCopied(true);
                setTimeout(() => setIsLinkCopied(false), 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    };

    const handleApply = () => {
        if (selectedJobs.length === 1) {
            console.log(`Applying for job: ${selectedJobs[0].title}`);
            // In a real app, this would redirect to an application page
        }
    };

    const handleSave = () => {
        console.log('Saving changes:', {
            title: editedTitle,
            location: editedLocation,
            description: editedDescription,
        });
        setIsEditing(false); // Exit edit mode
    };

    const handleJobsPerPageChange = (count) => {
        setJobsPerPage(count);
        setCurrentPage(1); // Reset to page 1 to prevent issues
        setIsJobsPerPageDropdownOpen(false);
    };

    // Effect to handle clicking outside the dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsCtcDropdownOpen(false);
            }
            if (jobsPerPageDropdownRef.current && !jobsPerPageDropdownRef.current.contains(event.target)) {
                setIsJobsPerPageDropdownOpen(false);
            }
            if (isShareModalOpen && shareModalRef.current && !shareModalRef.current.contains(event.target)) {
                setIsShareModalOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef, jobsPerPageDropdownRef, isShareModalOpen]);

    // Update the editable state whenever a new job is selected
    useEffect(() => {
        if (selectedJobs.length === 1) {
            const job = selectedJobs[0];
            setEditedTitle(job.title);
            setEditedLocation(job.location);
            setEditedDescription(job.description);
            setIsEditing(false); // Reset to view mode when a new job is selected
        }
    }, [selectedJobs]);

    const isJobSelected = (jobId) => selectedJobs.some(j => j.id === jobId);

    return (
        <div className="h-screen bg-gray-100 dark:bg-gray-900 font-sans p-2 text-xs flex flex-col">
            <div className="bg-white dark:bg-gray-950 rounded-xl shadow-md p-5 flex-1 flex flex-col gap-4">

                {/* Search Header */}
                <div className="flex flex-col md:flex-row items-center gap-4 mt-5">
                    <div className="flex-1 w-full">
                        <Input
                            id="job-title"
                            type="text"
                            placeholder="Job Title"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            className="w-full text-xs"
                        />
                    </div>

                    <div className="flex-1 w-full">
                        <Input
                            id="experience"
                            type="text"
                            placeholder="Experience in years"
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            className="w-full text-xs"
                        />
                    </div>

                    <div className="flex-1 w-full">
                        <Input
                            id="location"
                            type="text"
                            placeholder="Location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full text-xs"
                        />
                    </div>

                    <div className="flex-1 w-full relative" ref={dropdownRef}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-between px-4 py-2"
                                    onClick={() => setIsCtcDropdownOpen(!isCtcDropdownOpen)}
                                >
                                    <span className="text-gray-500 text-xs">{ctcRange || "CTC Range"}</span>
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                </Button>
                            </DropdownMenuTrigger>
                            {isCtcDropdownOpen && (
                                <DropdownMenuContent>
                                    {mockCtcOptions.map(option => (
                                        <DropdownMenuItem
                                            key={option.value}
                                            onClick={() => {
                                                setCtcRange(option.label);
                                                setIsCtcDropdownOpen(false);
                                            }}
                                        >
                                            {option.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            )}
                        </DropdownMenu>
                    </div>

                    <Button variant="solid" size="icon" onClick={handleSearch}>
                        <Search className="h-4 w-4" />
                    </Button>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">

                    {/* Left Panel: Available Job Descriptions */}
                    <div className="col-span-1 flex flex-col gap-4 overflow-y-auto">
                        <div className="flex items-center justify-between mt-5">
                            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                Available Job Descriptions
                            </h2>
                            <div className="flex items-center gap-5">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsJobsPerPageDropdownOpen(!isJobsPerPageDropdownOpen)}
                                        >
                                            <span className="text-xs text-gray-500">Show {jobsPerPage}</span>
                                            <ChevronDown className="h-4 w-4 text-gray-500 ml-1" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    {isJobsPerPageDropdownOpen && (
                                        <DropdownMenuContent className="w-20">
                                            {[5, 8, 10, 15, 20].map(count => (
                                                <DropdownMenuItem
                                                    key={count}
                                                    onClick={() => handleJobsPerPageChange(count)}
                                                >
                                                    {count}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    )}
                                </DropdownMenu>
                                {selectedJobs.length > 0 && (
                                    <Button variant="outline" className="flex items-center gap-1" onClick={() => setIsShareModalOpen(true)}>
                                        <span className="text-xs">Share ({selectedJobs.length})</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" x2="12" y1="2" y2="15" /></svg>
                                    </Button>
                                )}
                                <Link href={"/dashboard/job-descriptions/create-jd"}>
                                    <Button
                                        variant="ghost"
                                        className="flex items-center gap-1"
                                    // onClick={handleCreateJob}
                                    >
                                        <span className="text-green-500 font-semibold text-xs">+ Create a Job Description</span>
                                    </Button>
                                </Link>

                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {displayedJobs.map((job) => (
                                <div
                                    key={job.id}
                                    className={`
                                        bg-gray-50 dark:bg-gray-950 rounded-xl shadow-sm p-3 cursor-pointer
                                        flex items-center gap-3 transition-transform hover:scale-[1.02]
                                        ${isJobSelected(job.id) ? 'border-2 border-green-500 bg-gray-100 dark:bg-gray-800 shadow-lg' : ''}
                                    `}
                                    onClick={() => handleJobSelect(job)}
                                >
                                    <div className="relative">
                                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-xl">
                                            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2-8H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2z" />
                                            </svg>
                                        </div>
                                        {isJobSelected(job.id) && (
                                            <div className="absolute top-0 right-0 -mt-1 -mr-1">
                                                <svg className="w-4 h-4 text-green-500 fill-current" viewBox="0 0 20 20"><path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm3.707 7.707L9 12.414 6.293 9.707a1 1 0 00-1.414 1.414l3.707 3.707a1 1 0 001.414 0l4.707-4.707a1 1 0 00-1.414-1.414z" /></svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-xs">{job.title}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{job.location}</p>
                                    </div>
                                    <div className="text-green-500">
                                        {isJobSelected(job.id) && (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-end gap-2 mt-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handlePageChange('prev')}
                                disabled={currentPage === 1}
                                className="disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                Page {currentPage} | {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handlePageChange('next')}
                                disabled={currentPage === totalPages}
                                className="disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Right Panel: Job Details */}

                    <div className="col-span-1 bg-gray-50 dark:bg-gray-950 rounded-xl shadow-md p-5 flex flex-col gap-4">
                        {selectedJobs.length === 1 ? (
                            <>
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Job Description</h2>
                                    <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
                                        <Pencil className="h-4 w-4 text-gray-500" />
                                    </Button>
                                </div>

                                {isEditing ? (
                                    <div className="flex flex-col gap-4 h-full">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Job Title</label>
                                            <Input
                                                type="text"
                                                value={editedTitle}
                                                onChange={(e) => setEditedTitle(e.target.value)}
                                                className="font-normal text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Location</label>
                                            <Input
                                                type="text"
                                                value={editedLocation}
                                                onChange={(e) => setEditedLocation(e.target.value)}
                                                className="font-normal text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700"
                                            />
                                        </div>

                                        <div className="flex flex-col flex-1">
                                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Job Description Details</label>
                                            <textarea
                                                value={
                                                    typeof editedDescription === "string"
                                                        ? editedDescription
                                                        : [
                                                            editedDescription.about,
                                                            "Key Responsibilities:",
                                                            editedDescription.key_responsibilities?.join("\n"),
                                                            "Qualifications:",
                                                            editedDescription.qualifications?.join("\n"),
                                                            "What We Offer:",
                                                            editedDescription.what_we_offer?.join("\n"),
                                                        ].join("\n\n")
                                                }
                                                onChange={(e) => setEditedDescription(e.target.value)}
                                                className="w-full flex-1 h-40 p-3 text-xs text-gray-600 dark:text-gray-400 border rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-900 resize-none"
                                            />
                                        </div>

                                        <div className="flex justify-end mt-2">
                                            <Button variant="solid" onClick={handleSave}>Save Changes</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col flex-1 gap-3">
                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                            Job Title: <span className="font-normal text-gray-500">{firstSelectedJob.title}</span>
                                        </p>
                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                            Location: <span className="font-normal text-gray-500">{firstSelectedJob.location}</span>
                                        </p>
                                        <div className="flex-1 overflow-y-auto">
                                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 text-xs">Job Description Details</h3>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line">
                                                {typeof firstSelectedJob.description === "string"
                                                    ? firstSelectedJob.description
                                                    : [
                                                        firstSelectedJob.description.about,
                                                        "Key Responsibilities:",
                                                        firstSelectedJob.description.key_responsibilities?.join("\n"),
                                                        "Qualifications:",
                                                        firstSelectedJob.description.qualifications?.join("\n"),
                                                        "What We Offer:",
                                                        firstSelectedJob.description.what_we_offer?.join("\n"),
                                                    ].join("\n\n")}
                                            </p>
                                        </div>
                                        <Button variant="solid" size="sm" className="mt-2" onClick={handleApply}>
                                            Apply Now
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : selectedJobs.length > 1 ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                    Select a single job description to view and edit its details.
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                    Based on the selection of the Job description, the details will populate.
                                </p>
                            </div>
                        )}
                    </div>


                </div>
            </div>

            {/* Share Modal */}
            {isShareModalOpen && (
                <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-950/70 flex items-center justify-center z-50 p-4" onClick={() => setIsShareModalOpen(false)}>
                    <div ref={shareModalRef} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-md p-6 relative" onClick={e => e.stopPropagation()}>
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            onClick={() => setIsShareModalOpen(false)}
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Share Job Descriptions</h2>

                        <div className="flex flex-col gap-4">
                            <div className="relative">
                                <Input
                                    type="email"
                                    placeholder="Enter email address"
                                    value={emailToShare}
                                    onChange={(e) => setEmailToShare(e.target.value)}
                                    className="pr-12"
                                />
                                <Button
                                    variant="solid"
                                    size="icon"
                                    onClick={handleShareEmail}
                                    className="absolute right-1 top-1 h-7 w-7"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                </Button>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="h-px w-full bg-gray-200 dark:bg-gray-700"></div>
                                <span className="text-gray-400 font-medium text-xs">or</span>
                                <div className="h-px w-full bg-gray-200 dark:bg-gray-700"></div>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full justify-center gap-2"
                                onClick={handleShareLinkedIn}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                                Share on LinkedIn
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full justify-center gap-2"
                                onClick={handleCopyLink}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                {isLinkCopied ? 'Copied!' : 'Copy Link'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
