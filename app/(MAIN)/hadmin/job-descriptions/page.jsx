"use client"
import React, { useMemo, useState, useEffect } from "react"
import { Briefcase, ChevronLeft, ChevronRight, Search, MapPin, DollarSign, Calendar, Building2, Eye } from "lucide-react"

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
    let base = "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none"
    if (variant === "solid") base += " bg-emerald-500 text-white hover:bg-emerald-600"
    if (variant === "outline") base += " border border-input bg-card hover:bg-accent"
    if (variant === "ghost") base += " text-emerald-600 hover:bg-accent"
    if (size === "icon") base += " h-9 w-9"
    else if (size === "sm") base += " h-8 px-3 text-xs"
    else base += " h-9 px-4 text-sm"

    return (
        <button className={`${base} ${className}`} {...props}>
            {children}
        </button>
    )
}

function JobDetail({ job }) {
    if (!job) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <p className="text-xs text-muted-foreground text-center">
                    Select a job from the list to view its details.
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold">Job Details</h2>
                <div className="flex items-center gap-2">
                    <span
                        className={`inline-flex items-center h-6 px-3 rounded-lg text-[10px] font-medium border ${job.status === "active"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : job.status === "closed"
                                ? "bg-gray-100 border-gray-200 text-gray-700"
                                : "bg-amber-50 border-amber-200 text-amber-700"
                            }`}
                    >
                        {job.status || "draft"}
                    </span>
                </div>
            </div>

            <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-accent">
                    <Briefcase className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-semibold">{job.title}</h3>
                    <p className="text-xs text-muted-foreground">
                        {job.company_name || "Company"} • {job.job_type || "Full-time"}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-b pb-4">
                <DetailItem
                    label="Location"
                    value={job.location || "—"}
                    icon={<MapPin className="h-4 w-4" />}
                />
                <DetailItem
                    label="Salary Range"
                    value={job.ctc_range || "—"}
                    icon={<DollarSign className="h-4 w-4" />}
                />
                <DetailItem
                    label="Experience"
                    value={job.experience_required || "—"}
                    icon={<Briefcase className="h-4 w-4" />}
                />
                <DetailItem
                    label="Department"
                    value={job.department || "—"}
                    icon={<Building2 className="h-4 w-4" />}
                />
                <DetailItem
                    label="Posted Date"
                    value={job.created_at ? new Date(job.created_at._seconds * 1000).toLocaleDateString() : "—"}
                    icon={<Calendar className="h-4 w-4" />}
                />
                <DetailItem
                    label="Applicants"
                    value={job.applicant_count || "0"}
                    icon={<Eye className="h-4 w-4" />}
                />
            </div>

            <div className="flex-1 min-h-0 overflow-auto">
                {/* About Section */}
                {job.description?.about && (
                    <div className="mb-4">
                        <h4 className="text-xs font-semibold mb-2">About the Role</h4>
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                            {job.description.about}
                        </p>
                    </div>
                )}

                {/* Key Responsibilities */}
                {job.description?.key_responsibilities && job.description.key_responsibilities.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-xs font-semibold mb-2">Key Responsibilities</h4>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                            {job.description.key_responsibilities.map((resp, idx) => (
                                <li key={idx}>{resp}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Qualifications */}
                {job.description?.qualifications && job.description.qualifications.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-xs font-semibold mb-2">Qualifications</h4>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                            {job.description.qualifications.map((qual, idx) => (
                                <li key={idx}>{qual}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* What We Offer */}
                {job.description?.what_we_offer && job.description.what_we_offer.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-xs font-semibold mb-2">What We Offer</h4>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                            {job.description.what_we_offer.map((offer, idx) => (
                                <li key={idx}>{offer}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Fallback for legacy string description */}
                {typeof job.description === 'string' && (
                    <div className="mb-4">
                        <h4 className="text-xs font-semibold mb-2">Job Description</h4>
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                            {job.description}
                        </p>
                    </div>
                )}

                {/* Additional Responsibilities (if exists as separate field) */}
                {job.responsibilities && job.responsibilities.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-xs font-semibold mb-2">Additional Responsibilities</h4>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                            {job.responsibilities.map((resp, idx) => (
                                <li key={idx}>{resp}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Requirements (if exists as separate field) */}
                {job.requirements && job.requirements.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-xs font-semibold mb-2">Requirements</h4>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                            {job.requirements.map((req, idx) => (
                                <li key={idx}>{req}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Skills */}
                {job.skills && job.skills.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-xs font-semibold mb-2">Required Skills</h4>
                        <div className="flex flex-wrap gap-2">
                            {job.skills.map((skill, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-medium"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Show message if no description data */}
                {!job.description && !job.responsibilities && !job.requirements && !job.skills && (
                    <div className="mb-4">
                        <p className="text-xs text-muted-foreground">No description provided.</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px] text-muted-foreground border-t pt-3">
                <div>
                    <span className="font-medium">Created:</span>{" "}
                    {job.created_at ? new Date(job.created_at._seconds * 1000).toLocaleString() : "—"}
                </div>
                {/* <div>
                    <span className="font-medium">Updated:</span>{" "}
                    {job.updated_at ? new Date(job.updated_at._seconds * 1000).toLocaleString() : "—"}
                </div> */}
            </div>
        </div>
    )
}

function DetailItem({ label, value, icon }) {
    return (
        <div className="flex items-start gap-2">
            {icon && <span className="mt-0.5 text-muted-foreground">{icon}</span>}
            <div>
                <p className="text-[11px] text-muted-foreground">{label}</p>
                <p className="text-xs font-medium">{value}</p>
            </div>
        </div>
    )
}

export default function JobsPage() {
    const [jobs, setJobs] = useState([])
    const [selectedJobId, setSelectedJobId] = useState(null)
    const [loading, setLoading] = useState(true)

    // Filters
    const [query, setQuery] = useState("")
    const [jobType, setJobType] = useState("")
    const [status, setStatus] = useState("")

    // Pagination
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(8)

    // Fetch jobs
    const getAllJobs = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/HAdmin/get-all-jd')
            const data = await response.json()

            if (response.ok) {
                setJobs(data.jobs || [])
            } else {
                console.error("Error fetching jobs:", data.error)
                alert("Failed to fetch jobs: " + data.error)
            }
        } catch (error) {
            console.error("Error fetching jobs:", error)
            alert("Could not fetch job data.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getAllJobs()
    }, [])

    // Filter jobs
    const filtered = useMemo(() => {
        return jobs.filter((job) => {
            const matchesQuery =
                !query ||
                job.title?.toLowerCase().includes(query.toLowerCase()) ||
                job.company_name?.toLowerCase().includes(query.toLowerCase()) ||
                job.location?.toLowerCase().includes(query.toLowerCase())
            const matchesJobType = !jobType || job.job_type === jobType
            const matchesStatus = !status || job.status === status
            return matchesQuery && matchesJobType && matchesStatus
        })
    }, [jobs, query, jobType, status])

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))

    const pageItems = useMemo(() => {
        const start = (page - 1) * perPage
        return filtered.slice(start, start + perPage)
    }, [filtered, page, perPage])

    useEffect(() => {
        setPage(1)
    }, [query, jobType, status, perPage])

    return (
        <div className="min-h-dvh py-2 text-xs">
            <div className="bg-card border rounded-xl p-4 md:p-5 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold">Job Management</h1>
                        <p className="text-xs text-muted-foreground">
                            {loading ? "Loading..." : `${filtered.length} job${filtered.length !== 1 ? 's' : ''} found`}
                        </p>
                    </div>
                </div>

                {/* Search + Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                        <Input
                            placeholder="Search by title, company, or location"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            aria-label="Search jobs"
                        />
                    </div>
                    <div>
                        <select
                            className="w-full h-9 rounded-xl border border-input bg-card text-sm px-3"
                            value={jobType}
                            onChange={(e) => setJobType(e.target.value)}
                            aria-label="Filter by job type"
                        >
                            <option value="">All Job Types</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Internship">Internship</option>
                        </select>
                    </div>
                    <div>
                        <select
                            className="w-full h-9 rounded-xl border border-input bg-card text-sm px-3"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            aria-label="Filter by status"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[60vh]">
                    {/* Left: Jobs list */}
                    <div className="flex flex-col gap-3 overflow-auto">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold">Jobs</h2>
                            <div className="flex items-center gap-2">
                                <select
                                    className="h-9 rounded-xl border border-input bg-card text-sm px-3"
                                    value={perPage}
                                    onChange={(e) => setPerPage(Number(e.target.value))}
                                    aria-label="Items per page"
                                >
                                    {[5, 8, 10, 15, 20].map((n) => (
                                        <option key={n} value={n}>
                                            Show {n}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                            </div>
                        ) : pageItems.length === 0 ? (
                            <div className="flex items-center justify-center py-12">
                                <p className="text-xs text-muted-foreground">No jobs found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {pageItems.map((job) => {
                                    const selected = selectedJobId === job.id
                                    return (
                                        <button
                                            key={job.id}
                                            onClick={() => setSelectedJobId(job.id)}
                                            className={`text-left bg-card border rounded-xl p-3 transition-all hover:shadow-md ${selected ? "ring-2 ring-emerald-500 border-transparent" : ""
                                                }`}
                                            aria-pressed={selected}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-xl bg-accent">
                                                    <Briefcase className="h-5 w-5 text-emerald-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-xs truncate">{job.title}</h3>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {job.company_name || "Company"} • {job.job_type || "Full-time"}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {job.location || "Remote"}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground">•</span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {job.applicant_count || 0} applicants
                                                        </span>
                                                    </div>
                                                </div>
                                                <span
                                                    className={`inline-flex items-center h-5 px-2 rounded-md text-[10px] font-medium border ${job.status === "active"
                                                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                                        : job.status === "closed"
                                                            ? "bg-gray-100 border-gray-200 text-gray-700"
                                                            : "bg-amber-50 border-amber-200 text-amber-700"
                                                        }`}
                                                >
                                                    {job.status || "draft"}
                                                </span>
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
                                className="disabled:opacity-50 disabled:cursor-not-allowed"
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
                                className="disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="bg-card border rounded-xl p-5 overflow-auto">
                        <JobDetail job={jobs.find((j) => j.id === selectedJobId)} />
                    </div>
                </div>
            </div>
        </div>
    )
}