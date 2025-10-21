"use client";
import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

const UnauthorizedPage = ({ role, show }) => {
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (!show || !role) return;

        if (countdown <= 0) {
            router.push(`/${role}/dashboard`);
            return;
        }

        const timer = setTimeout(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, show, role, router]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border-l-4 border-red-600 animate-fade-in">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="bg-red-100 p-4 rounded-full">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                    Unauthorized Access
                </h2>

                {/* Message */}
                <p className="text-center text-gray-600 mb-4">
                    You do not have permission to access this page.
                </p>

                {/* Countdown */}
                <p className="text-center text-sm text-gray-500 mb-6">
                    Redirecting to your dashboard in{" "}
                    <span className="text-red-600 font-semibold">{countdown}</span>{" "}
                    seconds...
                </p>

                {/* Button */}
                <button
                    onClick={() => router.push(`/${role}/dashboard`)}
                    className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200"
                >
                    Go Back Now
                </button>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
