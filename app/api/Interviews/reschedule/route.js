import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminDB } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request) {
    try {
        // 1️⃣ Auth Check
        const session = request.cookies.get("session")?.value;
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        let decodedUser;
        try {
            const auth = await getAuth().verifySessionCookie(session, true);
            const userDoc = await adminDB.collection("users").doc(auth.uid).get();
            if (!userDoc.exists) return NextResponse.json({ error: "User not found" }, { status: 404 });
            decodedUser = userDoc.data();
        } catch (err) {
            console.error("Auth error:", err);
            return NextResponse.json({ error: "Invalid or expired session" }, { status: 403 });
        }

        const { interview_id, new_scheduled_at, reason } = await request.json();
        if (!interview_id || !new_scheduled_at)
            return NextResponse.json({ error: "interview_id & new_scheduled_at required" }, { status: 400 });

        // 2️⃣ Fetch Interview
        const interviewRef = adminDB.collection("interviews").doc(interview_id);
        const interviewDoc = await interviewRef.get();

        if (!interviewDoc.exists)
            return NextResponse.json({ error: "Interview not found" }, { status: 404 });

        const interview = interviewDoc.data();

        // 3️⃣ Prevent abuse
        const allowedCount = 2;
        const currentCount = interview.reschedule_count || 0;

        if (currentCount >= allowedCount)
            return NextResponse.json({ error: "Reschedule limit reached" }, { status: 403 });

        // 4️⃣ Update Interview for reschedule workflow
        await interviewRef.update({
            old_scheduled_at: interview.scheduled_at || null,
            scheduled_at: new Date(new_scheduled_at),
            status: "rescheduled",
            reschedule_reason: reason || "Not provided",
            reschedule_count: FieldValue.increment(1),
            requested_reschedule_at: FieldValue.serverTimestamp(),
            updated_at: FieldValue.serverTimestamp()
        });

        // 5️⃣ Add Notification to HR users
        await adminDB.collection("notifications").add({
            sender_id: decodedUser.uid,
            receiver_id: interview.interviewer_id || null,
            notification_type: "reschedule_request",
            title: "Interview reschedule requested",
            message: `Candidate has requested to reschedule interview: ${interview_id}`,
            created_at: FieldValue.serverTimestamp(),
            metadata: {
                interview_id,
                new_scheduled_at,
                reason
            }
        });

        return NextResponse.json({
            message: "Reschedule request submitted successfully",
            interview_id,
            new_scheduled_at
        }, { status: 200 });

    } catch (error) {
        console.error("[interviews.reschedule] Unexpected server error:", error);
        return NextResponse.json(
            { error: "Failed to request interview reschedule", details: error.message },
            { status: 500 }
        );
    }
}
