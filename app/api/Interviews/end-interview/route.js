import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function PATCH(request) {
    try {
        const { interviewId } = await request.json();

        if (!interviewId) {
            return NextResponse.json(
                { message: "Interview ID is required" },
                { status: 400 }
            );
        }

        console.log(`🏁 Marking interview ${interviewId} as completed`);

        const payload = {
            ended_at: FieldValue.serverTimestamp(),
            status: "completed",

        };

        const interviewRef = adminDB.collection("interviews").doc(interviewId);
        await interviewRef.update(payload);

        console.log(`✅ Interview ${interviewId} marked as completed`);

        return NextResponse.json({
            success: true,
            message: "Interview completed successfully"
        }, { status: 200 });

    } catch (error) {
        console.error("❌ Error completing interview:", error);
        return NextResponse.json({
            message: "Error completing interview",
            details: error.message
        }, { status: 500 });
    }
}