import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function PATCH(request) {
    try {
        const session = await request.cookies.get("session")?.value;
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

        const { role, permissions, candidateID, status } = await request.json();
        // if (!role || !permissions || !candidateID) {
        //     return NextResponse.json({ error: "Missing required fields: role, permissions, candidateID" }, { status: 400 });
        // }



        const userRef = adminDB.collection("users").doc(candidateID);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        await userRef.update({ role: role, permissions: permissions, status: status });

        return NextResponse.json({ message: "User role and permissions updated successfully" }, { status: 200 });



    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}