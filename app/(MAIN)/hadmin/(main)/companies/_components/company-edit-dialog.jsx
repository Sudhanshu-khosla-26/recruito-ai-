"use client"

import React, { useEffect, useRef, useState } from "react"

export function CompanyEditDialog({ open, onOpenChange, onUpdate, company }) {
    const ref = useRef(null)
    const [logoPreview, setLogoPreview] = useState(company?.logo || null)
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

    function handleSubmit(form) {
        const fd = new FormData(form)

        if (!fd.get("company_name") || !fd.get("admin_email") || !fd.get("company_email")) {
            alert("Please fill Company Name, Admin Email, and Company Email.")
            return
        }

        onUpdate(company.id, fd)
    }

    if (!open || !company) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div
                ref={ref}
                className="w-full max-w-2xl max-h-[90vh] bg-card border rounded-xl flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-label="Edit company"
            >
                <div className="flex items-center justify-between p-4 md:p-6 pb-3 border-b">
                    <h3 className="text-sm font-semibold">Edit Company</h3>
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

                <div className="overflow-y-auto p-4 md:p-6 pt-3">
                    <form
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        onSubmit={(e) => {
                            e.preventDefault()
                            handleSubmit(e.currentTarget)
                        }}
                    >
                        <Field label="Company Name" name="company_name" defaultValue={company.company_name} required />
                        <Field label="Industry" name="industry" defaultValue={company.industry} required />
                        <Field label="Admin Email" name="admin_email" type="email" defaultValue={company.admin_email} required />
                        <Field label="Company Email" name="company_email" type="email" defaultValue={company.company_email} required />
                        <Field label="Website" name="website" defaultValue={company.website} />
                        <Field label="Address" name="address" defaultValue={company.address} required />
                        <div>
                            <Label>Company Size</Label>
                            <select
                                name="company_size"
                                className="w-full h-9 rounded-xl border border-input bg-card text-sm px-3"
                                defaultValue={company.company_size}
                            >
                                <option value="1-10">1-10</option>
                                <option value="11-50">11-50</option>
                                <option value="51-200">51-200</option>
                                <option value="201-500">201-500</option>
                                <option value="500+">500+</option>
                            </select>
                        </div>
                        <div>
                            <Label>Status</Label>
                            <select
                                name="status"
                                className="w-full h-9 rounded-xl border border-input bg-card text-sm px-3"
                                defaultValue={company.status}
                            >
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <Label>Description</Label>
                            <textarea
                                name="description"
                                rows={3}
                                className="w-full rounded-xl border border-input bg-card text-sm px-3 py-2"
                                defaultValue={company.description}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Label>Company Logo (optional - leave empty to keep current)</Label>
                            <input
                                type="file"
                                name="logofile"
                                accept="image/jpeg, image/png, image/webp"
                                onChange={handleLogoChange}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                            />
                            {logoPreview && <img src={logoPreview} alt="Logo Preview" className="mt-2 h-16 w-16 object-cover rounded-md" />}
                        </div>

                        <div className="md:col-span-2">
                            <Label>Additional Documents (optional)</Label>
                            <input
                                type="file"
                                name="documents"
                                multiple
                                onChange={handleDocumentsChange}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                            />
                            {documentNames.length > 0 && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                    <strong>Selected:</strong> {documentNames.join(", ")}
                                </div>
                            )}
                        </div>

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
                                Update Company
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}



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