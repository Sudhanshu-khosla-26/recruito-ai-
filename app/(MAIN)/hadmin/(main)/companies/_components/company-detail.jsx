import React from "react"
import { Building2, Globe, Mail, MapPin, FileText, CalendarDays, Edit2Icon } from "lucide-react"
// import { Company } from "../page"

export function CompanyDetail({ company }) {
    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold">Company Details
                </h2>
                <div className="hover:bg-gray-200 p-2 cursor-pointer rounded-lg">
                    <Edit2Icon className="  h-4 w-4 " />
                </div>
            </div>

            <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-accent">
                    <Building2 className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-semibold">{company.company_name}</h3>
                    <p className="text-xs text-muted-foreground">
                        {(company.industry || "General") + " • " + company.company_size}
                    </p>
                </div>
                <span
                    className={`inline-flex items-center h-6 px-2 rounded-lg text-[10px] font-medium border ${company.status === "active"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : company.status === "suspended"
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-gray-100 border-gray-200 text-gray-700"
                        }`}
                    aria-label={`Status: ${company.status}`}
                >
                    {company.status}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-b pb-4">
                <Item label="Admin Email" value={company.admin_email} icon={<Mail className="h-4 w-4" />} />
                <Item label="Company Email" value={company.company_email} icon={<Mail className="h-4 w-4" />} />
                <Item
                    label="Website"
                    value={company.website || "—"}
                    icon={<Globe className="h-4 w-4" />}
                    isLink={!!company.website}
                />
                <Item label="Address" value={company.address || "—"} icon={<MapPin className="h-4 w-4" />} />
                <Item
                    label="Documents"
                    value={company.documents || "—"}
                    icon={<FileText className="h-4 w-4" />}
                    isLink={!!company.documents}
                />
            </div>

            <div className="flex-1 min-h-0">
                <h4 className="text-xs font-semibold mb-2">About</h4>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {company.description || "No description provided."}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px] text-muted-foreground">
                <div>
                    <span className="font-medium">Created:</span> {new Date(company.created_at).toLocaleString()}
                </div>
                <div>
                    <span className="font-medium">Updated:</span> {new Date(company.updated_at).toLocaleString()}
                </div>
                {/* <div className="md:col-span-2 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span className="font-medium">Activated:</span>{" "}
                    {company.activated_at ? new Date(company.activated_at).toLocaleString() : "—"}
                </div> */}
            </div>


        </div>
    )
}

function Item({
    label,
    value,
    icon,
    isLink,
}) {
    return (
        <div className="flex items-start gap-2">
            {icon ? <span className="mt-0.5 text-muted-foreground">{icon}</span> : null}
            <div>
                <p className="text-[11px] text-muted-foreground">{label}</p>
                {/* {isLink && value && value.startsWith("http" || "https") ? ( */}
                {isLink && value ? (
                    <a href={value} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 hover:underline">
                        {value}
                    </a>
                ) : (
                    <p className="text-xs">{value}</p>
                )}
            </div>
        </div>
    )
}
