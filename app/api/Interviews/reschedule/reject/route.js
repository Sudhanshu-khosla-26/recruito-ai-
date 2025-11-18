import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminDB } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request) {
    try {
        const session = request.cookies.get("session")?.value;
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        let decodedUser;
        try {
            const auth = await getAuth().verifySessionCookie(session, true);
            const userDoc = await adminDB.collection("users").doc(auth.uid).get();
            if (!userDoc.exists) return NextResponse.json({ error: "User not found" }, { status: 404 });
            decodedUser = userDoc.data();
        } catch {
            return NextResponse.json({ error: "Invalid session" }, { status: 403 });
        }

        const { interview_id, admin_reason } = await request.json();
        if (!interview_id) return NextResponse.json({ error: "interview_id required" }, { status: 400 });

        const validRoles = ["Admin", "HHR", "HR", "HM", "recruiter"];
        if (!validRoles.includes(decodedUser.role)) {
            return NextResponse.json({ error: "Permission denied" }, { status: 403 });
        }

        const interviewRef = adminDB.collection("interviews").doc(interview_id);
        const doc = await interviewRef.get();

        if (!doc.exists) return NextResponse.json({ error: "Interview not found" }, { status: 404 });

        const interview = doc.data();

        // Rollback or cancel
        const rollbackTime = interview.old_scheduled_at || null;

        await interviewRef.update({
            scheduled_at: rollbackTime,
            status: rollbackTime ? "scheduled" : "cancelled",
            admin_reject_reason: admin_reason || "No reason provided",
            updated_at: FieldValue.serverTimestamp()
        });

        // Notification to candidate
        await adminDB.collection("notifications").add({
            sender_id: decodedUser.uid,
            receiver_id: interview.candidate_id,
            notification_type: "reschedule_update",
            title: "Reschedule Rejected",
            message: `HR rejected your reschedule request. Reason: ${admin_reason}`,
            created_at: FieldValue.serverTimestamp()
        });

        return NextResponse.json({ message: "Reschedule rejected successfully" }, { status: 200 });

    } catch (error) {
        console.error("[reschedule.reject]", error);
        return NextResponse.json({ error: "Failed to reject reschedule", details: error.message }, { status: 500 });
    }
}
