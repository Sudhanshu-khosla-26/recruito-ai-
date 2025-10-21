import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function GET(request) {
    try {
        // 1️⃣ Extract session
        const session = request.cookies.get("session")?.value;
        if (!session) {
            return NextResponse.json({ error: "No session found" }, { status: 400 });
        }

        // 2️⃣ Verify user session
        let decodedUser;
        try {
            const verifiedSession = await getAuth().verifySessionCookie(session, true);
            const userDoc = await adminDB.collection("users").doc(verifiedSession.uid).get();
            if (!userDoc.exists) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }
            decodedUser = { ...userDoc.data(), uid: userDoc.id };
        } catch (err) {
            console.error("Auth error:", err);
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
        }

        // 3️⃣ Role check
        const validRoles = ["Admin", "HHR", "HR", "HM", "recruiter"];
        if (!validRoles.includes(decodedUser.role)) {
            return NextResponse.json({ error: "Unauthorized role" }, { status: 403 });
        }

        const companyId = decodedUser.company_id;
        if (!companyId) {
            return NextResponse.json({ error: "Company ID not found for this user" }, { status: 400 });
        }

        // 4️⃣ Extract query params
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;
        const title = searchParams.get("title")?.trim().toLowerCase() || "";
        const experience = searchParams.get("experience")?.trim().toLowerCase() || "";
        const location = searchParams.get("location")?.trim().toLowerCase() || "";
        const ctcRange = searchParams.get("ctcRange")?.trim().toLowerCase() || "";

        // 5️⃣ Fetch jobs from Firestore
        let query = adminDB
            .collection("jobs")
            .where("company_id", "==", companyId)
            .orderBy("created_at", "desc");

        const snapshot = await query.get();
        let jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 6️⃣ Apply filters
        if (title) {
            jobs = jobs.filter(job => job.title?.toLowerCase().includes(title));
        }
        if (experience) {
            jobs = jobs.filter(job => job.experience?.toLowerCase().includes(experience));
        }
        if (location) {
            jobs = jobs.filter(job => job.location?.toLowerCase().includes(location));
        }
        if (ctcRange) {
            jobs = jobs.filter(job => job.ctcRange?.toLowerCase().includes(ctcRange));
        }

        // 7️⃣ Pagination
        const totalJobs = jobs.length;
        const startIndex = (page - 1) * limit;
        const paginatedJobs = jobs.slice(startIndex, startIndex + limit);

        return NextResponse.json({
            jobs: paginatedJobs,
            total: totalJobs,
            page,
            limit,
            totalPages: Math.ceil(totalJobs / limit),
        });

    } catch (error) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
    }
}
