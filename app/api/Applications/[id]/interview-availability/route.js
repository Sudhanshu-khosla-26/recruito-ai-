import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function GET(request, { params }) {
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
            const data = { ...user.data(), uid: user.id };
            decodedUser = data;
        } catch (err) {
            console.log(err);
            return NextResponse.json({ error: "Invalid token" }, { status: 403 });
        }

        const { id } = await params;



        console.log(`Checking interview availability for application ID: ${id}`);

        // Get application
        const appDoc = await adminDB
            .collection("applications")
            .doc(id)
            .get();

        if (!appDoc.exists) {
            return NextResponse.json(
                { error: "Application not found." },
                { status: 404 }
            );
        }

        const application = appDoc.data();

        // Get company settings
        const settingsSnapshot = await adminDB
            .collection("company_settings")
            .where("company_id", "==", decodedUser.company_id)
            .limit(1)
            .get();

        // Default max AI interviews if settings not found
        let maxAiInterviews = 3;

        if (!settingsSnapshot.empty) {
            const settings = settingsSnapshot.docs[0].data();
            maxAiInterviews = settings.max_ai_interviews ?? 3;
        }

        // Get interviews for this application
        const interviewsSnapshot = await adminDB
            .collection("interviews")
            .where("application_id", "==", id)
            .get();

        const interviews = interviewsSnapshot.docs.map((doc) => doc.data());

        // Count AI interviews (scheduled + completed)
        const aiInterviews = interviews.filter(
            (i) => i.mode?.toLowerCase() === "wai"
        );

        const aiScheduled = aiInterviews.filter(
            (i) => i.status === "scheduled"
        ).length;

        const aiCompleted = aiInterviews.filter(
            (i) => i.status === "completed"
        ).length;

        const aiTotal = aiScheduled + aiCompleted;

        // Determine if can schedule more AI interviews
        const canScheduleAI = aiTotal < maxAiInterviews;

        return NextResponse.json({
            id,
            max_ai_interviews: maxAiInterviews,
            ai_scheduled: aiScheduled,
            ai_completed: aiCompleted,
            ai_total: aiTotal,
            can_schedule_ai: canScheduleAI,
            message: !canScheduleAI
                ? `AI interview limit reached (${aiTotal}/${maxAiInterviews})`
                : null,
        });
    } catch (error) {
        console.error("Error checking interview availability:", error);
        return NextResponse.json(
            { error: "Failed to check availability.", details: error.message },
            { status: 500 }
        );
    }
}