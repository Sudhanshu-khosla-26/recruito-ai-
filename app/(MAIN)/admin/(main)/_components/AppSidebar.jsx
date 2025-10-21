"use client"

import { Button } from "@/app/components/ui/button"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/app/components/ui/sidebar"
import { useUser } from "@/provider"
import { Plus, FileText, FileSearch, Mic, CheckCircle, Sun, Moon, GemIcon, User, Users, Briefcase, ChevronRight, LayoutDashboardIcon, Building2, UserCog, FileBarChart, Calendar, Settings } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

// Admin Sidebar Options
const adminSideBarOptions = [
    {
        name: "Dashboard",
        path: "/admin/dashboard",
        icon: LayoutDashboardIcon,
    },
    {
        name: "Manage Users",
        path: "/admin/users",
        icon: Users,
    },
    {
        name: "Companies",
        path: "/admin/companies",
        icon: Building2,
    },
    {
        name: "System Settings",
        path: "/admin/settings",
        icon: Settings,
    },
    {
        name: "Reports",
        path: "/admin/reports",
        icon: FileBarChart,
    },
];

// HAdmin (Head Admin) Sidebar Options
const hadminSideBarOptions = [
    {
        name: "Dashboard",
        path: "/hadmin/dashboard",
        icon: LayoutDashboardIcon,
    },
    {
        name: "Manage Admins",
        path: "/hadmin/admins",
        icon: UserCog,
    },
    {
        name: "All Companies",
        path: "/hadmin/companies",
        icon: Building2,
    },
    {
        name: "Analytics",
        path: "/hadmin/analytics",
        icon: FileBarChart,
    },
    {
        name: "System Config",
        path: "/hadmin/config",
        icon: Settings,
    },
];

// HR Sidebar Options
const hrSideBarOptions = [
    {
        name: "Dashboard",
        path: "/hr/dashboard",
        icon: LayoutDashboardIcon,
    },
    {
        name: "Job Descriptions",
        path: "/hr/job-descriptions",
        icon: FileText,
    },
    {
        name: "Candidates",
        path: "/hr/candidates",
        icon: Users,
    },
    {
        name: "Analyse Resume",
        path: "/hr/analyse-resume",
        icon: FileSearch,
    },
    {
        name: "Interviews",
        path: "/hr/interviews",
        icon: Mic,
        subButtons: [
            {
                name: "Schedule",
                path: "/hr/interviews/schedule",
                icon: Calendar,
            },
            {
                name: "AI Bot",
                path: "/hr/interviews/ai",
                icon: GemIcon,
            },
            {
                name: "Managers",
                path: "/hr/interviews/hm",
                icon: Briefcase,
            },
        ]
    },
    {
        name: "Status",
        path: "/hr/status",
        icon: CheckCircle,
    },
];

// HHR (Head HR) Sidebar Options
const hhrSideBarOptions = [
    {
        name: "Dashboard",
        path: "/hhr/dashboard",
        icon: LayoutDashboardIcon,
    },
    {
        name: "HR Team",
        path: "/hhr/hr-team",
        icon: Users,
    },
    {
        name: "All Job Postings",
        path: "/hhr/job-postings",
        icon: FileText,
    },
    {
        name: "Candidate Pool",
        path: "/hhr/candidates",
        icon: Users,
    },
    {
        name: "Interviews",
        path: "/hhr/interviews",
        icon: Mic,
    },
    {
        name: "Reports",
        path: "/hhr/reports",
        icon: FileBarChart,
    },
];

// HM (Hiring Manager) Sidebar Options
const hmSideBarOptions = [
    {
        name: "Dashboard",
        path: "/hm/dashboard",
        icon: LayoutDashboardIcon,
    },
    {
        name: "My Openings",
        path: "/hm/openings",
        icon: FileText,
    },
    {
        name: "Candidates",
        path: "/hm/candidates",
        icon: Users,
    },
    {
        name: "Scheduled Interviews",
        path: "/hm/interviews",
        icon: Calendar,
    },
    {
        name: "Feedback",
        path: "/hm/feedback",
        icon: CheckCircle,
    },
];

// Candidate (Job Seeker) Sidebar Options
const candidateSideBarOptions = [
    {
        name: "Dashboard",
        path: "/candidate/dashboard",
        icon: LayoutDashboardIcon,
    },
    {
        name: "My Applications",
        path: "/candidate/applications",
        icon: FileText,
    },
    {
        name: "Job Search",
        path: "/candidate/jobs",
        icon: FileSearch,
    },
    {
        name: "My Interviews",
        path: "/candidate/interviews",
        icon: Mic,
        subButtons: [
            {
                name: "Upcoming",
                path: "/candidate/interviews/upcoming",
                icon: Calendar,
            },
            {
                name: "AI Practice",
                path: "/candidate/interviews/practice",
                icon: GemIcon,
            },
        ]
    },
    {
        name: "Profile",
        path: "/candidate/profile",
        icon: User,
    },
];

// Role to sidebar mapping
const roleSidebarMap = {
    hadmin: hadminSideBarOptions,
    admin: adminSideBarOptions,
    hr: hrSideBarOptions,
    hhr: hhrSideBarOptions,
    hm: hmSideBarOptions,
    jobseeker: candidateSideBarOptions, // alias for candidate
};

export function AppSidebar() {
    const { user } = useUser(); // Get user from provider
    const path = usePathname();
    const [theme, setTheme] = useState('light');
    const [openSubButton, setOpenSubButton] = useState(null);

    // Get sidebar options based on user role
    const userRole = user?.role?.toLowerCase();
    const sideBarOptions = roleSidebarMap[userRole];

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        // Set the currently active sub-button group to open on initial load
        sideBarOptions.forEach((option) => {
            if (option.subButtons && option.subButtons.some(sub => path.startsWith(sub.path))) {
                setOpenSubButton(option.name);
            }
        });
    }, [path, sideBarOptions]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const toggleSubButton = (name) => {
        setOpenSubButton(openSubButton === name ? null : name);
    };

    // Define the custom Recruito colors
    const primaryGreen = '#3cb44a';
    const lightGreen = '#e0ffe3';
    const darkGreen = '#1a4f1e';
    const textLight = '#1e3a24';
    const textDark = '#d0f0d2';

    return (
        <Sidebar className="dark:bg-gray-900 bg-gray-100 text-gray-900 dark:text-gray-100 transition-colors duration-300 w-60 min-h-screen">
            <SidebarHeader className='flex flex-col items-center mt-6 p-4 border-b dark:border-gray-700 border-gray-300'>
                <Image src={'/logo1.png'} alt="logo1" width={120} height={25} className="w-[120px] h-[25px] filter dark:invert mb-4" />
            </SidebarHeader>
            <SidebarContent className="flex-grow p-4 overflow-y-auto space-y-2">
                <SidebarGroup>
                    <SidebarContent>
                        <SidebarMenu>
                            {sideBarOptions.map((option, index) => (
                                <div key={index}>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            className={`
                                                w-full p-3 rounded-xl transition-all duration-300 text-sm font-medium
                                                ${path === option.path ?
                                                    `dark:bg-green-900/60 bg-green-100 text-[${textLight}] dark:text-[${textDark}]` :
                                                    'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}
                                            `}
                                            onClick={() => option.subButtons && toggleSubButton(option.name)}
                                        >
                                            <Link href={option.path} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <option.icon className={`h-5 w-5 transition-colors duration-300 ${path === option.path ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`} />
                                                    <span>{option.name}</span>
                                                </div>
                                                {option.subButtons && (
                                                    <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${openSubButton === option.name ? 'rotate-90' : ''}`} />
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    {option.subButtons && openSubButton === option.name && (
                                        <div className="ml-8 border-l border-gray-300 dark:border-gray-700 pl-4 py-1 space-y-2">
                                            {option.subButtons.map((sub, subIndex) => (
                                                <SidebarMenuItem key={subIndex}>
                                                    <SidebarMenuButton
                                                        asChild
                                                        className={`
                                                            w-full p-2 rounded-xl transition-all duration-300 text-sm font-normal
                                                            ${path === sub.path ?
                                                                `dark:bg-green-800/60 bg-green-200 text-green-600 dark:text-green-300` :
                                                                'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}
                                                        `}
                                                    >
                                                        <Link href={sub.path} className="flex items-center gap-3">
                                                            <sub.icon className={`h-4 w-4 transition-colors duration-300 ${path === sub.path ? 'text-green-600 dark:text-green-300' : 'text-gray-500 dark:text-gray-500'}`} />
                                                            <span>{sub.name}</span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </SidebarMenu>
                    </SidebarContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}