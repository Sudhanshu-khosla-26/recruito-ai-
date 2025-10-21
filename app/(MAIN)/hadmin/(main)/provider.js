// "use client";

// import { SidebarProvider } from "@/app/components/ui/sidebar";
// import React, { useEffect } from "react";
// import { AppSidebar } from "./_components/AppSidebar";
// import WelcomeContainer from "./dashboard/_components/WelcomeContainer";
// import { useUser } from "@/provider";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// import { auth } from "@/lib/firebase";


// function DashboardProvider({ children }) {
//     const { user, setUser } = useUser();
//     const router = useRouter();

//     useEffect(() => {
//         createOrFetchUser();
//     }, []);

//     const createOrFetchUser = async () => {
//         try {
//             const firebaseUser = auth.currentUser;

//             if (!firebaseUser) {
//                 router.replace("/signin");
//                 return;
//             }

//             // Check if user exists in your backend DB
//             const { data } = await axios.post("/api/auth/getuser", {
//                 uid: firebaseUser.uid,
//                 name: firebaseUser.displayName,
//                 email: firebaseUser.email,
//                 picture: firebaseUser.photoURL,
//             });

//             setUser(data.user);
//         } catch (error) {
//             console.error("Error fetching/creating user:", error);
//         }
//     };

//     return (
//         <SidebarProvider>
//             <AppSidebar />
//             <div className="w-full p-2">
//                 <WelcomeContainer />
//                 {children}
//             </div>
//         </SidebarProvider>
//     );
// }

// export default DashboardProvider;
