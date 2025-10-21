"use client"
import { Progress } from '@/app/components/ui/progress';
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import FormContainer from './_components/FormContainer';
import QuestionList from './_components/QuestionList';
import { toast } from 'sonner';
import InterviewLink from './_components/InterviewLink';
import { useUser } from '@/provider';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';


function CreateInterview() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState();
    const [interviewId, setInterviewId] = useState();
    const { user } = useUser();
    const searchparams = useSearchParams();
    const [questions, setQuestions] = useState([]);
    const applicantID = searchparams.get("id")
    const JobID = searchparams.get("jobid");
    console.log(applicantID, "jobid", JobID)

    const onHandleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
        console.log("FormData", formData)
    }

    const generateQuestions = async () => {
        try {
            const response = await axios.post("/api/Interviews/questions/generate-questions-ai", {
                interview_type: formData.type,
                duration_minutes: formData.duration,
                job_id: JobID,
            });
            console.log("Generated Questions:", response.data.data.questions);
            setQuestions(response.data.data.questions)

        } catch (error) {
            console.log(error);
        }
    }

    const saveQuestions = async (questionsToSave) => {
        try {
            for (const [categoryKey, categoryQuestions] of Object.entries(questionsToSave)) {
                for (const questionData of categoryQuestions) {
                    await axios.post("/api/Interviews/questions/save-questions", {
                        interviewId: interviewId,
                        question: questionData,
                        question_type: categoryKey
                    });
                }
            }
            console.log("All questions saved successfully");
        } catch (error) {
            console.error("Error saving questions:", error);
            throw error;
        }
    }

    const createInterview = async () => {
        try {
            const response = await axios.post("/api/Interviews/Create", {
                job_id: JobID,
                application_id: applicantID,
                mode: "Wai",
                interview_type: formData.type,
                duration_minutes: formData.duration
            })

            console.log("Interview Created:", response.data);
            setInterviewId(response.data.id)

            generateQuestions();

        } catch (error) {
            console.log("Error creating interview:", error);
        }
    }



    const onGoToNext = async () => {
        // if (user?.credits <= 0) {
        //     toast('Please add credits')
        //     return;
        // }
        if (!formData?.jobPosition || !formData?.jobDescription || !formData?.duration || !formData.type || formData.type.length === 0) {
            toast('Please enter all details!')
            return;
        }
        await createInterview();
        setStep(step + 1);
    }

    const onCreateLink = async (modifiedQuestions) => {
        // Use the questions passed from child component
        await saveQuestions(modifiedQuestions);
        // Update parent state after saving
        setQuestions(modifiedQuestions);
        setStep(step + 1);
    }

    console.log(questions)

    return (
        <div className='mt-5 px-4 md:px-6 lg:px-10 w-full max-w-[100%]'>
            <div className='flex gap-5 items-center mb-5'>
                <ArrowLeft onClick={() => router.back()} className='cursor-pointer' />
                <h2 className='font-bold text-2xl'>Create New Interview</h2>
            </div>

            <Progress value={step * 33.33} className='my-5' />

            {step == 1 ? (
                <FormContainer
                    applicantID={applicantID}
                    JobID={JobID}
                    onHandleInputChange={onHandleInputChange}
                    GoToNext={() => onGoToNext()}
                />
            ) : step == 2 ? (
                <QuestionList
                    formData={formData}
                    setQuestions={setQuestions}
                    questions={questions}
                    onCreateLink={(questionList) => onCreateLink(questionList)}
                />
            ) : step == 3 ? (
                <InterviewLink
                    interview_id={interviewId}
                    formData={formData}
                    questions={questions}
                />
            ) : null}
        </div>
    )
}

export default CreateInterview
