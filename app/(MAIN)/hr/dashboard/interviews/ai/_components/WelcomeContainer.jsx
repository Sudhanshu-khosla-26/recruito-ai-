"use client"
import { useUser } from '@/provider';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { Search, Bell, ListTodo, ChevronDown } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

function WelcomeContainer() {
    const { user, logout } = useUser();
    const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);

    useEffect(() => {
        const hasVisited = localStorage.getItem('hasVisited');
        if (hasVisited) {
            setIsFirstTimeUser(false);
        } else {
            localStorage.setItem('hasVisited', 'true');
        }
    }, []);

    const handleLogout = () => {
        console.log("Logging out...");
        if (logout) {
            logout();
        }
    };

    const primaryGreen = '#3cb44a';

    return (
        <div className='relative flex items-center justify-between px-8 py-6 rounded-2xl bg-gradient-to-r from-white to-green-50 shadow-xl dark:from-gray-950 dark:to-green-950'>
            {/* Welcome Message Section */}
            <div className='flex flex-col'>
                <h2 className='text-3xl font-bold tracking-tight' style={{ color: primaryGreen }}>
                    {isFirstTimeUser ? `Welcome, ` : `Welcome Back, `}
                    <span className='text-orange-500'>Peris!</span>
                </h2>
                <p className='text-md text-gray-600 dark:text-gray-400 mt-2'>
                    Ready to conquer the day? Here's what's new.
                </p>
            </div>

            {/* Actions and Profile Section */}
            <div className='flex items-center gap-4'>
                {/* Search Bar (hidden on small screens) */}
                <div className='hidden md:flex flex-grow-0 min-w-[300px]'>
                    <div className="relative w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search for anything..."
                            className={`pl-12 pr-4 py-3 border-none rounded-full bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors duration-200`}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className='flex gap-2'>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-12 w-12 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-200`}
                    >
                        <ListTodo className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-12 w-12 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-200`}
                    >
                        <Bell className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </Button>
                </div>

                {/* Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className={`relative h-12 px-4 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-200`}
                        >
                            {user && user.picture ? (
                                <Image src={user.picture} alt="userAvatar" width={30} height={30} className="rounded-full object-cover mr-2" />
                            ) : (
                                <div className="rounded-full h-8 w-8 bg-gray-300 flex items-center justify-center text-sm font-bold mr-2">
                                    A
                                </div>
                            )}
                            <span className="font-medium text-base text-gray-800 dark:text-gray-100 hidden sm:inline">Super Admin</span>
                            <ChevronDown className="ml-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">Super Admin</p>
                                <p className="text-xs leading-none text-gray-500">
                                    {user?.email || 'admin@example.com'}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout}>
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

export default WelcomeContainer;