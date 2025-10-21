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
import { SideBarOptions } from "@/services/Constants"
import { Plus, FileText, FileSearch, Mic, CheckCircle, Sun, Moon, GemIcon, User, Users, Briefcase, ChevronRight, LayoutDashboardIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react";

// Define the new sidebar options
const newSideBarOptions = [
    {
        name: "Dashboard",
        path: "/users/candidate-dashboard",
        icon: LayoutDashboardIcon,
    },
    {
        name: "Job Descriptions",
        path: "/users/candidate-interviews",
        icon: FileText,
        subButtons: [
            {
                name: "Create JD",
                path: "/dashboard/job-descriptions/create-jd",
                icon: Plus,
            }
        ]
    },
    
    {
        name: "Interviews",
        path: "/dashboard/interviews",
        icon: Mic,
    },
    {
        name: "Status",
        path: "/dashboard/status",
        icon: CheckCircle,
    },
];

export function AppSidebar() {
    const path = usePathname();
    const [theme, setTheme] = useState('light');
    const [openSubButton, setOpenSubButton] = useState(null);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        // Set the currently active sub-button group to open on initial load
        newSideBarOptions.forEach((option) => {
            if (option.subButtons && option.subButtons.some(sub => path.startsWith(sub.path))) {
                setOpenSubButton(option.name);
            }
        });
    }, [path]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const toggleSubButton = (name) => {
        setOpenSubButton(openSubButton === name ? null : name);
    };

    const combinedOptions = [...SideBarOptions, ...newSideBarOptions];

    // Define the custom Recruito colors
    const primaryGreen = '#3cb44a'; // A vibrant green
    const lightGreen = '#e0ffe3'; // A very light green for active background in light mode
    const darkGreen = '#1a4f1e'; // A dark green for active background in dark mode
    const textLight = '#1e3a24'; // Darker text for light mode
    const textDark = '#d0f0d2'; // Lighter text for dark mode

    return (
        <Sidebar className="dark:bg-gray-900 bg-gray-100 text-gray-900 dark:text-gray-100 transition-colors duration-300 w-60 min-h-screen">
            <SidebarHeader className='flex flex-col items-center mt-6 p-4 border-b dark:border-gray-700 border-gray-300'>
                <Image src={'/logo1.png'} alt="logo1" width={120} height={25} className="w-[120px] h-[25px] filter dark:invert mb-4" />
                <Link href={'/dashboard/interviews/ai/create-interview'} className='w-full'>
                    <Button
                        style={{ backgroundColor: primaryGreen }}
                        className='w-full rounded-full hover:bg-green-600 text-white shadow-md transition-colors text-sm font-semibold py-2'
                    >
                        <Plus className="mr-2 h-4 w-4" /> Create New Interview
                    </Button>
                </Link>
            </SidebarHeader>
            <SidebarContent className="flex-grow p-4 overflow-y-auto space-y-2">
                <SidebarGroup>
                    <SidebarContent>
                        <SidebarMenu>
                            {combinedOptions.map((option, index) => (
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
            <SidebarFooter className="p-4 border-t dark:border-gray-700 border-gray-300 flex justify-center items-center gap-2">
                <Button
                    onClick={() => setTheme('light')}
                    className={`p-2 rounded-full transition-colors duration-200 ${theme === 'light' ? 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'bg-transparent text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                    aria-label="Toggle light theme"
                >
                    <Sun className="h-5 w-5" />
                </Button>
                <Button
                    onClick={() => setTheme('dark')}
                    className={`p-2 rounded-full transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'bg-transparent text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                    aria-label="Toggle dark theme"
                >
                    <Moon className="h-5 w-5" />
                </Button>
            </SidebarFooter>
        </Sidebar>
    );
}