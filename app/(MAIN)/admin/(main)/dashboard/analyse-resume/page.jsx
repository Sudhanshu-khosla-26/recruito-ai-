"use client";
import React, { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios'; // Make sure to install axios: npm install axios

// --- UI Components ---
const Input = ({ className, ...props }) => (
    <input
        className={`w-full px-4 py-2 text-xs border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 ${className}`}
        {...props}
    />
);

const Button = ({ children, variant, className, ...props }) => {
    let baseStyles = 'flex items-center justify-center font-medium rounded-full transition-colors duration-200 text-xs px-4 py-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed';
    if (variant === 'primary') {
        baseStyles += ' bg-green-500 text-white hover:bg-green-600';
    } else if (variant === 'secondary') {
        baseStyles += ' bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600';
    } else if (variant === 'orange') {
        baseStyles += ' bg-orange-500 text-white hover:bg-orange-600';
    }
    return (
        <button className={`${baseStyles} ${className}`} {...props}>
            {children}
        </button>
    );
};

const FileItem = ({ fileName, onRemove, onSelect, isSelected }) => {
    const [isHovered, setIsHovered] = useState(false);
    const displayFileName = fileName.replace(/\.(pdf|doc|docx)$/i, '');

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


// --- View-Specific Components ---
const ProgressView = ({ percentage, currentFileName, currentFileIndex, totalFiles, currentStage }) => (
    <div className="flex flex-col items-center justify-center h-full w-full text-center p-6">
        <h2 className="text-2xl font-bold mb-4">Screening in Progress...</h2>
        <p className="text-gray-500 mb-10">Please wait while we analyze the resumes. This may take a few moments.</p>

        <div className="w-full max-w-lg">
            <div className="flex justify-between items-center mb-2 text-sm">
                <span className="font-medium text-gray-600 dark:text-gray-300 truncate">
                    Analyzing: <strong>{currentFileName}</strong>
                </span>
                <span className="text-gray-500">{currentFileIndex} of {totalFiles}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 mb-2">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: `${percentage}%`, transition: 'width 0.4s ease-in-out' }}></div>
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                <span>Stage: {currentStage}</span>
                <span>{percentage}%</span>
            </div>
        </div>
    </div>
);


const ResultsDashboard = ({ analyzedData, onBack, jdTitle }) => {
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [viewMode, setViewMode] = useState("table");

    // NEW: Helper to convert camelCase to a readable format (e.g., skillAnalysis -> Skill Analysis)
    const formatCamelCase = (str) => {
        if (!str) return '';
        const result = str.replace(/([A-Z])/g, ' $1');
        return result.charAt(0).toUpperCase() + result.slice(1);
    };

    // UPDATED: Now handles non-string/invalid date values gracefully
    const formatDate = (dateObj) => {
        // Firebase Timestamps are objects with _seconds property. This handles both that and standard date strings.
        if (dateObj && dateObj._seconds) {
            return new Date(dateObj._seconds * 1000).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
        }
        if (typeof dateObj === 'string' && new Date(dateObj).getTime()) {
            return new Date(dateObj).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
        }
        return 'N/A';
    };

    const getScoreColor = (score) => {
        const numericScore = parseFloat(score);
        if (numericScore >= 9) return "bg-green-600 hover:bg-green-700";
        if (numericScore >= 8) return "bg-green-300 hover:bg-green-400 text-black";
        if (numericScore >= 7) return "bg-orange-400 hover:bg-orange-500 text-black";
        return "bg-red-500 hover:bg-red-600";
    };

    return (
        <div className="w-full h-full overflow-y-auto bg-gray-50 text-sm p-6 dark:bg-gray-900">
            <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold">Screening Results</h2>
                        <p className="text-sm text-gray-500">Analyzed against job: <span className="font-semibold">{jdTitle}</span></p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setViewMode(viewMode === "table" ? "tiles" : "table")} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-xs">
                            {viewMode === "table" ? "Switch to Tiles View" : "Switch to Table View"}
                        </button>
                        <Button variant="secondary" onClick={onBack}>Analyze More</Button>
                    </div>
                </div>

                {viewMode === "table" ? (
                    <table className="w-full border-collapse text-xs">
                        <thead>
                            <tr className="text-left text-gray-600 dark:text-gray-400">
                                {/* <th className="p-3">Date</th> */}
                                <th className="p-3">Name</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Job Position</th>
                                <th className="p-3 text-center">Resume Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analyzedData.map((c, idx) => {
                                // UPDATED: Normalize score for a 10-point scale
                                const scoreOutOf10 = c.match_percentage ? (c.match_percentage / 10) : 0;
                                return (
                                    <tr key={idx} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        {/* <td className="p-3">{formatDate(c?.applied_at)}</td> */}
                                        <td className="p-3 font-semibold">{c?.applicant_name || 'N/A'}</td>
                                        <td className="p-3 text-gray-500">{c?.applicant_email || 'N/A'}</td>
                                        <td className="p-3 text-gray-500">{jdTitle || 'N/A'}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => setSelectedCandidate(c)} className={`px-4 py-1 rounded-full text-white text-xs ${getScoreColor(scoreOutOf10)}`}>
                                                {scoreOutOf10 ? `${scoreOutOf10.toFixed(1)}/10` : 'N/A'}
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {analyzedData.map((c, idx) => {
                            // UPDATED: Normalize score for a 10-point scale
                            const scoreOutOf10 = c.match_percentage ? (c.match_percentage / 10) : 0;
                            return (
                                <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow p-4 flex flex-col justify-between text-xs">
                                    <div>
                                        {/* <p className="text-gray-400 text-[10px]">{formatDate(c?.applied_at)}</p> */}
                                        <h3 className="font-bold text-base mt-1">{c?.applicant_name || 'N/A'}</h3>
                                        <p className="text-gray-500 truncate">{c?.applicant_email || 'N/A'}</p>
                                    </div>
                                    <div className="mt-4">
                                        <button onClick={() => setSelectedCandidate(c)} className={`w-full py-1 rounded-full text-white text-xs ${getScoreColor(scoreOutOf10)}`}>
                                            View Score ({scoreOutOf10 ? `${scoreOutOf10.toFixed(1)}/10` : 'N/A'})
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {selectedCandidate && (
                <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl relative text-xs dark:bg-gray-800">
                        <button onClick={() => setSelectedCandidate(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg">✕</button>
                        <h2 className="text-center text-orange-500 font-semibold text-lg mb-4">Resume Score Breakdown</h2>

                        {/* UPDATED: Score is normalized to a 10-point scale */}
                        <div className="text-center mb-4">
                            <span className="font-bold text-2xl">
                                {selectedCandidate?.match_percentage ? (selectedCandidate.match_percentage / 10).toFixed(1) : 'N/A'}
                            </span> / 10
                        </div>

                        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-gray-700 dark:text-gray-300">
                            {/* UPDATED: Reads from 'analyze_parameter' and formats keys */}
                            {selectedCandidate?.analyze_parameter && typeof selectedCandidate.analyze_parameter === 'object' ? (
                                Object.entries(selectedCandidate.analyze_parameter).map(([key, value]) => (
                                    <p key={key} className="border-b dark:border-gray-700 pb-1">
                                        <span className="font-medium">{formatCamelCase(key)}:</span>
                                        {` ${value}`}
                                    </p>
                                ))
                            ) : (
                                <p>No breakdown available.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- Main App Component ---
export default function App() {
    const fileInputRef = useRef(null);
    const searchParams = useSearchParams();

    // UI Flow State
    const [view, setView] = useState('main');
    const [isLoading, setIsLoading] = useState(false);

    // Analysis Progress State
    const [percentage, setPercentage] = useState(0);
    const [currentFileName, setCurrentFileName] = useState('');
    const [currentFileIndex, setCurrentFileIndex] = useState(0);

    // Data State
    const [uploadedResumes, setUploadedResumes] = useState([]);
    const [analyzedData, setAnalyzedData] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);


    const jdId = searchParams.get('jdId');
    const jdTitle = searchParams.get('jdTitle');

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files).map((file, index) => ({
            id: Date.now() + index,
            name: file.name,
            file: file
        }));
        setUploadedResumes(prev => [...prev, ...newFiles]);
        setSelectedFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (fileId) => {
        setUploadedResumes(files => files.filter(f => f.id !== fileId));
        setSelectedFiles(files => files.filter(f => f.id !== fileId));
    };

    const toggleFileSelection = (file) => {
        setSelectedFiles(prev => {
            const isSelected = prev.some(f => f.id === file.id);
            return isSelected ? prev.filter(f => f.id !== file.id) : [...prev, file];
        });
    };

    const getStage = (percent) => {
        if (percent < 10) return 'Initializing...';
        if (percent < 30) return 'Parsing Resume';
        if (percent < 60) return 'Analyzing Skills & Experience';
        if (percent < 90) return 'Calculating Compatibility Score';
        return 'Finalizing';
    };

    const handleAnalyze = async () => {
        if (selectedFiles.length === 0) {
            alert("Please select at least one resume to analyze.");
            return;
        }

        setIsLoading(true);
        setView('progress');
        setAnalyzedData([]);
        setPercentage(0);
        setCurrentFileIndex(0);
        setCurrentFileName('');


        for (let i = 0; i < selectedFiles.length; i++) {
            const resumeFile = selectedFiles[i];
            setCurrentFileIndex(i + 1);
            setCurrentFileName(resumeFile.name);
            setPercentage(Math.round(((i) / selectedFiles.length) * 100));

            const formData = new FormData();
            formData.append("resume", resumeFile.file);
            formData.append("jobId", jdId);

            try {
                const response = await axios.post("/api/job/resume-analyze-create", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                const apiData = response.data.applicationData;
                console.log("API Data:", apiData);


                setAnalyzedData(prev => [...prev, apiData]);



            } catch (error) {
                console.error(`Error analyzing ${resumeFile.name}:`, error);
                setAnalyzedData(prev => [...prev, {
                    name: resumeFile.name.replace(/\.(pdf|doc|docx)$/i, ''),
                    position: jdTitle, email: 'N/A', score: 'N/A', date: new Date().toLocaleDateString(),
                    breakdown: { Error: "Failed to process resume" },
                }]);
            }
        }
        setPercentage(100);
        setIsLoading(false);
        setTimeout(() => {
            setView('analysis');
        }, 500);
    };


    const resetAnalyzer = () => {
        setUploadedResumes([]);
        setSelectedFiles([]);
        setAnalyzedData([]);
        setView('main');
    };

    return (
        <div className="flex flex-col h-screen  dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 p-4">
            <div className="flex-1 flex overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl">
                {view === 'main' && (
                    <div className="flex w-full">
                        <div className="w-1/3 p-6 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                            <h2 className="text-sm font-bold mb-2">Select Job Description</h2>
                            <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-900/50">
                                <span
                                    value={jdTitle}
                                    className="block w-full bg-transparent font-bold text-lg text-green-600 dark:text-green-400 border-none focus:ring-0 appearance-none"
                                >
                                    {jdTitle}

                                </span>
                                <p className="text-xs text-gray-500">Job ID: {jdId}</p>
                            </div>
                            <div className="mt-6 text-xs text-gray-500 space-y-4">
                                <p><strong>1. Upload Resumes:</strong> Use the panel on the right to drag & drop or browse for resume files.</p>
                                <p><strong>2. Select Files:</strong> All uploaded resumes are selected by default. You can deselect any you don't want to screen.</p>
                                <p><strong>3. Start Screening:</strong> Click the 'Analyze' button to begin the automated screening process.</p>
                            </div>
                        </div>

                        <div className="w-2/3 p-6 flex flex-col">
                            <div className="mb-6 flex-shrink-0">
                                <h2 className="text-sm font-bold mb-4">Upload Resumes (.doc, .docx, .pdf)</h2>
                                <div
                                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 transition-colors"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    <p className="text-xs text-gray-500">Drag & drop files here, or <span className="text-orange-500 font-semibold">browse</span></p>
                                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} accept=".doc,.docx,.pdf" />
                                </div>
                            </div>
                            <div className="flex-1 min-h-0">
                                <h2 className="text-sm font-bold mb-4">Files to Analyze ({selectedFiles.length}/{uploadedResumes.length} selected)</h2>
                                <div className="overflow-y-auto pr-2 h-full">
                                    {uploadedResumes.length > 0 ? uploadedResumes.map((file) => (
                                        <FileItem
                                            key={file.id} fileName={file.name}
                                            onRemove={() => removeFile(file.id)}
                                            onSelect={() => toggleFileSelection(file)}
                                            isSelected={selectedFiles.some(f => f.id === file.id)}
                                        />
                                    )) : <p className="text-center text-sm text-gray-400 mt-8">Upload resumes to get started</p>}
                                </div>
                            </div>
                            <div className="flex justify-end mt-5 flex-shrink-0">
                                <Button variant="orange" className="px-8 py-2.5" onClick={handleAnalyze} disabled={isLoading || selectedFiles.length === 0}>
                                    {isLoading ? 'Analyzing...' : `Analyze ${selectedFiles.length} Resume(s)`}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'progress' && (
                    <ProgressView
                        percentage={percentage}
                        currentFileName={currentFileName}
                        currentFileIndex={currentFileIndex}
                        totalFiles={selectedFiles.length}
                        currentStage={getStage(percentage)}
                    />
                )}

                {view === 'analysis' && (
                    <ResultsDashboard
                        analyzedData={analyzedData}
                        onBack={resetAnalyzer}
                        jdTitle={jdTitle}
                    />
                )}
            </div>
        </div>
    );
}