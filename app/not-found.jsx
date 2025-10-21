"use client";

import { useRouter } from "next/navigation";
import { Home, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

export default function NotFound() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        if (countdown === 0) {
            router.push("/");
        }

        return () => clearInterval(timer);
    }, [countdown]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 text-gray-800 px-6">
            {/* Animated Alert Icon */}
            <div className="bg-red-100 p-6 rounded-full mb-6 animate-bounce">
                <AlertTriangle className="w-14 h-14 text-red-600" />
            </div>

            {/* 404 Text */}
            <h1 className="text-6xl font-extrabold text-red-600 mb-2 tracking-tight">
                404
            </h1>
            <h2 className="text-2xl font-semibold mb-3">Page Not Found</h2>

            {/* Message */}
            <p className="text-gray-600 max-w-md text-center mb-6">
                Oops! The page you’re looking for doesn’t exist or may have been moved.
            </p>

            {/* Countdown */}
            <p className="text-sm text-gray-500 mb-6">
                Redirecting to home in{" "}
                <span className="text-red-600 font-semibold">{countdown}</span> seconds...
            </p>

            {/* Button */}
            <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md"
            >
                <Home className="w-5 h-5" />
                Go Home
            </button>
        </div>
    );
}
