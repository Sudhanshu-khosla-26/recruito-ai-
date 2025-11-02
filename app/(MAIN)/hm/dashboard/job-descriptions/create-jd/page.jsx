"use client";
import React, { useState, useRef } from 'react';

const Input = ({ label, className, ...props }) => (
    <div>
        {label && <label className="block text-xs font-medium mb-1">{label}</label>}
        <input
            className={`w-full px-4 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 ${className}`}
            {...props}
        />
    </div>
);

const Textarea = ({ label, className, ...props }) => (
    <div>
        {label && <label className="block text-xs font-semibold mb-2">{label}</label>}
        <textarea
            className={`w-full p-4 text-xs border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 ${className}`}
            rows="4"
            {...props}
        />
    </div>
);

const Button = ({ children, variant, className, ...props }) => {
    let baseStyles = 'flex items-center justify-center font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    if (variant === 'primary') {
        baseStyles += ' bg-green-500 text-white hover:bg-green-600 shadow-md';
    } else if (variant === 'secondary') {
        baseStyles += ' bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600';
    } else if (variant === 'ghost') {
        baseStyles += ' text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700';
    }

    return (
        <button className={`${baseStyles} ${className}`} {...props}>
            {children}
        </button>
    );
};

const SkillTag = ({ skill }) => (
    <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-medium mr-2 mb-2">
        {skill}
    </span>
);

export default function App() {
    const [formData, setFormData] = useState({
        jobTitle: '',
        location: '',
        department: '',
        industry: '',
        educationalQualification: '',
        experience: '',
        ctc: '',
        roles: '',
        skills: '',
        others: '',
    });

    const [activeTab, setActiveTab] = useState('Create');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [showSaveButton, setShowSaveButton] = useState(false);

    const fileInputRef = useRef(null);
    const rolesRef = useRef(null);
    const skillsRef = useRef(null);
    const othersRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const mapApiResponseToFormData = (apiResponse) => {
        const {
            title = '',
            companyName = '',
            location = '',
            experience_required = '',
            ctc_range = '',
            key_skills = [],
            good_to_have_skills = [],
            description = {}
        } = apiResponse;

        const {
            about = '',
            key_responsibilities = [],
            qualifications = [],
            what_we_offer = []
        } = description;

        const rolesText = key_responsibilities.length > 0
            ? key_responsibilities.map((resp, idx) => `${idx + 1}. ${resp}`).join('\n\n')
            : '';

        const skillsText = key_skills.length > 0
            ? key_skills.join(', ')
            : '';

        const othersText = [
            about ? `About the Role:\n${about}` : '',
            qualifications.length > 0 ? `\n\nQualifications:\n${qualifications.map((qual, idx) => `${idx + 1}. ${qual}`).join('\n')}` : '',
            good_to_have_skills.length > 0 ? `\n\nGood to Have:\n${good_to_have_skills.map((skill, idx) => `${idx + 1}. ${skill}`).join('\n')}` : '',
            what_we_offer.length > 0 ? `\n\nWhat We Offer:\n${what_we_offer.map((offer, idx) => `${idx + 1}. ${offer}`).join('\n')}` : ''
        ].filter(Boolean).join('');

        setFormData(prev => ({
            ...prev,
            jobTitle: title,
            location: location,
            experience: experience_required,
            ctc: ctc_range,
            roles: rolesText,
            skills: skillsText,
            others: othersText,
        }));
        setShowSaveButton(true);
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch('/api/job/generate-jd-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobRole: formData.jobTitle,
                    location: formData.location,
                    company_name: "NITYA HR",
                    yearsOfExperience: formData.experience,
                    ctcRange: formData.ctc,
                    keySkills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
                    goodtohaveskills: [],
                    others: formData.others
                })
            });

            const result = await response.json();

            let jsondata;
            if (result.job_description && result.job_description.raw_text) {
                const cleanData = result.job_description.raw_text
                    .replace(/```json/g, "")
                    .replace(/```/g, "")
                    .trim();
                jsondata = JSON.parse(cleanData);
            } else if (result.job_description) {
                jsondata = result.job_description;
            } else {
                throw new Error('Invalid API response format');
            }

            mapApiResponseToFormData(jsondata);
        } catch (error) {
            console.error('Error generating JD:', error);
            alert("Failed to generate Job Description. Please try again.");
        }
        setIsGenerating(false);
    };

    const saveJd = async () => {
        const rolesArray = formData.roles
            .split('\n')
            .map(line => line.replace(/^\d+\.\s*/, '').trim())
            .filter(Boolean);

        const skillsArray = formData.skills
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);

        const aboutMatch = formData.others.match(/About the Role:\n(.+?)(?=\n\n|$)/s);
        const qualMatch = formData.others.match(/Qualifications:\n(.+?)(?=\n\n|$)/s);
        const goodToHaveMatch = formData.others.match(/Good to Have:\n(.+?)(?=\n\n|$)/s);
        const offerMatch = formData.others.match(/What We Offer:\n(.+?)(?=\n\n|$)/s);

        const parseList = (text) => text ? text.split('\n').map(line => line.replace(/^\d+\.\s*/, '').trim()).filter(Boolean) : [];

        const apiPayload = {
            title: formData.jobTitle,
            location: formData.location,
            experience_required: formData.experience,
            ctc_range: formData.ctc,
            companyName: "NITYA HR",
            key_skills: skillsArray,
            good_to_have_skills: goodToHaveMatch ? parseList(goodToHaveMatch[1]) : [],
            description: {
                about: aboutMatch ? aboutMatch[1].trim() : `${formData.jobTitle} position in ${formData.industry || 'our company'}.`,
                key_responsibilities: rolesArray,
                qualifications: qualMatch ? parseList(qualMatch[1]) : formData.educationalQualification.split('\n').filter(Boolean),
                what_we_offer: offerMatch ? parseList(offerMatch[1]) : []
            }
        };

        try {
            const res = await fetch('/api/job/create-manual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiPayload)
            });
            const data = await res.json();
            console.log("Save JD response:", data);
            setFormData({
                jobTitle: '',
                location: '',
                department: '',
                industry: '',
                educationalQualification: '',
                experience: '',
                ctc: '',
                roles: '',
                skills: '',
                others: '',
            });
            alert("Job Description Saved Successfully!");
            setShowSaveButton(false);
        } catch (error) {
            console.error("Error saving:", error);
            alert("Error saving Job Description. Please check console for details.");
        }
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
    const handleClick = () => { fileInputRef.current && fileInputRef.current.click(); };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        const validFiles = droppedFiles.filter(file =>
            ['application/pdf', 'application/msword', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)
        );
        if (validFiles.length > 0) {
            setUploadedFiles(prev => [...prev, ...validFiles]);
            handleUpload(validFiles[0]);
        }
    };

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const validFiles = selectedFiles.filter(file =>
            ['application/pdf', 'application/msword', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)
        );
        if (validFiles.length > 0) {
            setUploadedFiles(prev => [...prev, ...validFiles]);
            handleUpload(validFiles[0]);
        }
    };

    const handleRemoveFile = (fileName) => {
        setUploadedFiles(prev => prev.filter(file => file.name !== fileName));
        if (uploadedFiles.length === 1) {
            setFormData({
                jobTitle: '',
                location: '',
                department: '',
                industry: '',
                educationalQualification: '',
                experience: '',
                ctc: '',
                roles: '',
                skills: '',
                others: '',
            });
        }
    };

    const handleUpload = async (file) => {
        setIsGenerating(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            const response = await fetch('/api/job/file-parse', {
                method: 'POST',
                body: uploadFormData
            });
            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.error || 'Failed to parse file');
            }

            const result = await response.json();
            console.log("File parse result:", result);
            mapApiResponseToFormData(result);
        } catch (err) {
            console.error("Upload error:", err);
            alert("Error parsing file: " + err.message);
        }
        setIsGenerating(false);
    };

    const handleSaveEdit = () => {
        if (rolesRef.current && skillsRef.current && othersRef.current) {
            setFormData(prev => ({
                ...prev,
                roles: rolesRef.current.innerText,
                skills: skillsRef.current.innerText,
                others: othersRef.current.innerText,
            }));
        }
        setIsEditing(false);
    };

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        setIsEditing(false);
    };

    const renderSkills = () => {
        if (!formData.skills) return null;
        const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
        return (
            <div className="flex flex-wrap">
                {skillsArray.map((skill, idx) => (
                    <SkillTag key={idx} skill={skill} />
                ))}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 p-8">
            <div className="flex-1 flex flex-col md:flex-row rounded-2xl overflow-hidden mt-5 p-2">
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="flex items-center gap-4 mb-8 border-b-2 border-gray-300">
                        <Button
                            variant="primary"
                            className={`px-6 py-2 -mb-0.5 ${activeTab === 'Create' ? 'bg-orange-500' : 'bg-green-500'} text-white`}
                            onClick={() => handleTabClick('Create')}
                        >
                            Create
                        </Button>
                        <Button
                            variant="primary"
                            className={`px-6 py-2 -mb-0.5 ${activeTab === 'Upload' ? 'bg-orange-500' : 'bg-green-500'} text-white`}
                            onClick={() => handleTabClick('Upload')}
                        >
                            Upload
                        </Button>
                        <Button
                            variant="primary"
                            className={`px-6 py-2 -mb-0.5 ${activeTab === 'Generate' ? 'bg-orange-500' : 'bg-green-500'} text-white`}
                            onClick={() => handleTabClick('Generate')}
                        >
                            Generate
                        </Button>
                    </div>

                    {activeTab === 'Create' && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <Input name="jobTitle" placeholder="Job Title" value={formData.jobTitle} onChange={handleChange} />
                                <Input name="location" placeholder="Location" value={formData.location} onChange={handleChange} />
                                <Input name="department" placeholder="Department" value={formData.department} onChange={handleChange} />
                                <Input name="industry" placeholder="Industry" value={formData.industry} onChange={handleChange} />
                                <Input name="educationalQualification" placeholder="Educational Qualification" value={formData.educationalQualification} onChange={handleChange} />
                                <Input name="experience" placeholder="Exp in Years" value={formData.experience} onChange={handleChange} />
                                <Input name="ctc" placeholder="CTC in Lacs" value={formData.ctc} onChange={handleChange} />
                            </div>
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold mb-2">Key Roles & Responsibilities</h3>
                                <Textarea name="roles" placeholder="E.g. Type or copy paste ... Key Roles & Responsibilities." value={formData.roles} onChange={handleChange} />
                            </div>
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold mb-2">Required Specific Skills</h3>
                                <Textarea name="skills" placeholder="Leadership, Team building, HRMS, Interpersonal, Recruitment... etc" value={formData.skills} onChange={handleChange} />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold mb-2">Others</h3>
                                <Textarea name="others" placeholder="Certifications, Specific education etc" value={formData.others} onChange={handleChange} />
                            </div>
                            <div className="flex gap-4 mt-4">
                                <Button variant="primary" className="px-6 py-2" onClick={saveJd}>Create JD</Button>

                            </div>
                        </>
                    )}

                    {activeTab === 'Upload' && (
                        <>
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold mb-2">Upload Files (Doc, PDF only)</h3>
                                <div
                                    className={`border-2 border-dashed rounded-lg p-12 text-center text-gray-500 relative cursor-pointer transition-colors ${isDragOver ? 'border-orange-500 bg-orange-500/10' : 'border-gray-300'}`}
                                    onClick={handleClick}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    {isGenerating ? (
                                        <div className="flex flex-col items-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                                            <p className="text-xs">Processing file...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28m0 0l4 4m-4-4l-4 4m-4-4l-3.172-3.172a4 4 0 00-5.656 0L8 32m24-4a4 4 0 01-4-4V12m0 0a4 4 0 014-4h8a4 4 0 014 4v8m-4-8a4 4 0 00-4-4" />
                                            </svg>
                                            <p className="mt-2 text-xs">Drag and drop the file(s) to here or <span className="text-orange-500 font-semibold cursor-pointer">use the file browser</span></p>
                                        </>
                                    )}
                                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept=".doc,.docx,.pdf,.txt" />
                                </div>
                            </div>
                            {uploadedFiles.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-xs font-semibold mb-2">Uploaded Files:</h4>
                                    {uploadedFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-200 dark:bg-gray-800 rounded-lg p-2 mb-2 text-xs">
                                            <div className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2-2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A1 1 0 0014.586 7L12 4.414A1 1 0 0011.414 4H6z" clipRule="evenodd" />
                                                </svg>
                                                <span>{file.name}</span>
                                            </div>
                                            <button onClick={() => handleRemoveFile(file.name)} className="text-gray-500 hover:text-gray-700">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex justify-center gap-4 mt-6">
                                {showSaveButton && (
                                    <Button variant="primary" className="px-6 py-2" onClick={saveJd}>Save</Button>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'Generate' && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <Input name="jobTitle" placeholder="Job Title" value={formData.jobTitle} onChange={handleChange} />
                                <Input name="location" placeholder="Location" value={formData.location} onChange={handleChange} />
                                <Input name="department" placeholder="Department" value={formData.department} onChange={handleChange} />
                                <Input name="industry" placeholder="Industry" value={formData.industry} onChange={handleChange} />
                                <Input name="educationalQualification" placeholder="Educational Qualification" value={formData.educationalQualification} onChange={handleChange} />
                                <Input name="experience" placeholder="Exp in Years" value={formData.experience} onChange={handleChange} />
                                <Input name="ctc" placeholder="CTC in Lacs" value={formData.ctc} onChange={handleChange} />
                            </div>
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold mb-2">Key Skills to include</h3>
                                <Textarea name="skills" placeholder="Leadership, Team building, HRMS... etc" value={formData.skills} onChange={handleChange} />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold mb-2">Other keywords to include</h3>
                                <Textarea name="others" placeholder="Certifications, specific education etc" value={formData.others} onChange={handleChange} />
                            </div>
                            <div className="flex justify-center gap-4 mt-6">
                                <Button variant="primary" className="px-6 py-2" onClick={handleGenerate} disabled={isGenerating}>
                                    {isGenerating ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Generating...
                                        </div>
                                    ) : 'Generate'}
                                </Button>
                                {showSaveButton && !isGenerating && (
                                    <Button variant="secondary" className="px-6 py-2" onClick={saveJd}>Create JD</Button>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="flex-1 p-8 border-l border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-base font-bold">Job Description Details</h2>
                            <div className="flex gap-2">
                                {isEditing ? (
                                    <button onClick={handleSaveEdit} className="text-green-500 hover:text-green-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-7.534 6.758l2.828 2.828-5.32 5.32a1 1 0 01-.456.293L2 19.986l1.203-3.21a1 1 0 01.293-.456l5.32-5.32z" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Job Title: <span className="font-semibold text-green-600 dark:text-green-400">{formData.jobTitle || '...'}</span></p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">Location: <span className="font-semibold text-green-600 dark:text-green-400">{formData.location || '...'}</span></p>

                        <div className="flex-1 mt-4 overflow-y-auto bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
                            {isGenerating ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                                    <p className="text-center text-gray-500">Generating job description...</p>
                                </div>
                            ) : (formData.roles || formData.skills || formData.others ? (
                                <div className="w-full text-xs">
                                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Key Roles & Responsibilities</h3>
                                    <div ref={rolesRef} contentEditable={isEditing} className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap focus:outline-none p-2 -m-2 rounded focus:bg-white dark:focus:bg-gray-700">{formData.roles}</div>

                                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">Required Specific Skills</h3>
                                    {isEditing ? (
                                        <div ref={skillsRef} contentEditable={isEditing} className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap focus:outline-none p-2 -m-2 rounded focus:bg-white dark:focus:bg-gray-700">{formData.skills}</div>
                                    ) : (
                                        <div className="py-2">
                                            {renderSkills()}
                                        </div>
                                    )}

                                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">Others</h3>
                                    <div ref={othersRef} contentEditable={isEditing} className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap focus:outline-none p-2 -m-2 rounded focus:bg-white dark:focus:bg-gray-700">{formData.others}</div>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center italic">Based on the filling up of the job description, the data will be populated in here as a preview.</p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}