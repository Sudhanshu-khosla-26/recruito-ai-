// app/(MAIN)/hadmin/layout.jsx
"use client";
import { SidebarProvider } from "@/app/components/ui/sidebar";
import React, { useEffect, useState } from "react";
import { AppSidebar } from "./_components/AppSidebar";
import WelcomeContainer from "./_components/WelcomeContainer.jsx";
import { useUser } from "@/provider.jsx";
import { useRouter, usePathname } from "next/navigation";
import UnauthorizedPopup from "../components/ui/UnauthorizedPopup.jsx";


function DashboardProvider({ children }) {
    const { user, loading } = useUser();
    const [show, setShow] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    console.log("Current pathname:", pathname, user);
    const role = user?.role.toLowerCase();
    const isHadminRoute = pathname.startsWith('/hadmin');
    const isCandidateRoute = pathname.startsWith('/candidate');
    const isAdminRoute = pathname.startsWith('/admin');
    const isHrRoute = pathname.startsWith('/hr');
    const isHmRoute = pathname.startsWith('/hm');






    useEffect(() => {
        // If not loading and no user, redirect to signin
        if (!loading && !user) {
            router.replace("/signin");
        }

        if (isHadminRoute && role !== 'hadmin' ||
            isAdminRoute && role !== 'admin' ||
            isCandidateRoute && role !== 'jobseeker' ||
            isHrRoute && role !== 'hr' ||
            isHmRoute && role !== 'hm'
        ) {
            setShow(true);
        } else {
            setShow(false);
        }

    }, [user, loading, router, pathname]);

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    // If no user, don't render the dashboard
    if (!user) {
        return null;
    }

    return (
        <SidebarProvider>

            <AppSidebar />
            <div className="w-full p-2">
                <WelcomeContainer />
                {show ? (
                    <UnauthorizedPopup show={show} role={role} />
                ) : (
                    children
                )}


            </div>
        </SidebarProvider>
    );
}

export default DashboardProvider;