"use client"

import React, { useEffect, useRef, useState } from "react"

export function CompanyCreateDialog({ open, onOpenChange, onCreate }) {
    const ref = useRef(null)
    const [logoPreview, setLogoPreview] = useState(null)
    const [documentNames, setDocumentNames] = useState([])

    useEffect(() => {
        function onClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                onOpenChange(false)
            }
        }
        if (open) {
            document.addEventListener("mousedown", onClickOutside)
        }
        return () => {
            document.removeEventListener("mousedown", onClickOutside)
        }
    }, [open, onOpenChange])

    function handleLogoChange(e) {
        const file = e.target.files?.[0]
        if (file) {
            setLogoPreview(URL.createObjectURL(file))
        } else {
            setLogoPreview(null)
        }
    }

    function handleDocumentsChange(e) {
        const files = e.target.files
        if (files && files.length > 0) {
            setDocumentNames(Array.from(files).map((file) => file.name))
        } else {
            setDocumentNames([])
        }
    }

    // This function now sends FormData directly to the onCreate handler.
    function handleSubmit(form) {
        const fd = new FormData(form)

        // --- Basic Validation ---
        if (!fd.get("company_name") || !fd.get("admin_email") || !fd.get("company_email")) {
            alert("Please fill Company Name, Admin Email, and Company Email.")
            return
        }

        const logoFile = fd.get("logofile")
        if (!logoFile || logoFile.size === 0) {
            alert("Company logo is required.")
            return
        }

        const documentFiles = fd.getAll("documents")
        // The API checks for at least one document. The default file input adds one empty file.
        if (documentFiles.length === 0 || (documentFiles.length === 1 && documentFiles[0].size === 0)) {
            alert("At least one document is required.")
            return
        }

        // Pass the entire FormData object to be sent to the API
        onCreate(fd)
    }

    return open ? (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div
                ref={ref}
                className="w-full max-w-2xl bg-card border rounded-xl p-4 md:p-6"
                role="dialog"
                aria-modal="true"
                aria-label="Create a company"
            >
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">Create Company</h3>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-accent"
                        aria-label="Close"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSubmit(e.currentTarget)
                    }}
                >
                    <Field label="Company Name" name="company_name" required />
                    <Field label="Industry" name="industry" placeholder="e.g., Software" required />
                    <Field label="Admin Email" name="admin_email" type="email" required />
                    <Field label="Company Email" name="company_email" type="email" required />
                    <Field label="Website" name="website" placeholder="https://..." />
                    <Field label="Address" name="address" required />
                    <div>
                        <Label>Company Size</Label>
                        <select
                            name="company_size"
                            className="w-full h-9 rounded-xl border border-input bg-card text-sm px-3"
                            defaultValue="11-50"
                        >
                            <option value="1-10">1-10</option>
                            <option value="11-50">11-50</option>
                            <option value="51-200">51-200</option>
                            <option value="201-500">201-500</option>
                            <option value="500+">500+</option>
                        </select>
                    </div>
                    <div>
                        {/* This field is handled by the API, so it's not needed here */}
                    </div>
                    <div className="md:col-span-2">
                        <Label>Description</Label>
                        <textarea
                            name="description"
                            rows={3}
                            className="w-full rounded-xl border border-input bg-card text-sm px-3 py-2"
                            placeholder="Brief description of the company"
                        />
                    </div>

                    {/* ✅ New File Input for Company Logo */}
                    <div className="md:col-span-2">
                        <Label required>Company Logo</Label>
                        <input
                            type="file"
                            name="logofile"
                            required
                            accept="image/jpeg, image/png, image/webp"
                            onChange={handleLogoChange}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                        />
                        {logoPreview && <img src={logoPreview} alt="Logo Preview" className="mt-2 h-16 w-16 object-cover rounded-md" />}
                    </div>

                    {/* ✅ New File Input for Documents */}
                    <div className="md:col-span-2">
                        <Label required>Company Documents</Label>
                        <input
                            type="file"
                            name="documents"
                            multiple
                            required
                            onChange={handleDocumentsChange}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                        />
                        {documentNames.length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                                <strong>Selected:</strong> {documentNames.join(", ")}
                            </div>
                        )}
                    </div>

                    {/* This is set on the server now, but you can pass the user ID if needed */}
                    <input type="hidden" name="created_by_id" value="user_placeholder_id" />

                    <div className="md:col-span-2 flex items-center justify-end gap-2 pt-1">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="h-9 px-4 rounded-xl border border-input bg-card hover:bg-accent text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="h-9 px-4 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 text-sm"
                        >
                            Create Company
                        </button>
                    </div>
                </form>
            </div>
        </div>
    ) : null
}


// --- Helper Components (Unchanged) ---

function Field(props) {
    const { label, ...rest } = props
    return (
        <div>
            <Label required={rest.required}>{label}</Label>
            <input
                {...rest}
                className={
                    "w-full h-9 rounded-xl border border-input bg-card text-sm px-3 outline-none " +
                    "focus:ring-1 ring-ring focus:border-ring"
                }
            />
        </div>
    )
}

function Label({ children, required }) {
    return (
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            {children}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
    )
}