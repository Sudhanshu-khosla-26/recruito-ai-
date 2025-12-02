// app/api/cron/interview-reminders/route.js

import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * Cron job to:
 * 1. Send reminder emails for upcoming interviews
 * 2. Update expired interviews to 'no_show' status
 * 
 * Vercel Cron: https://vercel.com/docs/cron-jobs
 */

export async function GET(request) {
    try {
        // Verify cron secret for security (Vercel adds this header automatically)
        const authHeader = request.headers.get("authorization");

        // For Vercel Cron, check the secret if it exists
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.NEXT_PUBLIC_CRON_API_KEY}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const results = {
            reminders_sent: 0,
            interviews_expired: 0,
            errors: [],
        };

        // Process reminders and expirations
        await Promise.all([
            sendInterviewReminders(results),
            updateExpiredInterviews(results),
        ]);

        return NextResponse.json({
            success: true,
            ...results,
            processed_at: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Cron job error:", error);
        return NextResponse.json(
            { error: "Cron job failed", details: error.message },
            { status: 500 }
        );
    }
}

/**
 * Send reminder emails for interviews based on company settings
 */
async function sendInterviewReminders(results) {
    try {
        const now = new Date();

        // Get all company settings to check reminder hours
        const settingsSnapshot = await adminDB
            .collection("company_settings")
            .get();

        for (const settingDoc of settingsSnapshot.docs) {
            const settings = settingDoc.data();
            const companyId = settings.company_id;
            const reminderHours = settings.reminder_hours_before || 24;

            // Calculate the time window for reminders
            const reminderTime = new Date(now.getTime() + reminderHours * 60 * 60 * 1000);
            const windowStart = Timestamp.fromDate(new Date(reminderTime.getTime() - 30 * 60 * 1000)); // 30 min before
            const windowEnd = Timestamp.fromDate(new Date(reminderTime.getTime() + 30 * 60 * 1000)); // 30 min after

            // Find interviews that need reminders for this company
            const interviewsSnapshot = await adminDB
                .collection("interviews")
                .where("status", "==", "scheduled")
                .where("scheduled_at", ">=", windowStart)
                .where("scheduled_at", "<=", windowEnd)
                .get();

            for (const interviewDoc of interviewsSnapshot.docs) {
                const interview = interviewDoc.data();

                // Check if reminder already sent
                const reminderSent = interview.reminder_sent || false;
                if (reminderSent) continue;

                // Get application and job details
                const application = await getApplicationDetails(interview.application_id);
                const job = await getJobDetails(interview.job_id);

                // Verify this interview belongs to this company
                if (!application || !job || job.company_id !== companyId) continue;

                const company = await getCompanyDetails(job.company_id);

                try {
                    // Send email to applicant
                    await sendReminderEmail({
                        to: application.applicant_email,
                        applicant_name: application.applicant_name,
                        job_title: job.title,
                        company_name: company?.company_name,
                        interview_mode: interview.mode,
                        scheduled_at: interview.scheduled_at.toDate(),
                        meeting_link: interview.meeting_link,
                    });

                    // Send notification in-app
                    if (application.applicant_id) {
                        await createNotification({
                            receiver_id: application.applicant_id,
                            notification_type: "reminder",
                            title: "Interview Reminder",
                            message: `Your interview for ${job.title} is scheduled in ${reminderHours} hours.`,
                        });
                    }

                    // Mark reminder as sent
                    await adminDB
                        .collection("interviews")
                        .doc(interviewDoc.id)
                        .update({
                            reminder_sent: true,
                            reminder_sent_at: Timestamp.now(),
                        });

                    results.reminders_sent++;
                } catch (emailError) {
                    console.error(`Failed to send reminder for interview ${interviewDoc.id}:`, emailError);
                    results.errors.push(`Interview ${interviewDoc.id}: ${emailError.message}`);
                }
            }
        }
    } catch (error) {
        console.error("Error sending reminders:", error);
        results.errors.push(`Reminders: ${error.message}`);
    }
}

/**
 * Update interviews that are past their scheduled time to 'no_show'
 */
async function updateExpiredInterviews(results) {
    try {
        const now = Timestamp.now();
        const gracePeriod = 30; // minutes grace period after scheduled time

        // Find interviews that are scheduled but past their time
        const expiredSnapshot = await adminDB
            .collection("interviews")
            .where("status", "in", ["scheduled", "confirmed"])
            .where("scheduled_at", "<", Timestamp.fromDate(
                new Date(now.toDate().getTime() - gracePeriod * 60 * 1000)
            ))
            .get();

        if (expiredSnapshot.empty) {
            console.log("No expired interviews found");
            return;
        }

        const batch = adminDB.batch();
        let batchCount = 0;
        const notificationsToSend = [];

        for (const interviewDoc of expiredSnapshot.docs) {
            const interview = interviewDoc.data();

            // Update interview status to no_show
            batch.update(interviewDoc.ref, {
                status: "no_show",
                updated_at: Timestamp.now(),
                expired_at: Timestamp.now(),
            });

            // Update application status
            const applicationRef = adminDB
                .collection("applications")
                .doc(interview.application_id);

            batch.update(applicationRef, {
                status: "not_suitable",
                updated_at: Timestamp.now(),
            });

            batchCount++;

            // Collect notifications to send after batch commit
            const application = await getApplicationDetails(interview.application_id);
            if (application?.applicant_id) {
                notificationsToSend.push({
                    receiver_id: application.applicant_id,
                    notification_type: "interview",
                    title: "Interview Missed",
                    message: "You missed your scheduled interview. Please contact the recruiter if this was an error.",
                });
            }

            // Commit batch every 500 operations (Firestore limit)
            if (batchCount >= 500) {
                await batch.commit();
                results.interviews_expired += batchCount;
                batchCount = 0;
            }
        }

        // Commit remaining batch
        if (batchCount > 0) {
            await batch.commit();
            results.interviews_expired += batchCount;
        }

        // Send notifications after batch commits
        for (const notif of notificationsToSend) {
            await createNotification(notif);
        }
    } catch (error) {
        console.error("Error updating expired interviews:", error);
        results.errors.push(`Expired: ${error.message}`);
    }
}

/**
 * Helper function to get application details
 */
async function getApplicationDetails(applicationId) {
    try {
        const doc = await adminDB.collection("applications").doc(applicationId).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
        console.error("Error fetching application:", error);
        return null;
    }
}

/**
 * Helper function to get job details
 */
async function getJobDetails(jobId) {
    try {
        const doc = await adminDB.collection("job_descriptions").doc(jobId).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
        console.error("Error fetching job:", error);
        return null;
    }
}

/**
 * Helper function to get company details
 */
async function getCompanyDetails(companyId) {
    try {
        if (!companyId) return null;
        const doc = await adminDB.collection("companies").doc(companyId).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
        console.error("Error fetching company:", error);
        return null;
    }
}

/**
 * Send reminder email using Nodemailer
 */
async function sendReminderEmail({ to, applicant_name, job_title, company_name, interview_mode, scheduled_at, meeting_link }) {
    try {
        const modeText = {
            "Wai": "AI Interview",
            "Whr": "HR Interview",
            "Whm": "Hiring Manager Interview",
        }[interview_mode] || "Interview";

        const formattedDate = scheduled_at.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        });

        const subject = `Reminder: ${modeText} Scheduled`;
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 5px; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔔 Interview Reminder</h1>
                    </div>
                    <div class="content">
                        <p>Hi <strong>${applicant_name}</strong>,</p>
                        <p>This is a friendly reminder about your upcoming interview!</p>
                        
                        <div class="info-box">
                            <p><strong>📋 Position:</strong> ${job_title}</p>
                            <p><strong>🏢 Company:</strong> ${company_name || "N/A"}</p>
                            <p><strong>🎯 Interview Type:</strong> ${modeText}</p>
                            <p><strong>📅 Scheduled Time:</strong> ${formattedDate}</p>
                        </div>
                        
                        ${meeting_link ? `
                            <p><strong>Join Meeting:</strong></p>
                            <a href="${meeting_link}" class="button">Click to Join Interview</a>
                        ` : ''}
                        
                        <p><strong>Tips for your interview:</strong></p>
                        <ul>
                            <li>Test your internet connection and device beforehand</li>
                            <li>Join 5 minutes early</li>
                            <li>Have your resume and notes ready</li>
                            <li>Be in a quiet, well-lit location</li>
                        </ul>
                        
                        <p>Good luck! We're excited to speak with you.</p>
                        
                        <div class="footer">
                            <p>If you need to reschedule, please contact the recruiter as soon as possible.</p>
                            <p>This is an automated reminder. Please do not reply to this email.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
Interview Reminder

Hi ${applicant_name},

Your ${modeText} for ${job_title} at ${company_name || "the company"} is scheduled for:
${formattedDate}

${meeting_link ? `Meeting Link: ${meeting_link}` : ''}

Please ensure you're prepared and join on time.

Good luck!
        `;

        // Use absolute URL for production, relative for development
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'http://localhost:3000';

        // Call your send-email API endpoint
        const response = await fetch(`${baseUrl}/api/send-email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                to,
                subject,
                text,
                html,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Email sending failed");
        }

        const result = await response.json();
        console.log("Reminder email sent to:", to, "MessageId:", result.messageId);
        return result;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

/**
 * Create in-app notification
 */
async function createNotification({ receiver_id, notification_type, title, message, sender_id = null }) {
    try {
        await adminDB.collection("notifications").add({
            sender_id,
            receiver_id,
            notification_type,
            title,
            message,
            created_at: Timestamp.now(),
        });
    } catch (error) {
        console.error("Error creating notification:", error);
    }
}