"use client";

import { Button } from "@/app/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Mail, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import axios from "axios";

const ROLE_DASHBOARD_MAP = {
  admin: "/admin/dashboard",
  hadmin: "/hadmin/dashboard",
  candidate: "/candidate/dashboard",
  hr: "/hr/dashboard",
};

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const router = useRouter();

  // Check auth state and redirect based on role
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
  //     if (firebaseUser) {
  //       try {
  //         const res = await axios.post("/api/auth/getuser", {
  //           uid: firebaseUser.uid,
  //         });

  //         const userData = res.data;
  //         console.log(userData);
  //         const userRole = userData?.user?.role?.toLowerCase();
  //         const correctDashboard = ROLE_DASHBOARD_MAP[userRole];

  //         window.location.href = correctDashboard;
  //       } catch (err) {
  //         console.error("Error fetching user data:", err);
  //         setAuthChecking(false);
  //       }
  //     } else {
  //       setAuthChecking(false);
  //     }
  //   });

  //   return () => unsubscribe();
  // }, []);

  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCred.user.getIdToken();

      await fetch("/api/auth/set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      });

      // Get user data and redirect
      const res = await axios.post("/api/auth/getuser", {
        uid: userCred.user.uid,
      });

      const userData = res.data;
      const userRole = userData?.user?.role?.toLowerCase();
      const correctDashboard = ROLE_DASHBOARD_MAP[userRole];

      window.location.href = correctDashboard;
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox.");
    } catch (err) {
      console.error(err);
      setError("Failed to send reset email");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const idToken = await user.getIdToken();

      const res = await axios.post("/api/auth/create", {
        name: user.displayName,
        email: user.email,
        profilePicture: user.photoURL,
        token: idToken,
      });

      console.log(res.data);

      await fetch("/api/auth/set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      });

      // Get user data and redirect
      const userRes = await axios.post("/api/auth/getuser", {
        uid: user.uid,
      });

      console.log(userRes.data);
      const userData = userRes.data;
      const userRole = userData?.user?.role?.toLowerCase();
      const correctDashboard = ROLE_DASHBOARD_MAP[userRole];

      window.location.href = correctDashboard;
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to sign in with Google");
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowPasswordReset(false);
    setError("");
    setEmail("");
    setPassword("");
  };

  const togglePasswordReset = () => {
    setShowPasswordReset(true);
    setError("");
  };

  // // Show loading while checking auth state
  // if (authChecking) {
  //   return (
  //     <div className="flex items-center justify-center h-screen w-full bg-gray-50">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
  //         <p className="mt-4 text-gray-600">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-gray-50">
      {/* Image Half */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        <Image
          src={"/loginhalf.png"}
          alt="AI interview assistant"
          width={800}
          height={600}
          className="object-cover w-full h-auto max-h-screen"
        />
      </div>

      {/* Login Form Half */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm flex flex-col items-center">
          <Image
            src={"/logo.png"}
            alt="logo"
            width={400}
            height={100}
            className="w-[180px] mb-6"
          />

          {!showPasswordReset ? (
            <>
              <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">
                Log in to your account
              </h2>
              <p className="text-gray-500 text-center mb-6">Welcome back!</p>

              <form onSubmit={handleSignin} className="w-full">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={email}
                    className="bg-white text-gray-900 placeholder-gray-500"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="grid gap-2 mt-4">
                  <Label htmlFor="password" className="text-gray-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    className="bg-white text-gray-900 placeholder-gray-500"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

                <div className="text-right mt-2">
                  <button
                    type="button"
                    onClick={togglePasswordReset}
                    className="text-sm text-blue-600 hover:underline focus:outline-none"
                  >
                    Forgot your password?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Login with Email"}
                </Button>
              </form>

              <div className="flex items-center w-full my-6">
                <div className="flex-grow h-px bg-gray-300"></div>
                <span className="flex-shrink px-4 text-gray-500">OR</span>
                <div className="flex-grow h-px bg-gray-300"></div>
              </div>

              <Button
                className="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold transition-colors"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                Login with Google
              </Button>
            </>
          ) : (
            <>
              <button
                onClick={handleBackToLogin}
                className="self-start text-gray-500 hover:text-gray-700 transition-colors mb-4 flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </button>
              <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">
                Forgot Password?
              </h2>
              <p className="text-gray-500 text-center mb-6">
                Enter your email and we'll send you a password reset link.
              </p>

              <div className="w-full grid gap-2">
                <Label htmlFor="reset-email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={email}
                  className="bg-white text-gray-900 placeholder-gray-500"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

              <Button
                onClick={handleForgotPassword}
                className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;