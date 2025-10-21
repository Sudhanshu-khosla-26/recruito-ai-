import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";

export async function GET(req) {
    try {
        // Get company_id and job_id from query params
        const { searchParams } = new URL(req.url);
        const companyId = searchParams.get("company_id");
        const jobId = searchParams.get("job_id");


        if (!companyId) {
            return NextResponse.json(
                { error: "Missing company_id" },
                { status: 400 }
            );
        }

        let query = adminDB.collection("jobs");

        // Filter jobs by company_id
        query = query.where("company_id", "==", companyId);

        const jobsSnapshot = await query.get();

        if (jobsSnapshot.empty) {
            return NextResponse.json(
                {
                    applications: [],
                    total: 0,
                    message: "No jobs found for this company",
                },
                { status: 200 }
            );
        }

        // Extract job IDs
        const jobIds = jobsSnapshot.docs.map((doc) => doc.id);

        // If specific job_id is provided, filter by that job
        const applicableJobIds = jobId ? [jobId] : jobIds;

        // Get all applications for these jobs
        let applicationsQuery = adminDB.collection("applications");

        // Build query with job_id filter
        if (applicableJobIds.length === 1) {
            applicationsQuery = applicationsQuery.where(
                "job_id",
                "==",
                applicableJobIds[0]
            );
        } else if (applicableJobIds.length > 1) {
            applicationsQuery = applicationsQuery.where(
                "job_id",
                "in",
                applicableJobIds
            );
        }

        const applicationsSnapshot = await applicationsQuery
            .orderBy("applied_at", "desc")
            .get();

        const applications = applicationsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json(
            {
                applications,
                total: applications.length,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching applications:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch applications",
                details: error.message,
            },
            { status: 500 }
        );
    }
}