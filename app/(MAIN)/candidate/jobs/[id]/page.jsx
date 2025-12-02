"use client"

import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useParams } from "next/navigation";
import { X, Download, Mail, User, Phone, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';


const Page = () => {
    const { id } = useParams();
    const [resumefile, setresumefile] = useState(null);
    const [jobdescription, setjobdescription] = useState(null);
    const [currentpage, setcurrentpage] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [IsAnalyzed, setIsAnalyzed] = useState(false);
    const [formData, setFormData] = useState({
        applicant_name: '',
        applicant_email: "",
        applicant_phone: "",
        status: "applied",
        analyzed_paramters: [],
        match_percentage: "",
        resume_url: "",
        type: "manual-apply"
    });
    const inputRef = useRef(null);
    const router = useRouter();

    const analyzeResume = async () => {
        try {
            const FORM_DATA = new FormData();
            FORM_DATA.append('resume', resumefile);
            FORM_DATA.append('jobId', jobdescription?.id);
            const response = await axios.post('/api/Applications/Resume-analyze-ai', FORM_DATA);
            console.log(response.data.applicationData);
            if (response.data.success) {
                setFormData({
                    applicant_name: response.data.applicationData.applicant_name,
                    applicant_email: response.data.applicationData.applicant_email,
                    applicant_phone: response.data.applicationData.applicant_phone,
                    status: response.data.applicationData.status,
                    analyzed_paramters: response.data.applicationData.analyze_parameter,
                    match_percentage: response.data.applicationData.match_percentage,
                    resume_url: response.data.applicationData.resume_url,
                });
            }
            setIsAnalyzed(true);
        } catch (error) {
            console.error('Error analyzing resume:', error);
            toast.error(error.response.data.error || 'Failed to analyze resume.');
        }

    }

    const nextpage = () => {
        if (currentpage < pages.length - 1) {
            setcurrentpage(currentpage + 1);
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            setresumefile(files[0]);
        }
    };

    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setresumefile(files[0]);
        }
    };

    useEffect(() => {
        const fetchJobDescription = async () => {
            try {
                const response = await axios.get(`/api/job/${id}`);
                console.log(response.data);
                setjobdescription(response.data);
            } catch (error) {
                console.error('Error fetching job description:', error);
            }
        }
        fetchJobDescription();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post('/api/Applications/create', {
                job_id: jobdescription?.id,
                jobposition: jobdescription?.title,
                location: jobdescription?.location,
                resume_url: formData.resume_url,
                match_percentage: formData.match_percentage,
                applicant_phone: formData.applicant_phone,
                analyzed_paramters: formData.analyzed_paramters,
                applicant_email: formData.applicant_email,
                applicant_name: formData.applicant_name,
            });
            console.log('Application submitted successfully:', response.data);
            toast.success('Application submitted successfully!');
            router.replace(`/candidate/applications`);
        } catch (error) {
            console.error('Error submitting application:', error);
            toast.error(error.response.data.error || 'Failed to submit application.');
        }
    };



    useEffect(() => {
        if (resumefile?.name) {
            analyzeResume()
        }
    }, [resumefile]);

    const pages = [
        // Page 1: Job Description
        <div key="page1" className="flex flex-col h-full w-full">
            <div className="bg-[#FEE9E7] rounded-lg p-2 px-3 md:px-4 w-full md:w-fit flex items-center gap-2 md:gap-3 mb-4">
                <div className="bg-[#E9EEF5] p-2 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className='w-4 h-4 text-black' />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-gray-700 text-xs md:text-sm font-medium truncate">{jobdescription?.title}</span>
                    <span className="text-[#909399] text-[10px] md:text-xs truncate">{jobdescription?.location}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 lg:px-8 xl:px-16">
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <h3 className="font-semibold text-blue-600 text-sm md:text-base">Job Title:</h3>
                    <p className="text-gray-600 text-xs md:text-sm">{jobdescription?.title}</p>
                </div>

                <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <h4 className="font-semibold text-blue-600 text-sm md:text-base">Location:</h4>
                    <p className="text-gray-600 text-xs md:text-sm">{jobdescription?.location}</p>
                </div>

                <div className="mb-6">
                    <h4 className="font-semibold text-blue-600 mb-3 text-sm md:text-base">Job Description Details</h4>

                    <div className="space-y-4 md:space-y-6">
                        {jobdescription?.description?.about && (
                            <div>
                                <h5 className="font-medium text-gray-800 text-sm md:text-base mb-2">About the Role</h5>
                                <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{jobdescription?.description.about}</p>
                            </div>
                        )}

                        {jobdescription?.description?.key_responsibilities && (
                            <div>
                                <h5 className="font-medium text-gray-800 text-sm md:text-base mb-2">Key Responsibilities</h5>
                                <ul className="text-xs md:text-sm text-gray-600 space-y-1.5">
                                    {jobdescription?.description.key_responsibilities.map((resp, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                            <span className="flex-1">{resp}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {jobdescription?.key_skills && (
                            <div>
                                <h5 className="font-medium text-gray-800 text-sm md:text-base mb-2">Key Skills</h5>
                                <div className="flex flex-wrap gap-2">
                                    {jobdescription?.key_skills.map((skill, index) => (
                                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {jobdescription?.good_to_have_skills && jobdescription?.good_to_have_skills.length > 0 && (
                            <div>
                                <h5 className="font-medium text-gray-800 text-sm md:text-base mb-2">Good to Have</h5>
                                <div className="flex flex-wrap gap-2">
                                    {jobdescription?.good_to_have_skills.map((skill, index) => (
                                        <span key={index} className="px-2 py-1 bg-gray-100 text-blue-900 rounded-md text-xs font-medium">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {jobdescription?.description?.qualifications && (
                            <div>
                                <h5 className="font-medium text-gray-800 text-sm md:text-base mb-2">Qualifications</h5>
                                <ul className="text-xs md:text-sm text-gray-600 space-y-1.5">
                                    {jobdescription?.description.qualifications.map((qual, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                            <span className="flex-1">{qual}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {jobdescription?.description?.what_we_offer && (
                            <div>
                                <h5 className="font-medium text-gray-800 text-sm md:text-base mb-2">What We Offer</h5>
                                <ul className="text-xs md:text-sm text-gray-600 space-y-1.5">
                                    {jobdescription?.description.what_we_offer.map((offer, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                            <span className="flex-1">{offer}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                            <div>
                                <h5 className="font-medium text-gray-800 mb-1 text-sm md:text-base">Experience</h5>
                                <p className="text-xs md:text-sm text-gray-600">{jobdescription?.experience_required || jobdescription?.experience || 'Not specified'}</p>
                            </div>
                            <div>
                                <h5 className="font-medium text-gray-800 mb-1 text-sm md:text-base">CTC Range</h5>
                                <p className="text-xs md:text-sm text-gray-600">{jobdescription?.ctc_range || jobdescription?.ctcRange || 'Not specified'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end mt-4">
                <button
                    onClick={nextpage}
                    className='bg-orange-400 hover:bg-orange-500 text-black px-4 md:px-6 py-1.5 md:py-2 rounded-lg cursor-pointer text-xs md:text-sm font-medium transition-colors'
                >
                    Apply Now
                </button>
            </div>
        </div>,

        // Page 2: Application Form
        <div key="page2" className="flex flex-col h-full w-full">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-center gap-3 md:gap-4 mb-4">
                <span className="text-orange-500 text-xs md:text-sm text-center lg:text-left">
                    Upload Resumes <br className="hidden lg:block" />(Doc, PDF only)
                </span>

                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex items-center justify-center gap-3 md:gap-4 text-orange-500 border-2 rounded-xl py-3 md:py-4 px-4 md:px-6 transition-colors duration-200 ${isDragging ? "border-dotted bg-orange-50 border-orange-400" : "border-gray-400"
                        }`}
                >
                    <Download className='text-gray-600 w-5 h-5 md:w-6 md:h-6 flex-shrink-0' />
                    <input onChange={handleFileSelect} type="file" accept=".pdf,.doc,.docx" className='hidden' ref={inputRef} />
                    <span className="text-xs md:text-sm text-center">
                        Drag and drop the file(s) here or <br />
                        <span onClick={() => inputRef.current.click()} className="cursor-pointer font-semibold hover:text-orange-600">
                            use the file browser
                        </span>
                    </span>
                </div>

                <button
                    onClick={() => inputRef.current.click()}
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-md text-xs md:text-sm px-4 md:px-6 py-2 transition-colors"
                >
                    Upload
                </button>
            </div>

            {resumefile && (
                <div className="bg-gray-100 rounded-lg px-3 md:px-4 py-2 w-full md:w-fit mx-auto flex items-center justify-between md:justify-center gap-3 md:gap-4 mb-4">
                    <span className="text-xs text-blue-500 truncate flex-1 md:flex-none">{resumefile.name}</span>
                    <button
                        className="text-black cursor-pointer hover:bg-gray-400 rounded-full p-1 transition-colors flex-shrink-0"
                        onClick={() => {
                            setresumefile(null);
                            setIsAnalyzed(false);
                            setFormData({
                                applicant_name: '',
                                applicant_email: "",
                                applicant_phone: "",
                                status: "applied",
                                analyzed_paramters: [],
                                match_percentage: "",
                                resume_url: "",
                                type: "manual-apply"
                            })
                        }}
                    >
                        <X className='w-3 h-3 md:w-4 md:h-4' />
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto">
                {IsAnalyzed ? (
                    <form className='space-y-3 md:space-y-4 px-2'>
                        <div>
                            <label htmlFor="applicant_name" className="text-gray-700 font-medium flex items-center gap-2 mb-2 text-xs md:text-sm">
                                <User className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="applicant_name"
                                name="applicant_name"
                                value={formData.applicant_name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                                className="w-full px-3 md:px-4 text-xs md:text-sm py-2 border text-black border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="applicant_email" className="text-gray-700 font-medium flex items-center gap-2 mb-2 text-xs md:text-sm">
                                <Mail className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="applicant_email"
                                name="applicant_email"
                                value={formData.applicant_email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                                required
                                className="w-full text-black px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors text-xs md:text-sm"
                            />
                        </div>

                        <div>
                            <label htmlFor="applicant_phone" className="text-gray-700 font-medium flex items-center gap-2 mb-2 text-xs md:text-sm">
                                <Phone className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                id="applicant_phone"
                                name="applicant_phone"
                                value={formData.applicant_phone}
                                onChange={handleChange}
                                placeholder="e.g., +1234567890"
                                required
                                className="w-full text-black px-3 md:px-4 py-2 border border-gray-300 outline-0 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors text-xs md:text-sm"
                            />
                        </div>
                    </form>
                ) : (
                    <div className="flex items-center justify-center text-gray-600 text-xs md:text-sm text-center px-4 py-8">
                        <span>
                            Fields will appear once you click Apply and <br className="hidden sm:block" />
                            upload your resume. The fields will be auto-filled from your Resume.
                        </span>
                    </div>
                )}
            </div>

            <div className="w-full flex items-center justify-end mt-4">
                <button
                    disabled={!IsAnalyzed}
                    onClick={handleSubmit}
                    className={`bg-orange-500 text-white rounded-full shadow-md text-xs md:text-sm px-4 md:px-6 py-2 transition-all ${IsAnalyzed === false ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-orange-600"
                        }`}
                >
                    Submit Application
                </button>
            </div>
        </div>,
        <div key="page3" className="flex flex-col h-full w-full">
            <div className="flex flex-col h-full w-full  p-8">
                {/* Main Container */}
                <div className="flex flex-col items-center justify-center flex-1 max-w-2xl mx-auto w-full">

                    {/* Success Icon */}
                    <div className="mb-8 animate-bounce">
                        <CheckCircle className="w-20 h-20 text-green-500" strokeWidth={1.5} />
                    </div>

                    {/* Heading */}
                    <h1 className="text-4xl font-bold text-gray-800 mb-3 text-center">
                        Application Submitted!
                    </h1>

                    <p className="text-lg text-gray-600 text-center mb-8">
                        Thank you for applying. We've received your resume and it's under review.
                    </p>

                    {/* Main Message Card */}
                    <div className="bg-white rounded-lg shadow-lg p-8 w-full mb-8 border-l-4 border-blue-500">
                        <div className="flex items-start gap-4">
                            <Clock className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                    What Happens Next?
                                </h2>
                                <p className="text-gray-700 leading-relaxed">
                                    Please wait <span className="font-semibold text-blue-600">1-2 days</span> for our HR team to review your application.
                                    During this time, your AI interview will be scheduled or your application status will be updated.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Info Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-8">

                        {/* Email Notification Card */}
                        <div className="bg-white rounded-lg shadow p-6 border-t-2 border-indigo-500">
                            <div className="flex items-center gap-3 mb-3">
                                <Mail className="w-5 h-5 text-indigo-600" />
                                <h3 className="font-semibold text-gray-800">Email Notification</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                                You'll receive an email with your interview schedule or next steps.
                            </p>
                        </div>

                        {/* Timeline Card */}
                        <div className="bg-white rounded-lg shadow p-6 border-t-2 border-green-500">
                            <div className="flex items-center gap-3 mb-3">
                                <Clock className="w-5 h-5 text-green-600" />
                                <h3 className="font-semibold text-gray-800">Timeline</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                                1-2 days for review, then interview scheduling or status update.
                            </p>
                        </div>
                    </div>

                    {/* Tips Section */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 w-full mb-8">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-amber-900 mb-2">While You Wait</h3>
                                <ul className="text-sm text-amber-800 space-y-1">
                                    <li>• Check your email (including spam folder) for updates</li>
                                    <li>• Make sure your contact information is accurate</li>
                                    <li>• Prepare for a potential AI interview on the scheduled date</li>
                                </ul>
                            </div>
                        </div>
                    </div>


                    {/* Footer Message */}
                    <p className="text-center text-gray-500 text-sm mt-8">
                        Have questions? Contact our support team at <span className="text-blue-600 font-medium">support@company.com</span>
                    </p>
                </div>
            </div>
        </div>

    ];

    if (!jobdescription) {
        return (
            <div className="flex flex-col items-center justify-center h-screen w-full">
                <div className="flex flex-col gap-4 items-center justify-center text-orange-500">
                    <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-4 md:border-6 border-gray-200 border-t-orange-500"></div>
                    <span className="animate-pulse text-base md:text-xl font-semibold">
                        Loading...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className='flex flex-col w-full h-full min-h-0 mt-3 px-2 md:px-4'>
            <div className="mb-3 md:mb-4">
                {currentpage === 0 && <span className="text-orange-500 font-bold text-sm md:text-base">
                    Available Job Descriptions
                </span>}
            </div>
            <div className='flex-1 min-h-0 flex flex-col'>
                {pages[currentpage]}
            </div>
        </div>
    )
}

export default Page