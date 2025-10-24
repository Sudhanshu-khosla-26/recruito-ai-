"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send } from "lucide-react";

export default function InterviewComplete() {
    const router = useRouter();

    // useEffect(() => {
    //     toast.success("Interview completed! Redirecting to homepage...", {
    //         duration: 2500,
    //     });

    //     const timer = setTimeout(() => router.replace("/"), 3000);
    //     return () => clearTimeout(timer);
    // }, [router]);

    return (
        <div className="bg-white text-black font-sans flex flex-col min-h-screen">
            <main className="flex-grow flex flex-col items-center justify-center space-y-6 py-8 px-4 text-center">
                <div className="rounded-full bg-green-500 p-4 animate-bounce">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold">Interview Complete!</h1>

                <p className="text-gray-600 max-w-md">
                    Thank you for participating in the AI-driven interview with{" "}
                    <span className="font-semibold text-blue-600">Recruito AI</span>.
                </p>

                <div className="rounded-xl overflow-hidden shadow-lg">
                    <img
                        src="https://static.vecteezy.com/system/resources/previews/003/032/078/non_2x/job-interview-conversation-hr-manager-and-job-candidate-vector.jpg"
                        alt="Interview Illustration"
                        className="w-full h-auto object-cover max-w-xl rounded-lg"
                    />
                </div>

                <div className="bg-gray-100 rounded-xl p-8 shadow-md w-full max-w-xl space-y-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 mx-auto">
                        <Send className="text-white" />
                    </div>

                    <h2 className="text-2xl font-semibold">What’s Next?</h2>
                    <p className="text-gray-700">
                        The recruiter will review your interview responses and contact you soon regarding the next steps.
                    </p>

                    <p className="text-gray-500 text-sm">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 inline-block mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Response within 2–3 business days
                    </p>
                </div>
            </main>

            <footer className="bg-gray-50 text-gray-500 text-center py-4 border-t border-gray-200">
                <p>&copy; {new Date().getFullYear()} Alcruiter. All rights reserved.</p>
            </footer>
        </div>
    );
}
