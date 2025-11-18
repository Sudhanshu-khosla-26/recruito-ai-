import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request) {
    try {
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

        const { interview_id, new_scheduled_at, reason } = await request.json();

        if (!interview_id || !new_scheduled_at) {
            return NextResponse.json({
                error: "interview_id and new_scheduled_at required"
            }, { status: 400 });
        }

        const interviewRef = adminDB.collection("interviews").doc(interview_id);
        const interviewDoc = await interviewRef.get();

        if (!interviewDoc.exists) {
            return NextResponse.json({ error: "Interview not found" }, { status: 404 });
        }

        const interview = interviewDoc.data();

        // Verify candidate
        if (interview.candidate_email !== decodedUser.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Check reschedule limit
        const rescheduleCount = interview.reschedule_count || 0;
        if (rescheduleCount >= 2) {
            return NextResponse.json({
                error: "Reschedule limit reached (maximum 2 times)"
            }, { status: 403 });
        }

        // Validate new date is in future
        const newDate = new Date(new_scheduled_at);
        if (newDate <= new Date()) {
            return NextResponse.json({
                error: "New scheduled time must be in the future"
            }, { status: 400 });
        }

        // Store old time and update
        await interviewRef.update({
            old_scheduled_at: interview.start_time || null,
            requested_new_time: new Date(new_scheduled_at),
            status: "rescheduled",
            reschedule_reason: reason || "Not provided",
            reschedule_count: FieldValue.increment(1),
            requested_reschedule_at: FieldValue.serverTimestamp(),
            reschedule_requested_by: "candidate",
            updated_at: FieldValue.serverTimestamp()
        });

        // Notify HR/HM
        const hrId = interview.hr_id || interview.created_by;
        if (hrId) {
            await adminDB.collection("notifications").add({
                sender_id: decodedUser.uid,
                receiver_id: hrId,
                notification_type: "reschedule_request",
                title: "Reschedule Request",
                message: `${decodedUser.name || decodedUser.email} has requested to reschedule the interview to ${newDate.toLocaleString()}`,
                created_at: FieldValue.serverTimestamp(),
                metadata: {
                    interview_id,
                    old_time: interview.start_time,
                    new_time: new_scheduled_at,
                    reason: reason || "Not specified"
                }
            });
        }

        return NextResponse.json({
            message: "Reschedule request submitted successfully. HR will review your request.",
            interview_id,
            new_scheduled_at
        }, { status: 200 });

    } catch (error) {
        console.error("[candidate.reschedule]", error);
        return NextResponse.json({
            error: "Failed to request reschedule",
            details: error.message
        }, { status: 500 });
    }
}
