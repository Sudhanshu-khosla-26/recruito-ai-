import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function POST(request) {
    try {
        const session = request.cookies.get("session")?.value;
        if (!session) {
            return NextResponse.json({ error: "No session found" }, { status: 400 });
        }

        let decodedUser;
        try {
            const decodedToken = await getAuth().verifySessionCookie(session, true);
            const userDoc = await adminDB.collection("users").doc(decodedToken.uid).get();

            if (!userDoc.exists) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            decodedUser = { uid: decodedToken.uid, ...userDoc.data() };
        } catch (err) {
            console.error("Auth error:", err);
            return NextResponse.json({ error: "Invalid token" }, { status: 403 });
        }

        const validRoles = ["Admin"];
        if (!validRoles.includes(decodedUser.role)) {
            return NextResponse.json({ error: "User role is not valid" }, { status: 403 });
        }

        // Admin must have company_id
        if (!decodedUser.company_id) {
            return NextResponse.json({ error: "Admin user must be associated with a company" }, { status: 403 });
        }

        const { role, name, email, password } = await request.json();

        // Validate required fields
        if (!role || !name || !email || !password) {
            return NextResponse.json({
                error: "Missing required fields (role, name, email, password)"
            }, { status: 400 });
        }

        // Validate allowed roles for Admin
        const allowedRoles = ["HHR", "HR", "HM"];
        if (!allowedRoles.includes(role)) {
            return NextResponse.json({
                error: "Invalid role. Admin can only create HHR, HR, or HM users"
            }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
        }

        // Validate password length
        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }

        // Check if user already exists
        const userref = await adminDB.collection("users").where("email", "==", email).get();
        if (!userref.empty) {
            return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
        }

        // Verify company exists
        const companyDoc = await adminDB.collection("companies").doc(decodedUser.company_id).get();
        if (!companyDoc.exists) {
            return NextResponse.json({ error: "Company not found" }, { status: 404 });
        }

        // Step 1: Create Firebase Auth user
        let authUser;
        try {
            authUser = await getAuth().createUser({
                email: email,
                displayName: name,
                password: password,
                emailVerified: false
            });
        } catch (authError) {
            console.error("Error creating Firebase Auth user:", authError);
            return NextResponse.json({
                error: "Failed to create authentication user",
                details: authError.message
            }, { status: 500 });
        }

        // Step 2: Create Firestore user document
        const userData = {
            email: email,
            name: name,
            role: role,
            status: "active",
            company_id: decodedUser.company_id, // Use admin's company_id

            created_at: new Date(),
            updated_at: new Date(),
            created_by: decodedUser.uid
        };

        try {
            await adminDB.collection("users").doc(authUser.uid).set(userData);

            return NextResponse.json({
                message: "User created successfully",
                user: {
                    uid: authUser.uid,
                    ...userData
                }
            }, { status: 201 });

        } catch (firestoreError) {
            console.error("Error creating Firestore user:", firestoreError);

            // Rollback: Delete auth user
            try {
                await getAuth().deleteUser(authUser.uid);
            } catch (deleteError) {
                console.error("Error rolling back auth user:", deleteError);
            }

            return NextResponse.json({
                error: "Failed to create user in database",
                details: firestoreError.message
            }, { status: 500 });
        }

    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message
        }, { status: 500 });
    }
}