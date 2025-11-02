"use client"

import React from "react"
import { useMemo, useState, useEffect } from "react"
import { Building2, ChevronLeft, ChevronRight, Search, Plus } from "lucide-react"
import { CompanyCreateDialog } from "./_components/company-create-dialog"
import { CompanyDetail } from "./_components/company-detail"
import { CompanyEditDialog } from "./_components/company-edit-dialog"
import axios from "axios"
import { toast } from "sonner"

// --- Helper Components (Input, Button) remain the same ---
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


export default function CompaniesPage() {
    const [companies, setCompanies] = useState([])
    const [selectedCompanyId, setSelectedCompanyId] = useState(null)

    // Filters
    const [query, setQuery] = useState("")
    const [industry, setIndustry] = useState("")
    const [status, setStatus] = useState("")

    // Pagination
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(8)
    const totalPages = Math.max(1, Math.ceil(companies.length / perPage))

    // Dialog and Loading State
    const [openCreate, setOpenCreate] = useState(false)
    const [isCreating, setIsCreating] = useState(false) // To handle loading state
    const [openEdit, setOpenEdit] = useState(false)
    const [editingCompany, setEditingCompany] = useState(null)

    // Add edit handler:
    const handleEditCompany = (company) => {
        setEditingCompany(company)
        setOpenEdit(true)
    }

    // Add update handler:
    const handleUpdateCompany = async (companyId, formData) => {
        try {
            const response = await axios.put(`/api/company/${companyId}`, formData)

            if (response.status === 200) {
                toast.success("Company updated successfully!")
                setOpenEdit(false)
                setEditingCompany(null)
                await getallCompany()
            }
        } catch (error) {
            console.error("Error updating company:", error.response?.data || error)
            const errorMessage = error.response?.data?.details || "An unexpected error occurred."
            alert(`Failed to update company: ${errorMessage}`)
        }
    }

    // Add delete handler:
    const handleDeleteCompany = async (companyId) => {
        if (!confirm("Are you sure you want to delete this company? This action cannot be undone.")) {
            return
        }

        try {
            const response = await axios.delete(`/api/company/${companyId}`)

            if (response.status === 200) {
                alert("Company deleted successfully!")
                if (selectedCompanyId === companyId) {
                    setSelectedCompanyId(null)
                }
                await getallCompany()
            }
        } catch (error) {
            console.error("Error deleting company:", error.response?.data || error)
            const errorMessage = error.response?.data?.details || "An unexpected error occurred."
            alert(`Failed to delete company: ${errorMessage}`)
        }
    }

    const getallCompany = async () => {
        try {
            // Using a placeholder API route as in your original code
            const res = await axios.get('/api/HAdmin/get-all-company')
            const rawCompanies = res.data.companies || []

            const transformedCompanies = rawCompanies.map((company) => ({
                ...company,
                created_at: company.created_at?._seconds
                    ? new Date(company.created_at._seconds * 1000).toISOString()
                    : new Date().toISOString(),
                updated_at: company.updated_at?._seconds
                    ? new Date(company.updated_at._seconds * 1000).toISOString()
                    : new Date().toISOString(),
                activated_at: company.activated_at?._seconds
                    ? new Date(company.activated_at._seconds * 1000).toISOString()
                    : null,
            }))

            setCompanies(transformedCompanies)
        } catch (error) {
            console.error("Error fetching companies:", error)
            alert("Could not fetch company data.")
        }
    }

    useEffect(() => {
        getallCompany()
    }, [])

    const filtered = useMemo(() => {
        return companies.filter((c) => {
            const matchesQuery =
                !query ||
                c.company_name.toLowerCase().includes(query.toLowerCase()) ||
                (c.industry || "").toLowerCase().includes(query.toLowerCase())
            const matchesIndustry = !industry || (c.industry || "").toLowerCase() === industry.toLowerCase()
            const matchesStatus = !status || c.status === status
            return matchesQuery && matchesIndustry && matchesStatus
        })
    }, [companies, query, industry, status])

    const pageItems = useMemo(() => {
        const start = (page - 1) * perPage
        return filtered.slice(start, start + perPage)
    }, [filtered, page, perPage])

    useEffect(() => {
        setPage(1)
    }, [query, industry, status, perPage])

    /**
     * ✅ Handles the API call to create a new company.
     * It now expects a FormData object from the dialog.
     */
    const handleCreateCompany = async (formData) => {
        setIsCreating(true)
        try {
            const response = await axios.post("/api/company/", formData)

            if (response.status === 201) {
                alert("Company created successfully!")
                setOpenCreate(false)
                await getallCompany() // Refresh the list to show the new company

                // Optionally, select the newly created company
                const newCompanyId = response.data.id
                if (newCompanyId) {
                    setSelectedCompanyId(newCompanyId)
                }
            }
        } catch (error) {
            console.error("Error creating company:", error.response?.data || error)
            const errorMessage = error.response?.data?.details || "An unexpected error occurred."
            alert(`Failed to create company: ${errorMessage}`)
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div className="min-h-dvh  py-2 text-xs">
            <div className="bg-card border rounded-xl p-4 md:p-5 flex flex-col gap-4">
                {/* Search + Filters */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="md:col-span-2">
                        <Input
                            placeholder="Search company or industry"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            aria-label="Search companies"
                        />
                    </div>
                    <div>
                        <Input
                            placeholder="Industry (e.g., Software)"
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            aria-label="Filter by industry"
                        />
                    </div>
                    <div>
                        <select
                            className="w-full h-9 rounded-xl border border-input bg-card text-sm px-3"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            aria-label="Filter by status"
                        >
                            <option value="">Any Status</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="solid"
                            size="icon"
                            aria-label="Search"
                            onClick={() => {
                                console.log("[v0] search triggered", { query, industry, status })
                            }}
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                        <div className="ml-auto">
                            <Button variant="ghost" onClick={() => setOpenCreate(true)} className="gap-1">
                                <Plus className="h-4 w-4 text-emerald-600" />
                                <span className="text-emerald-600 font-semibold text-xs">Create Company</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[60vh]">
                    {/* Left: Companies list */}
                    <div className="flex flex-col gap-3 overflow-auto">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold">Companies</h2>
                            <div className="flex items-center gap-2">
                                <div className="relative">
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
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {pageItems.map((c) => {
                                const selected = selectedCompanyId === c.id
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => setSelectedCompanyId(c.id)}
                                        className={`text-left bg-card border rounded-xl p-3 flex items-center gap-3 transition-transform hover:scale-[1.01] ${selected ? "ring-2 ring-emerald-500 border-transparent" : ""
                                            }`}
                                        aria-pressed={selected}
                                        aria-label={`Open ${c.company_name} details`}
                                    >
                                        <div className="relative">
                                            <div className="p-2 rounded-xl bg-accent">
                                                <Building2 className="h-5 w-5 text-emerald-600" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-xs">{c.company_name}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {(c.industry || "General") + " • " + c.company_size}
                                            </p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-end gap-2 mt-auto pt-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                aria-label="Previous page"
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
                                aria-label="Next page"
                                className="disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="bg-card border rounded-xl p-5">
                        {selectedCompanyId ? (
                            <CompanyDetail company={companies.find((c) => c.id === selectedCompanyId)}
                                onEdit={handleEditCompany}
                                onDelete={handleDeleteCompany} />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center">
                                <p className="text-xs text-muted-foreground text-center">
                                    Select a company from the list to view its details.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Company Modal */}
            {openCreate && (
                <CompanyCreateDialog open={openCreate} onOpenChange={setOpenCreate} onCreate={handleCreateCompany} />
            )}

            {openEdit && (
                <CompanyEditDialog
                    open={openEdit}
                    onOpenChange={setOpenEdit}
                    onUpdate={handleUpdateCompany}
                    company={editingCompany}
                />
            )}
        </div>
    )
}