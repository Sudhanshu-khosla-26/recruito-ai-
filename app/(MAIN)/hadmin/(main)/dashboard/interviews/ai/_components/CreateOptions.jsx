"use client"
import { Video, ChevronDown, X } from 'lucide-react'
import Link from 'next/link'
import React, { useState, useRef, useEffect } from 'react'

// Mock candidate data
const candidates = [
  { id: 1, name: "Sana Shaikh", position: "Frontend Developer", appliedDate: "2025-09-10", interviewType: "AI" },
  { id: 2, name: "Ratikant Mishra", position: "Backend Developer", appliedDate: "2025-09-12", interviewType: "HR" },
  { id: 3, name: "Anita Verma", position: "Frontend Developer", appliedDate: "2025-09-11", interviewType: "AI" },
  { id: 4, name: "Vikram Rao", position: "HR Manager", appliedDate: "2025-09-09", interviewType: "AI" },
  { id: 5, name: "Neha Sharma", position: "Frontend Developer", appliedDate: "2025-09-08", interviewType: "AI" },
  { id: 6, name: "Amit Singh", position: "Backend Developer", appliedDate: "2025-09-07", interviewType: "AI" },
  { id: 7, name: "Sana Shaikh", position: "Frontend Developer", appliedDate: "2025-09-10", interviewType: "AI" },
  { id: 8, name: "Ratikant Mishra", position: "Backend Developer", appliedDate: "2025-09-12", interviewType: "HR" },
  { id: 9, name: "Anita Verma", position: "Frontend Developer", appliedDate: "2025-09-11", interviewType: "AI" },
  { id: 10, name: "Vikram Rao", position: "HR Manager", appliedDate: "2025-09-09", interviewType: "AI" },
  { id: 11, name: "Neha Sharma", position: "Frontend Developer", appliedDate: "2025-09-08", interviewType: "AI" },
  { id: 12, name: "Amit Singh", position: "Backend Developer", appliedDate: "2025-09-07", interviewType: "AI" },  
]

const jdList = ["Frontend Developer", "Backend Developer", "HR Manager"]

function CreateOptions() {
  const [selectedJD, setSelectedJD] = useState("")
  const [jdSearch, setJdSearch] = useState("")
  const [candidateSearch, setCandidateSearch] = useState("")
  const [selectedCandidates, setSelectedCandidates] = useState([])
  const [page, setPage] = useState(1)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const perPage = 5
  const dropdownRef = useRef(null)

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter JD list based on type
  const filteredJDs = jdList.filter(jd => jd.toLowerCase().includes(jdSearch.toLowerCase()))

  // Filter candidates
  const filteredCandidates = candidates.filter(
    (c) =>
      (!selectedJD || c.position === selectedJD) &&
      c.interviewType === "AI" &&
      c.name.toLowerCase().includes(candidateSearch.toLowerCase())
  )

  const totalPages = Math.ceil(filteredCandidates.length / perPage)
  const startIndex = (page - 1) * perPage
  const paginatedCandidates = filteredCandidates.slice(startIndex, startIndex + perPage)

  const toggleCandidate = (id) => {
    setSelectedCandidates((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  // Reset functions
  const resetJD = () => {
    setSelectedJD("")
    setJdSearch("")
    setPage(1)
  }

  const resetCandidateSearch = () => {
    setCandidateSearch("")
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* JD Selection */}
      <div className="bg-white w-full border border-gray-200 rounded-lg p-4 relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-1">Select JD</label>
        <div
          className="w-64 border border-gray-300 rounded-lg p-2 text-sm flex justify-between items-center cursor-pointer"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span>{selectedJD || "-- Select JD --"}</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </div>

        {/* Dropdown options with type search */}
        {dropdownOpen && (
          <div className="absolute top-full left-0 w-64 border border-gray-300 rounded-lg bg-white mt-1 z-10 shadow max-h-40 overflow-y-auto">
            <div className="flex items-center">
              <input
                type="text"
                value={jdSearch}
                onChange={(e) => setJdSearch(e.target.value)}
                placeholder="Type to search..."
                className="w-full px-2 py-1 text-sm border-b border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {jdSearch && (
                <X
                  className="h-4 w-4 text-gray-500 cursor-pointer ml-1"
                  onClick={resetJD}
                />
              )}
            </div>
            {filteredJDs.length > 0 ? (
              filteredJDs.map((jd) => (
                <div
                  key={jd}
                  className="px-2 py-2 text-sm cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSelectedJD(jd)
                    setDropdownOpen(false)
                    setJdSearch(jd)
                    setPage(1)
                  }}
                >
                  {jd}
                </div>
              ))
            ) : (
              <div className="px-2 py-2 text-sm text-gray-500">No JD found</div>
            )}
          </div>
        )}
      </div>

      {/* Candidate Selection Card */}
      {selectedJD && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm min-h-[360px] flex flex-col">
          <div className="flex justify-between items-center mb-3 border-b pb-2">
            <h3 className="text-sm font-semibold text-gray-800">
              Candidates for {selectedJD} (Interview with AI)
            </h3>
            {/* Candidate name type search with reset */}
            <div className="flex items-center gap-1">
              <input
                type="text"
                placeholder="Search candidate..."
                value={candidateSearch}
                onChange={(e) => {
                  setCandidateSearch(e.target.value)
                  setPage(1)
                }}
                className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {candidateSearch && (
                <X
                  className="h-4 w-4 text-gray-500 cursor-pointer"
                  onClick={resetCandidateSearch}
                />
              )}
            </div>
          </div>

          {filteredCandidates.length > 0 ? (
            <>
              <div className="flex flex-col gap-2 flex-1">
                {paginatedCandidates.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition"
                  >
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(c.id)}
                        onChange={() => toggleCandidate(c.id)}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800">{c.name}</span>
                        <span className="text-xs text-gray-500">{c.position} • {c.appliedDate}</span>
                      </div>
                    </label>

                    {selectedCandidates.includes(c.id) && (
                      <Link href={'/dashboard/interviews/ai/create-interview'}>
                        <button
                          type="button"
                          className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded px-2 py-1 transition-colors duration-200"
                        >
                          <Video className="h-3 w-3" />
                          Create Interview
                        </button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-2 py-1 text-xs border rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-gray-600">Page {page} of {totalPages}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2 py-1 text-xs border rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-sm flex-1">No candidates found.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default CreateOptions
