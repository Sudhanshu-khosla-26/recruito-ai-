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

        const validRoles = ["HAdmin"];
        if (!validRoles.includes(decodedUser.role)) {
            return NextResponse.json({ error: "User role is not valid" }, { status: 403 });
        }



        const { role, name, email, company_id, status } = await request.json();

        if (!role || !name || !email || !company_id || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const userref = await adminDB.collection("users").where("email", "==", email).get();
        if (!userref.empty) {
            return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
        }

        // Update user role in Firestore
        await adminDB.collection("users").add({
            email: email,
            name: name,
            role: role,
            company_id: company_id,
            status: status,
        })

        return NextResponse.json({ message: "User created successfully" }, { status: 200 });


    } catch (error) {
        console.error("Error updating user role:", error);
        return NextResponse.json({ error: "Internal Server Error " }, { status: 500 })
    }
}