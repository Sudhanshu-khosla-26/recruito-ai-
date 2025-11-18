import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminDB } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request) {
    try {
        // Auth Check
        const session = request.cookies.get("session")?.value;
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let decodedUser;
        try {
            const auth = await getAuth().verifySessionCookie(session, true);
            const userDoc = await adminDB.collection("users").doc(auth.uid).get();
            if (!userDoc.exists) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }
            decodedUser = { uid: auth.uid, ...userDoc.data() };
        } catch {
            return NextResponse.json({ error: "Invalid session" }, { status: 403 });
        }

        const { interview_id } = await request.json();
        if (!interview_id) {
            return NextResponse.json({ error: "interview_id required" }, { status: 400 });
        }

        // Get Interview
        const interviewRef = adminDB.collection("interviews").doc(interview_id);
        const interviewDoc = await interviewRef.get();

        if (!interviewDoc.exists) {
            return NextResponse.json({ error: "Interview not found" }, { status: 404 });
        }

        const interview = interviewDoc.data();

        // Verify this is the candidate's interview
        if (interview.candidate_email !== decodedUser.email) {
            return NextResponse.json({ error: "Unauthorized to modify this interview" }, { status: 403 });
        }

        // Check if already accepted or completed
        if (interview.status === "confirmed" || interview.status === "completed") {
            return NextResponse.json({
                error: "Interview already confirmed or completed"
            }, { status: 400 });
        }

        // Update interview status
        await interviewRef.update({
            status: "confirmed",
            candidate_accepted_at: FieldValue.serverTimestamp(),
            updated_at: FieldValue.serverTimestamp()
        });

        // Send notification to HR/HM
        const hrId = interview.hr_id || interview.created_by;
        if (hrId) {
            await adminDB.collection("notifications").add({
                sender_id: decodedUser.uid,
                receiver_id: hrId,
                notification_type: "interview_accepted",
                title: "Interview Accepted",
                message: `${decodedUser.name || decodedUser.email} has accepted the interview scheduled for ${new Date(interview.start_time._seconds * 1000).toLocaleString()}`,
                created_at: FieldValue.serverTimestamp(),
                metadata: {
                    interview_id,
                    candidate_email: decodedUser.email
                }
            });
        }

        return NextResponse.json({
            message: "Interview accepted successfully",
            interview_id
        }, { status: 200 });

    } catch (error) {
        console.error("[candidate.accept]", error);
        return NextResponse.json({
            error: "Failed to accept interview",
            details: error.message
        }, { status: 500 });
    }
}