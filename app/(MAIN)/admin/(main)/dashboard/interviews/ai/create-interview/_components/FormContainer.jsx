'use client';

import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import React, { useEffect, useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/components/ui/select";
import { InterviewType } from '@/services/Constants';
import { Button } from '@/app/components/ui/button';
import { ArrowRight } from 'lucide-react';
import axios from 'axios';

function FormContainer({ onHandleInputChange, GoToNext, applicantID, JobID }) {
    const [interviewType, setInterviewType] = useState([]);
    // const [duration, setDuration] = useState('');
    const [selectedJD, setSelectedJD] = useState(null);
    // const [jdOptions, setJdOptions] = useState([]);
    // console.log("Selected JD:", jdOptions, selectedJD);

    // Fetch all JD from API
    useEffect(() => {
        const fetchJD = async () => {
            try {
                const res = await axios.get(`/api/job/${JobID}`);
                setSelectedJD(res.data || null);
                // console.log("res", res)
                console.log("Fetched JDs:", res.data);
            } catch (err) {
                console.error("Failed to fetch JDs:", err);
            }
        };
        fetchJD();
    }, []);

    // Fill Job Position and Description when JD is selected
    useEffect(() => {
        if (selectedJD) {
            onHandleInputChange('jobPosition', selectedJD.title);
            onHandleInputChange('jobDescription', selectedJD.description);
        }
    }, [selectedJD]);

    useEffect(() => {
        if (interviewType) {
            onHandleInputChange('type', interviewType);
        }
    }, [interviewType]);

    const AddInterviewType = (type) => {
        const exists = interviewType.includes(type);
        if (!exists) {
            setInterviewType(prev => [...prev, type]);
        } else {
            setInterviewType(prev => prev.filter(item => item !== type));
        }
    };

    // Helper to display nested job description nicely
    const renderJobDescription = (desc) => {
        if (!desc) return '';
        return (
            <div className="space-y-3 text-sm text-gray-700">
                {desc.about && (
                    <div>
                        <strong>About:</strong>
                        <p>{desc.about}</p>
                    </div>
                )}
                {desc.key_responsibilities && (
                    <div>
                        <strong>Key Responsibilities:</strong>
                        <ul className="list-disc ml-5">
                            {desc.key_responsibilities.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {desc.qualifications && (
                    <div>
                        <strong>Qualifications:</strong>
                        <ul className="list-disc ml-5">
                            {desc.qualifications.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {desc.what_we_offer && (
                    <div>
                        <strong>What We Offer:</strong>
                        <ul className="list-disc ml-5">
                            {desc.what_we_offer.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className='p-5 bg-white rounded-xl w-full'>
            {/* JD Selection */}
            {/* <div className='mb-5'>
                <h2 className='text-sm font-medium'>Select Job Description</h2>
                <Select onValueChange={(value) => {
                    const jd = jdOptions?.find(j => j.id.toString() === value);
                    setSelectedJD(jd);
                }}>
                    <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Select JD" />
                    </SelectTrigger>
                    <SelectContent>
                        {jdOptions?.map(jd => (
                            <SelectItem key={jd.id} value={jd.id.toString()}>
                                {jd.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div> */}

            {/* Job Position */}
            <div>
                <h2 className='text-sm font-medium'>Job Position</h2>
                <Input
                    placeholder="e.g. Full Stack Developer"
                    className='mt-2'
                    value={selectedJD?.title || ''}
                    onChange={(event) => onHandleInputChange('jobPosition', event.target.value)}
                />
            </div>

            {/* Job Description */}
            <div className='mt-5'>
                <h2 className='text-sm font-medium'>Job Description</h2>
                <div className='mt-2 border p-3 rounded-md bg-gray-50 max-h-72 overflow-y-auto'>
                    {selectedJD ? renderJobDescription(selectedJD.description) : (
                        <p className='text-gray-400'>Select a JD to see details</p>
                    )}
                </div>
            </div>

            {/* Interview Duration */}
            <div className='mt-5'>
                <h2 className='text-sm font-medium'>Interview Duration</h2>
                <Select onValueChange={(value) => onHandleInputChange('duration', value)}>
                    <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Select Duration" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5 Min">5 Min</SelectItem>
                        <SelectItem value="15 Min">15 Min</SelectItem>
                        <SelectItem value="30 Min">30 Min</SelectItem>
                        <SelectItem value="45 Min">45 Min</SelectItem>
                        <SelectItem value="60 Min">60 Min</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Interview Type */}
            <div className='mt-5'>
                <h2 className='text-sm font-medium'>Interview Type</h2>
                <div className='flex gap-3 flex-wrap mt-2'>
                    {InterviewType.map((type, index) => (
                        <div
                            key={index}
                            className={`flex items-center cursor-pointer gap-2 p-1 px-4 bg-white border border-gray-300 rounded-2xl hover:bg-secondary ${interviewType.includes(type.title) && 'bg-blue-100 text-primary'}`}
                            onClick={() => AddInterviewType(type.title)}
                        >
                            <type.icon className='h-4 w-4' />
                            <span>{type.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Generate Button */}
            <div className='mt-7 flex justify-end' onClick={() => GoToNext()}>
                <Button>Generate Question <ArrowRight /></Button>
            </div>
        </div>
    );
}

export default FormContainer;
