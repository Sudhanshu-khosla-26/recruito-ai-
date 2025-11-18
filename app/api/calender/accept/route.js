// app/api/Interviews/reschedule/accept/route.js
import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminDB } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { GetCandlenderCLient } from "@/lib/googleCalendar";

export async function POST(request) {
    try {
        // Authentication check
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

        // Check if user is HR or HM
        const validRoles = ["Admin", "HHR", "HR", "HM", "recruiter"];
        if (!validRoles.includes(decodedUser.role)) {
            return NextResponse.json({
                error: "Unauthorized. Only HR/HM can accept reschedule requests"
            }, { status: 403 });
        }

        const body = await request.json();
        const { interview_id } = body;

        if (!interview_id) {
            return NextResponse.json({
                error: "Interview ID is required"
            }, { status: 400 });
        }

        // Get interview document
        const interviewDoc = await adminDB.collection("interviews").doc(interview_id).get();

        if (!interviewDoc.exists) {
            return NextResponse.json({ error: "Interview not found" }, { status: 404 });
        }

        const interviewData = interviewDoc.data();

        // Check if interview has a reschedule request
        if (interviewData.status !== "rescheduled") {
            return NextResponse.json({
                error: "No pending reschedule request for this interview"
            }, { status: 400 });
        }

        if (!interviewData.requested_time) {
            return NextResponse.json({
                error: "No requested time found for reschedule"
            }, { status: 400 });
        }

        // Verify the HR/HM is the one assigned to this interview
        // const isAuthorized =
        //     (decodedUser.role === "HM" && interviewData.hm_id === decodedUser.uid) ||
        //     (decodedUser.role === "HR" && interviewData.hr_id === decodedUser.uid) ||
        //     ["Admin", "HHR", "recruiter"].includes(decodedUser.role);

        // if (!isAuthorized) {
        //     return NextResponse.json({
        //         error: "You are not authorized to manage this interview"
        //     }, { status: 403 });
        // }

        // Calculate new end time (assuming 30-minute duration, adjust as needed)
        const requestedStartTime = new Date(interviewData.requested_new_time);
        const duration = interviewData.duration_minutes || 30;
        const requestedEndTime = new Date(requestedStartTime.getTime() + duration * 60000);

        // Update Google Calendar event if exists
        if (interviewData.google_event_id) {
            try {
                const calendar = await GetCandlenderCLient();
                const calendarId = "b572b11b331778a1264c46b2d1d5becd3f11352fa6742914aaffdaa2a4f85b56@group.calendar.google.com";

                // Get existing event
                const existingEvent = await calendar.events.get({
                    calendarId: calendarId,
                    eventId: interviewData.google_event_id
                });

                // Update the event with new times
                const updatedEvent = {
                    ...existingEvent.data,
                    start: {
                        dateTime: requestedStartTime.toISOString(),
                        timeZone: "Asia/Kolkata",
                    },
                    end: {
                        dateTime: requestedEndTime.toISOString(),
                        timeZone: "Asia/Kolkata",
                    },
                    description: (existingEvent.data.description || '') +
                        `\n\nRescheduled on: ${new Date().toLocaleString()}\n` +
                        `Reason: ${interviewData.reschedule_reason || 'Not specified'}\n` +
                        `Approved by: ${decodedUser.email}`
                };

                await calendar.events.update({
                    calendarId: calendarId,
                    eventId: interviewData.google_event_id,
                    requestBody: updatedEvent,
                    sendUpdates: 'all' // Send email updates to all participants
                });

                console.log("Calendar event updated:", interviewData.google_event_id);
            } catch (calendarError) {
                console.error("Google Calendar update error:", calendarError);
                return NextResponse.json({
                    error: "Failed to update calendar event",
                    details: calendarError.message
                }, { status: 500 });
            }
        }

        // Update interview in Firestore
        await adminDB.collection("interviews").doc(interview_id).update({
            start_time: requestedStartTime.toISOString(),
            end_time: requestedEndTime.toISOString(),
            interview_date: requestedStartTime.toISOString().split('T')[0],
            status: "confirmed", // Change status from "rescheduled" to "confirmed"
            reschedule_approved_at: FieldValue.serverTimestamp(),
            reschedule_approved_by: decodedUser.uid,
            reschedule_approved_by_email: decodedUser.email,
            reschedule_count: FieldValue.increment(1),
            requested_time: null, // Clear the requested time
            updated_at: FieldValue.serverTimestamp()
        });

        // Optional: Send notification to candidate
        // You can add email/notification logic here

        return NextResponse.json({
            success: true,
            message: "Reschedule request accepted successfully. Calendar and notifications have been updated.",
            new_start_time: requestedStartTime.toISOString(),
            new_end_time: requestedEndTime.toISOString()
        }, { status: 200 });

    } catch (error) {
        console.error("[interviews.reschedule.accept] Error:", error);
        return NextResponse.json({
            error: "Failed to accept reschedule request",
            details: error.message
        }, { status: 500 });
    }
}