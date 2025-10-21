"use client";
import React, { useState, useRef } from 'react';

// --- Mock Components for a self-contained file ---
const Input = ({ className, ...props }) => (
    <input
        className={`w-full px-4 py-2 text-xs border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 ${className}`}
        {...props}
    />
);

const Button = ({ children, variant, className, ...props }) => {
    let baseStyles = 'flex items-center justify-center font-medium rounded-full transition-colors duration-200 text-xs px-4 py-2 shadow-md';
    if (variant === 'primary') {
        baseStyles += ' bg-green-500 text-white hover:bg-green-600';
    } else if (variant === 'secondary') {
        baseStyles += ' bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600';
    } else if (variant === 'ghost') {
        baseStyles += ' text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700';
    } else if (variant === 'orange') {
        baseStyles += ' bg-orange-500 text-white hover:bg-orange-600';
    }
    return (
        <button className={`${baseStyles} ${className}`} {...props}>
            {children}
        </button>
    );
};

const FileItem = ({ fileName, onRemove, onSelect, isSelected, analysis }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    // Function to remove the .pdf extension
    const displayFileName = fileName.replace(/\.pdf$/i, '');

    return (
        <div
            className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 mb-2 cursor-pointer
            ${isSelected ? 'bg-green-100 border-green-500 dark:bg-green-900/50 dark:border-green-500' : 'bg-gray-100 border-transparent hover:border-green-300 dark:bg-gray-800 dark:hover:border-green-700'}`}
            onClick={onSelect}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-center flex-1 min-w-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs truncate flex-1">{displayFileName}</span>
            </div>
            {analysis && (
                <div className="flex-shrink-0 ml-2 text-right">
                    <p className="font-semibold text-green-600 dark:text-green-400">{analysis.score}</p>
                    <p className="text-[10px] text-gray-500">{analysis.summary}</p>
                </div>
            )}
            {onRemove && isHovered && (
                <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="ml-2 text-gray-400 hover:text-red-500 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            )}
        </div>
    );
};

const Toast = ({ message, isVisible }) => {
    return (
        <div
            className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-gray-800 text-white rounded-full shadow-lg transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            {message}
        </div>
    );
};

const AnalysisTable = ({ uploadedResumes, candidateResumes, onBack, selectedJob }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const resumesPerPage = 10;

    const allAnalyzedResumes = [...uploadedResumes, ...candidateResumes].filter(resume => resume.analysis);
    
    // Pagination logic
    const indexOfLastResume = currentPage * resumesPerPage;
    const indexOfFirstResume = indexOfLastResume - resumesPerPage;
    const currentResumes = allAnalyzedResumes.slice(indexOfFirstResume, indexOfLastResume);

    const totalPages = Math.ceil(allAnalyzedResumes.length / resumesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getScoreColor = (score) => {
        const value = parseFloat(score);
        if (value >= 9) return 'bg-green-500';
        if (value >= 8) return 'bg-green-400';
        if (value >= 7) return 'bg-orange-400';
        return 'bg-red-500';
    };

    return (
        <div className="flex flex-col h-full">
            {/* Fixed Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-1">
                    <h2 className="text-xl font-bold">Resume Screening Results</h2>
                </div>
                <p className="text-sm text-gray-500">Results for job: <span className="font-semibold">{selectedJob}</span></p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
                {allAnalyzedResumes.length > 0 ? (
                    <div className="p-4">
                        <div className="w-full">
                            {/* List Header */}
                            <div className="grid grid-cols-4 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 py-3 px-6">
                                <span className="col-span-1">Name</span>
                                <span className="col-span-1">Position (JD)</span>
                                <span className="col-span-1">Candidate Location</span>
                                <span className="col-span-1 text-center">Resume Score</span>
                            </div>
                            {/* List Items */}
                            {currentResumes.map((resume, index) => (
                                <div key={index} className="grid grid-cols-4 items-center text-sm py-4 px-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                                    <div className="col-span-1 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        <span className="font-medium truncate">{resume.name.replace(/\.pdf$/i, '')}</span>
                                    </div>
                                    <span className="col-span-1 truncate text-gray-500 dark:text-gray-400">{selectedJob}</span>
                                    <span className="col-span-1 truncate text-gray-500 dark:text-gray-400">{resume.location}</span>
                                    <div className="col-span-1 flex justify-center">
                                        <span className={`px-4 py-1 rounded-full text-white text-xs font-semibold ${getScoreColor(resume.analysis.score)}`}>
                                            {resume.analysis.score}/10
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">No resumes have been analyzed yet.</p>
                )}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-auto p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        variant="secondary"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="mr-2"
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="secondary"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="ml-2"
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Return Button */}
            <div className="flex justify-center p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <Button variant="secondary" onClick={onBack} className="px-6 py-2">
                    Return to Main
                </Button>
            </div>
        </div>
    );
};

// Main App component
export default function App() {
    const fileInputRef = useRef(null);
    const [selectedJob, setSelectedJob] = useState('HR Manager');
    const [uploadedResumes, setUploadedResumes] = useState([]);
    const [selectedUploaded, setSelectedUploaded] = useState([]);
    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [view, setView] = useState('main');
    const [showToast, setShowToast] = useState(false);

    const [candidateResumes, setCandidateResumes] = useState([
        { name: 'Sana Shaikh.pdf', analysis: null, location: 'Mumbai' },
        { name: 'RohanSingh.pdf', analysis: null, location: 'Bangalore' },
        { name: 'Yashwanth.pdf', analysis: null, location: 'Andhra Pradesh' },
        { name: 'Itikant Resume.pdf', analysis: null, location: 'Delhi' },
        { name: 'Rahul Sanap-24-01-2025.pdf', analysis: null, location: 'Pune' },
        { name: 'Priya Sharma.pdf', analysis: null, location: 'Hyderabad' },
        { name: 'Aditya Mehta.pdf', analysis: null, location: 'Chennai' },
        { name: 'Anjali Desai.pdf', analysis: null, location: 'Ahmedabad' },
        { name: 'Vikram Singh.pdf', analysis: null, location: 'Jaipur' },
        { name: 'Neha Gupta.pdf', analysis: null, location: 'Kolkata' },
        { name: 'Sunil Kumar.pdf', analysis: null, location: 'Lucknow' },
        { name: 'Swati Jain.pdf', analysis: null, location: 'Chandigarh' },
    ]);

    const availableJobs = [
        { id: 'JD-01', title: 'HR Manager' },
        { id: 'JD-02', title: 'Software Engineer' },
        { id: 'JD-03', title: 'Data Scientist' },
        { id: 'JD-04', title: 'Product Manager' },
        { id: 'JD-05', title: 'UX Designer' },
        { id: 'JD-06', title: 'Financial Analyst' },
        { id: 'JD-07', title: 'Marketing Specialist' },
    ];

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setUploadedResumes(prev => [
            ...prev,
            ...files.map(file => ({ name: file.name, analysis: null, location: 'Uploaded' }))
        ]);
        setSelectedUploaded([]); // Clear selection when new files are uploaded
    };

    const handleSelect = (fileName, currentSelection, setSelection) => {
        if (currentSelection.includes(fileName)) {
            setSelection(currentSelection.filter(name => name !== fileName));
        } else {
            setSelection([...currentSelection, fileName]);
        }
    };

    const handleRemoveFile = (fileName) => {
        setUploadedResumes(prev => prev.filter(file => file.name !== fileName));
        setSelectedUploaded(prev => prev.filter(name => name !== fileName));
    };

    const handleRemoveCandidateFile = (fileName) => {
        setCandidateResumes(prev => prev.filter(file => file.name !== fileName));
        setSelectedCandidates(prev => prev.filter(name => name !== fileName));
    };

    const handleAnalyze = async () => {
        const allSelected = [...selectedUploaded, ...selectedCandidates];

        if (allSelected.length === 0 || !selectedJob) {
            console.log("Please select at least one resume and a job description to analyze.");
            return;
        }

        setIsLoading(true);
        setShowToast(true);

        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        // Get the names of the selected files without their extensions for the prompt
        const selectedFileNames = allSelected.map(name => ` - ${name.replace(/\.pdf$/i, '')}`).join('\n');

        const prompt = `
            You are an expert resume analyst.
            Analyze the following resumes for the job description provided.
            Provide a compatibility score (out of 10) and a very brief, one-sentence summary for each resume.
            The response should be a list in the following format for each resume:
            [filename] | Score: [score]/10 | Summary: [one-sentence summary]

            Job Description Details:
            Job Title: ${selectedJob}
            Key Roles & Responsibilities: Develop and implement HR strategies, manage recruitment, and oversee performance appraisal systems.
            Required Skills: Leadership, Team building, HRMS, Interpersonal, Recruitment, Strategic planning.
            Other Requirements: MBA in HR, 5-8 years of experience.

            Resumes to analyze:
            ${selectedFileNames}
        `;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            });
            const result = await response.json();
            const generatedText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (generatedText) {
                const lines = generatedText.split('\n').filter(line => line.trim() !== '');
                const newAnalyses = lines.map(line => {
                    const [fileName, ...rest] = line.split('|').map(s => s.trim());
                    const scoreMatch = rest[0]?.match(/Score: (\d+(\.\d+)?)/);
                    const summary = rest[1]?.replace('Summary:', '').trim();
                    const score = scoreMatch ? scoreMatch[1] : 'N/A';
                    return { fileName: fileName.trim(), score, summary };
                });

                setUploadedResumes(prev => prev.map(resume => {
                    const analysis = newAnalyses.find(a => a.fileName === resume.name.replace(/\.pdf$/i, ''));
                    return analysis ? { ...resume, analysis: { score: analysis.score, summary: analysis.summary } } : resume;
                }));

                setCandidateResumes(prev => prev.map(resume => {
                    const analysis = newAnalyses.find(a => a.fileName === resume.name.replace(/\.pdf$/i, ''));
                    return analysis ? { ...resume, analysis: { score: analysis.score, summary: analysis.summary } } : resume;
                }));
            }
        } catch (error) {
            console.error('Error analyzing resumes:', error);
        } finally {
            setIsLoading(false);
            setShowToast(false);
            setSelectedUploaded([]);
            setSelectedCandidates([]);
            setView('analysis'); // Navigate to analysis view
        }
    };

    const filteredCandidates = candidateResumes.filter(resume =>
        resume.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredUploaded = uploadedResumes.filter(resume =>
        resume.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 p-4">
            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl">
                {view === 'main' ? (
                    <>
                        {/* Left Column */}
                        <div className="flex flex-col w-1/2 p-6 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
                            {/* Job Descriptions */}
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-sm font-bold">Select Job Descriptions</h2>
                                </div>
                                <div className="relative">
                                    <select
                                        id="job-select"
                                        value={selectedJob}
                                        onChange={(e) => setSelectedJob(e.target.value)}
                                        className="block w-full px-4 py-2 text-xs border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 appearance-none pr-8"
                                    >
                                        {availableJobs.map(job => (
                                            <option key={job.id} value={job.title}>
                                                ({job.id}) {job.title}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15 9.293l-1.414-1.414L10 10.586 6.707 7.293 5.293 8.707 9.293 12.95z"/></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Resumes from Candidates */}
                            <div className="flex-1 min-h-0">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-sm font-bold">Uploaded Resumes From Candidates</h2>
                                    <div className="relative w-1/2">
                                        <Input placeholder="Search resumes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                        <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(100% - 40px)' }}>
                                    {filteredCandidates.map((resume, index) => (
                                        <FileItem
                                            key={index}
                                            fileName={resume.name}
                                            onSelect={() => handleSelect(resume.name, selectedCandidates, setSelectedCandidates)}
                                            onRemove={() => handleRemoveCandidateFile(resume.name)}
                                            isSelected={selectedCandidates.includes(resume.name)}
                                            analysis={resume.analysis}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col w-1/2 p-6 overflow-y-auto">
                            {/* Upload Section */}
                            <div className="mb-8 flex-shrink-0">
                                <h2 className="text-sm font-bold mb-4">Upload Resumes (Doc, PDF only)</h2>
                                <div
                                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center text-gray-500 relative cursor-pointer"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28m0 0l4 4m-4-4l-4 4m-4-4l-3.172-3.172a4 4 0 00-5.656 0L8 32m24-4a4 4 0 01-4-4V12m0 0a4 4 0 014-4h8a4 4 0 014 4v8m-4-8a4 4 0 00-4-4" />
                                    </svg>
                                    <p className="mt-2 text-xs">Drag and drop the file(s) to here or <span className="text-orange-500 font-semibold cursor-pointer">use the file browser</span></p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept=".doc,.docx,.pdf"
                                    />
                                </div>
                            </div>

                            {/* Uploaded Resumes */}
                            <div className="flex-1 min-h-0">
                                <h2 className="text-sm font-bold mb-4">Uploaded Resumes</h2>
                                <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(100% - 40px)' }}>
                                    {filteredUploaded.map((resume, index) => (
                                        <FileItem
                                            key={index}
                                            fileName={resume.name}
                                            onRemove={() => handleRemoveFile(resume.name)}
                                            onSelect={() => handleSelect(resume.name, selectedUploaded, setSelectedUploaded)}
                                            isSelected={selectedUploaded.includes(resume.name)}
                                            analysis={resume.analysis}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Analyze Button */}
                            <div className="flex justify-end mt-5 flex-shrink-0">
                                <Button
                                    variant="orange"
                                    className="px-6 py-2"
                                    onClick={handleAnalyze}
                                    disabled={isLoading || (selectedUploaded.length === 0 && selectedCandidates.length === 0)}
                                >
                                    {isLoading ? 'Analyzing...' : 'Analyze'}
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <AnalysisTable
                        uploadedResumes={uploadedResumes}
                        candidateResumes={candidateResumes}
                        onBack={() => setView('main')}
                        selectedJob={selectedJob}
                    />
                )}
            </div>
            <Toast message="Resume Screening is in process... Stay Tuned" isVisible={showToast} />
        </div>
    );
}
