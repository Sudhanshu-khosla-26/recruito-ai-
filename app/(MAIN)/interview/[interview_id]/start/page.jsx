"use client";


import { useEffect, useRef, useState, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import { Loader2, Mic, MicOff, Video, VideoOff, Phone, Timer } from "lucide-react";
import axios from "axios";
import { useUser } from "@/provider";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Webcam from "react-webcam";
import Image from "next/image";

// 3D Avatar Component


// Timer Component
function TimerComponent({ start }) {
    const [time, setTime] = useState(0);

    useEffect(() => {
        let interval;
        if (start) {
            interval = setInterval(() => {
                setTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [start]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return <span className="font-mono">{formatTime(time)}</span>;
}

// Main Component
export default function ModernInterviewUI() {
    const { interview_id } = useParams();
    const router = useRouter();
    const { user } = useUser();

    // State Management
    const [vapiStatus, setVapiStatus] = useState("idle");

    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [conversationLog, setConversationLog] = useState([]);
    const [interviewDetails, setInterviewDetails] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [fetchingData, setFetchingData] = useState(true);
    const [activeUser, setActiveUser] = useState(false);
    const [conversation, setConversation] = useState('');

    console.log("Conversation Log:", conversationLog);
    console.log("questions", questions);

    // Refs
    const vapiRef = useRef(null);
    const muteTimeoutRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);



    const questionsRef = useRef([]);

    // Fetch Interview Data
    useEffect(() => {
        const getInterviewData = async () => {
            try {
                setFetchingData(true);
                const [interviewResponse, questionsResponse] = await Promise.all([
                    axios.get(`/api/Interviews/${interview_id}`),
                    axios.get(`/api/Interviews/questions/get-questions/${interview_id}`)
                ]);

                setInterviewDetails(interviewResponse.data.interview);
                setQuestions(questionsResponse.data.questions || []);
                console.log('✅ Interview data fetched successfully', interviewResponse.data.interview, questionsResponse.data.questions);

                setFetchingData(false);
            } catch (error) {
                console.error('❌ Error fetching interview data:', error);
                toast.error('Failed to load interview data');
                setFetchingData(false);
            }
        }

        getInterviewData();
    }, [interview_id]);

    // Initialize Vapi
    useEffect(() => {
        const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

        if (!VAPI_PUBLIC_KEY) {
            console.error("Missing VAPI key");
            toast.error("VAPI key is missing");
            return;
        }

        try {
            const vapi = new Vapi(VAPI_PUBLIC_KEY);
            vapiRef.current = vapi;

            // Event listeners
            vapi.on("call-start", (call) => {
                setVapiStatus("connected");

                toast.success("Interview started!");
            });

            vapi.on("call-end", () => {
                setVapiStatus("ended");
                console.log("Call ended, processing answers...");
                processAndSaveFeedback(questionsRef.current);
            });

            vapi.on("speech-start", () => setActiveUser(false));
            vapi.on("speech-end", () => setActiveUser(true));

            vapi.on("message", (message) => {
                if (message?.conversation) {
                    setConversation(JSON.stringify(message.conversation));
                }

                if (message.type === "transcript") {
                    const transcript = {
                        role: message.role,
                        text: message.transcript,
                        timestamp: new Date().toISOString()
                    };

                    setConversationLog(prev => [...prev, transcript]);
                }
            });

            vapi.on("error", (error) => {
                console.error("Vapi error:", error);
                setVapiStatus("idle");
                toast.error("Interview error occurred");
            });

            console.log("✅ VAPI Initialized");
        } catch (err) {
            console.error("❌ VAPI Init Error:", err);
            toast.error("Failed to initialize VAPI");
        }

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (vapiRef.current) {
                vapiRef.current.stop();
            }
        };
    }, []);


    useEffect(() => {
        questionsRef.current = questions;
    }, [questions]);



    // Auto-start interview when data ready
    useEffect(() => {
        if (!fetchingData && questions.length > 0 && vapiRef.current && vapiStatus === "idle") {
            const timer = setTimeout(() => {
                if (interviewDetails?.status === "completed") {
                    console.log("⛔ Interview already completed. Skipping Vapi start.");
                    toast.info("This interview has already been completed.");
                    // Ensure Vapi never starts and stays ended
                    if (vapiRef.current) vapiRef.current.stop();
                    setVapiStatus("ended");

                } else {
                    handleStartInterview();
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [fetchingData, questions, vapiStatus, interviewDetails]);

    // Start Interview
    const handleStartInterview = useCallback(async () => {
        if (vapiStatus !== "idle") return;

        setVapiStatus("connecting");

        try {
            const formattedQuestions = questions.map((q, idx) =>
                `${idx + 1}. ${q?.question_type}: ${q?.question_text?.question || q?.question}`
            ).join('\n');

            const candidateName = user?.name || "Candidate";
            const jobPosition = interviewDetails?.job?.title || "this position";
            const duration = interviewDetails?.duration_minutes || 30;

            await vapiRef.current.start({
                name: "AI Recruiter",
                firstMessage: `Hello ${candidateName}! Welcome to your ${jobPosition} interview. The duration is ${duration} minutes. I'm excited to learn more about you. Let's begin with the first question!`,
                transcriber: {
                    provider: "deepgram",
                    model: "nova-2",
                    numerals: true,
                    language: "en-US",
                    endpointing: 100,
                },
                voice: {
                    voiceId: "Neha",
                    provider: "vapi",
                },
                model: {
                    provider: "openai",
                    model: "gpt-4o",
                    temperature: 0.7,
                    messages: [
                        {
                            role: "system",
                            content: `You are a professional and friendly AI interviewer conducting a ${jobPosition} interview.

**QUESTIONS TO ASK (IN ORDER):**
${formattedQuestions}

**GUIDELINES:**
- Ask questions ONE BY ONE in the exact order listed above
- After each answer, acknowledge briefly and move to the next question
- Use quick affirmations like "I see," "Got it," "Thank you for sharing"
- If candidate says "I don't know", offer encouragement and move to next question
- Be warm, encouraging, and professional
- Track which question you're on
- After the last question, thank the candidate warmly and end the interview

**IMPORTANT:** Ask questions sequentially and wait for answers before moving to the next one.`
                        }
                    ],
                },
                silenceTimeoutSeconds: 60,
                maxDurationSeconds: duration * 60,
                backgroundDenoisingEnabled: true,
            });

            console.log("✅ Interview Started");
        } catch (err) {
            console.error("Failed to start interview:", err);
            toast.error("Failed to start interview");
            setVapiStatus("idle");
        }
    }, [vapiStatus, interviewDetails, questions, user]);

    // Process and save feedback for each question
    const processAndSaveFeedback = async (AllQuestions) => {
        try {
            console.log("🔄 Processing answers and generating feedback...");
            console.log(AllQuestions, "feedback")



            const feedback = await axios.post('/api/Interviews/submit', {
                interview_id: interview_id,
                conversation: conversationLog,
                questions: AllQuestions
            });

            console.log("✅ Feedback generated:", feedback.data.stats.average_score);

            await axios.patch('/api/Interviews/end-interview', {
                interviewId: interview_id,
                score: feedback.data.stats.average_score
            });

            toast.success("Interview completed! Feedback saved.");

            // Redirect to completion page
            router.push(`/interview/${interview_id}/completed`);

        } catch (error) {
            console.error("❌ Error processing feedback:", error);
            toast.error("Error saving feedback");
        }
    };

    // Toggle Mute
    const toggleMute = () => {
        if (!vapiRef.current || vapiStatus !== "connected") return;
        const newMuteState = !isMuted;
        setIsMuted(newMuteState);

        if (newMuteState) {
            vapiRef.current.setMuted(true);
            toast.info("Microphone muted");
        } else {
            vapiRef.current.setMuted(false);
            toast.info("Microphone unmuted");
        }
    };

    const endInterview = async () => {
        if (vapiStatus !== "connected") {
            toast.warning("No active interview to end");
            return;
        }

        try {
            setVapiStatus("ending");

            // Stop the Vapi call
            if (vapiRef.current) {
                await vapiRef.current.stop();
            }

            // Stop camera stream if active
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }

            console.log("✅ Interview ended by user");


        } catch (error) {
            console.error("❌ Error ending interview:", error);
            toast.error("Error ending interview. Please try again.");
            setVapiStatus("connected");
        }
    }




    if (fetchingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Interview</h2>
                    <p className="text-gray-600">Preparing your interview session...</p>
                </div>
            </div>
        );
    }

    const statusInfo = {
        connected: { text: "Interview in progress", className: "bg-green-50 text-green-700" },
        connecting: { text: "Connecting...", className: "bg-yellow-50 text-yellow-700" },
        ended: { text: "Interview ended", className: "bg-gray-100 text-gray-700" },
        idle: { text: "Ready to start", className: "bg-blue-50 text-blue-700" }
    }[vapiStatus];



    const toggleCamera = () => setIsCameraOn((prev) => !prev);




    if (interviewDetails?.status === "completed") {

        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <Image src="/done.svg" alt="Interview Done" width={120} height={120} className="mb-4" />
                <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                    Interview Already Completed
                </h1>
                <p className="text-gray-600 text-center max-w-sm">
                    You’ve already completed this interview. You can review your feedback in your dashboard.
                </p>
            </div>
        );
    }




    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm px-6 py-4 mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-800">{interviewDetails?.title}</h1>
                        <p className="text-sm text-gray-500 mt-1">Welcome, <span className="text-blue-600 font-medium">{user?.name}</span></p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Timer size={18} />
                            <TimerComponent start={vapiStatus === "connected"} />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo?.className}`}>
                            {statusInfo?.text}
                        </span>
                    </div>
                </div>

                {/* Video Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                    {/* AI Interviewer */}
                    <div className="relative overflow-hidden rounded-lg shadow-md h-72 bg-gradient-to-br from-black via-orange-500 to-orange-600">
                        <div className="absolute top-4 left-4 z-10">
                            <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-sm font-medium">
                                AI Recruiter
                            </span>
                        </div>
                        <div className="absolute top-4 right-4 z-10">
                            <div className="relative">
                                {!activeUser && vapiStatus === "connected" && (
                                    <span className="absolute -inset-2 rounded-full bg-blue-400 opacity-60 animate-ping" />
                                )}
                                <span className={`relative px-3 py-1 rounded-full text-xs font-medium ${!activeUser && vapiStatus == "connected" ? 'bg-green-100 text-green-700' : 'bg-white/80 text-gray-600'}`}>
                                    {vapiStatus === "connected" ? (!activeUser ? 'Speaking' : 'Listening') : 'Ready'}
                                </span>
                            </div>
                        </div>

                        <div className="absolute inset-0 max-w-20 max-h-20 m-auto">
                            <Image src="/ai.png" alt="AI Recruiter" layout="fill" objectFit="cover" className="h-20 w-20 rounded-full" />
                        </div>


                    </div>

                    {/* Candidate Video */}
                    <div className="relative h-72 rounded-lg bg-black shadow-md overflow-hidden">
                        <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-sm">You</div>
                        {isCameraOn ? (
                            <Webcam className="w-full h-full object-cover" mirrored />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-white/60">
                                <VideoOff className="w-10 h-10 mb-2" />
                                <p>Camera Off</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress Indicator */}
                {/* {vapiStatus === "connected" && (
                    <div className="bg-white rounded-lg shadow-sm px-6 py-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Question Progress</span>
                            <span className="font-medium text-blue-600">
                                {Math.min(currentQuestionIndex.current + 1, questions.length)} / {questions.length}
                            </span>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(Math.min(currentQuestionIndex.current + 1, questions.length) / questions.length) * 100}%` }}
                            />
                        </div>
                    </div>
                )} */}

                {/* Controls */}
                <div className="flex justify-center items-center gap-4">
                    <button
                        onClick={toggleMute}
                        disabled={vapiStatus !== "connected"}
                        className={`p-4 rounded-full shadow-lg transition-all ${isMuted ? 'bg-gray-400 hover:bg-gray-500' : 'bg-gray-800 hover:bg-gray-900'} ${vapiStatus !== "connected" ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
                    </button>

                    <button
                        onClick={toggleCamera}
                        className={`p-4 rounded-full shadow-lg transition-all ${isCameraOn ? 'bg-gray-800 hover:bg-gray-900' : 'bg-gray-400 hover:bg-gray-500'}`}
                    >
                        {isCameraOn ? <Video className="w-5 h-5 text-white" /> : <VideoOff className="w-5 h-5 text-white" />}
                    </button>

                    <button
                        onClick={endInterview}
                        disabled={vapiStatus !== "connected"}
                        className={`p-4 rounded-full shadow-lg bg-red-500 hover:bg-red-600 transition-all ${vapiStatus !== "connected" ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Phone className="w-5 h-5 text-white" />
                    </button>
                </div>

            </div>
        </div>
    );
}