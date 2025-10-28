import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function PATCH(request) {
    try {
        const { interviewId, score } = await request.json();

        if (!interviewId) {
            return NextResponse.json(
                { message: "Interview ID is required" },
                { status: 400 }
            );
        }

        console.log(`🏁 Marking interview ${interviewId} as completed`);

        // Update the interview document
        const payload = {
            ended_at: FieldValue.serverTimestamp(),
            status: "completed",
            overall_score: score,
        };

        const interviewRef = adminDB.collection("interviews").doc(interviewId);
        await interviewRef.update(payload);

        console.log(`✅ Interview ${interviewId} marked as completed`);

        // Get the interview document to find the application_id
        const interviewDoc = await interviewRef.get();
        const interviewData = interviewDoc.data();

        if (!interviewData || !interviewData.application_id) {
            console.error("❌ No application_id found in interview document");
            return NextResponse.json({
                success: true,
                message: "Interview completed but application not updated - no application_id found"
            }, { status: 200 });
        }

        const applicationId = interviewData.application_id;
        console.log(`🔍 Found application_id: ${applicationId}`);

        // Update the application document
        const applicationRef = adminDB.collection("applications").doc(applicationId);
        const applicationDoc = await applicationRef.get();

        if (!applicationDoc.exists) {
            console.error("❌ Application document not found");
            return NextResponse.json({
                success: true,
                message: "Interview completed but application not found"
            }, { status: 200 });
        }

        const applicationData = applicationDoc.data();
        const interviewsList = applicationData.interviews_list || [];

        console.log(`📋 Current interviews_list:`, JSON.stringify(interviewsList));

        // Update the specific interview in the list
        const updatedList = interviewsList.map(interview => {
            if (interview.id === interviewId) {
                console.log(`✏️ Updating interview ${interviewId} status to completed`);
                return {
                    ...interview,
                    status: "completed",
                    overall_score: score,
                    ended_at: new Date()
                };
            }
            return interview;
        });

        console.log(`📋 Updated interviews_list:`, JSON.stringify(updatedList));

        await applicationRef.update({ interviews_list: updatedList });

        console.log(`✅ Application ${applicationId} updated successfully`);

        return NextResponse.json({
            success: true,
            message: "Interview completed successfully",
            applicationId: applicationId,
            interviewId: interviewId
        }, { status: 200 });

    } catch (error) {
        console.error("❌ Error completing interview:", error);
        return NextResponse.json({
            message: "Error completing interview",
            details: error.message
        }, { status: 500 });
    }
}