"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useUser } from "@/provider";
import { Search, Bell, ListTodo, ChevronDown } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

function WelcomeContainer() {
  const { user, signout } = useUser(); // ✅ use context
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (hasVisited) {
      setIsFirstTimeUser(false);
    } else {
      localStorage.setItem("hasVisited", "true");
    }
  }, []);

  const handleLogout = () => {
    console.log("Logging out...");
    signout();
  };

  const displayName = user?.name || "User";
  const userEmail = user?.email || "example@email.com";
  const userPhoto = user?.profilePicture || "/default-avatar.png"; // fallback image
  const primaryGreen = "#3cb44a";
  const userRole = user?.role || "Candidate";

  return (
    <div className="flex items-center gap-2 p-1 rounded-l bg-white dark:bg-gray-950 shadow-sm">
      {/* Welcome Container */}
      <div className="flex-grow p-1 md:px-6 bg-white rounded-l">
        <h2 className="text-lg font-semibold" style={{ color: primaryGreen }}>
          {isFirstTimeUser ? `Welcome, ` : `Welcome Back, `}
          <span className="text-orange-500">{displayName} 👋</span>
        </h2>
      </div>

      {/* Search Bar */}
      <div className="hidden md:flex flex-grow-0 min-w-[300px]">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for anything..."
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full bg-gray-50 dark:bg-gray-900 focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition-colors duration-200"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" size="icon" className="h-9 w-9 border-gray-300 dark:border-gray-700 rounded-full bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800">
          <ListTodo className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </Button>
        <Button variant="outline" size="icon" className="h-9 w-9 border-gray-300 dark:border-gray-700 rounded-full bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800">
          <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </Button>
      </div>

      {/* Profile Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="relative h-10 px-3 border-gray-300 rounded-full dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Image
              src={userPhoto}
              alt="userAvatar"
              width={25}
              height={25}
              className="rounded-full object-cover mr-2"
            />
            <span className="font-medium text-sm text-gray-800 dark:text-gray-100 hidden sm:inline">
              {userRole}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-gray-500">{userEmail}</p>
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
  );
}

export default WelcomeContainer;
