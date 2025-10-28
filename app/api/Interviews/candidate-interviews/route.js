import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function GET(request) {
    try {
        const session = request.cookies.get("session")?.value;
        if (!session) {
            return NextResponse.json({ error: "No session found" }, { status: 400 });
        }

        let decodedUser;
        try {
            decodedUser = await getAuth().verifySessionCookie(session, true);
            const user = await adminDB.collection("users").doc(decodedUser.uid).get();
            if (!user.exists) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }
            const data = user.data();
            decodedUser = data;
        } catch (err) {
            console.log(err);
            return NextResponse.json({ error: "Invalid token" }, { status: 403 });
        }

        const validRoles = ["jobseeker"];
        if (!validRoles.includes(decodedUser.role)) {
            return NextResponse.json({ error: "User role is not valid" }, { status: 403 });
        }

        const interviewsDocs = await adminDB.collection("interviews")
            .where("candidate_email", "==", decodedUser.email)
            .get();

        const interviews = interviewsDocs.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({
            interviews
        });

    } catch (error) {
        console.error("Error fetching candidate interviews:", error);
        return NextResponse.json({ error: "Failed to fetch candidate interviews" }, { status: 500 });
    }
}