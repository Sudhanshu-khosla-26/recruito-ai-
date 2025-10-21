import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function DELETE(
    request,
    { params }
) {
    try {
        const session = request.headers.get("cookie")?.split("session=")[1];
        if (!session) {
            return NextResponse.json({ error: "No session found" }, { status: 400 });
        }

        // Verify session with Admin SDK
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

        // Role check
        if (decodedUser.role !== "HAdmin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const docRef = await adminDB.collection("job_descriptions").doc(id);
        const jobDoc = await docRef.get();

        if (!jobDoc.exists) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        await docRef.delete();
        return NextResponse.json({ message: "Job description deleted successfully" }, { status: 200 });
    } catch (err) {
        console.error("Delete job error:", err);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}

