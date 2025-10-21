"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
// import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase"; // your Firebase config file path
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";

// Create Context
const UserDetailContext = createContext(null);

// Define public routes (where user check isn’t needed)
const PUBLIC_ROUTES = ["/signin", "/signup", "/"];

export function Provider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {

        if (PUBLIC_ROUTES.includes(pathname)) {
            setLoading(false);
            return;
        }


        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const res = await axios.post("/api/auth/getuser", {
                        uid: firebaseUser.uid,
                    });
                    console.log(res)
                    setUser(res.data.user || firebaseUser);
                } catch (error) {
                    console.error("Error fetching user:", error);
                    setUser(firebaseUser); // fallback
                }
            } else {
                setUser(null);
                router.push("/signin");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [pathname, router]);

    // Logout
    const signout = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
            router.push("/signin");
        } catch (err) {
            console.error("Error signing out:", err);
        }
    };

    const value = useMemo(
        () => ({ user, setUser, signout, loading }),
        [user, loading]
    );

    return (
        // <PayPalScriptProvider
        //     options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID }}
        // >
        <UserDetailContext.Provider value={value}>
            {!loading && children}
        </UserDetailContext.Provider>
        // </PayPalScriptProvider>
    );
}

// ✅ Custom hook
export const useUser = () => {
    return useContext(UserDetailContext);
};

