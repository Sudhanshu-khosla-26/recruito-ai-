import { adminDB } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        // ✅ Get session cookie
        const session = request.cookies.get("session")?.value;
        if (!session) {
            console.error("❌ No session cookie found");
            return NextResponse.json({ error: "No session found" }, { status: 400 });
        }

        // ✅ Verify Firebase session token
        let decodedToken;
        try {
            decodedToken = await getAuth().verifySessionCookie(session, true);
        } catch (err) {
            console.error("❌ Invalid or expired token:", err);
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
        }

        // ✅ Fetch user document
        const userDoc = await adminDB.collection("users").doc(decodedToken.uid).get();
        if (!userDoc.exists) {
            console.error("❌ User not found for UID:", decodedToken.uid);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userData = userDoc.data();
        console.log("✅ User Data:", userData);

        // ✅ Validate user role
        const validRoles = ["HR", "HM"];
        if (!validRoles.includes(userData.role)) {
            console.error("❌ Invalid user role:", userData.role);
            return NextResponse.json({ error: "User role not valid" }, { status: 403 });
        }

        // ✅ Normalize email for matching
        const normalizedEmail = userData.email?.trim().toLowerCase();


        // ✅ Build query based on user role
        let interviewsQuery;
        if (userData.role === "HR") {
            console.log("📁 Querying Firestore where hr_email == ", normalizedEmail);
            interviewsQuery = adminDB
                .collection("interviews")
                .where("hr_email", "==", normalizedEmail);
        } else if (userData.role === "HM") {
            console.log("📁 Querying Firestore where hm_email == ", normalizedEmail);
            interviewsQuery = adminDB
                .collection("interviews")
                .where("hm_email", "==", normalizedEmail);
        }

        // ✅ Try main query first
        let interviewsSnapshot = await interviewsQuery.get();

        // ⚠️ Fallback logic: if no match, try manual filtering
        if (interviewsSnapshot.empty) {
            console.warn("⚠️ No matches found using direct query. Trying fallback filter...");
            const allDocs = await adminDB.collection("interviews").get();

            const filteredDocs = allDocs.docs.filter((doc) => {
                const data = doc.data();
                const hm = data.hm_email?.trim().toLowerCase();
                const hr = data.hr_email?.trim().toLowerCase();
                return hm === normalizedEmail || hr === normalizedEmail;
            });

            console.log("📊 Fallback matched:", filteredDocs.length);
            interviewsSnapshot = { docs: filteredDocs, empty: filteredDocs.length === 0 };
        }

        // ✅ Handle no data case
        if (interviewsSnapshot.empty) {
            console.log("⚠️ No interviews found for user:", normalizedEmail);
            return NextResponse.json({
                interviews: [],
                user: { email: userData.email, role: userData.role },
            });
        }

        // ✅ Map interviews to clean array
        const interviews = interviewsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));



        return NextResponse.json({
            interviews,
            user: {
                email: userData.email,
                role: userData.role,
            },
        });
    } catch (error) {
        console.error("🔥 Server error fetching interviews:", error);
        return NextResponse.json(
            { error: "Failed to fetch interviews", details: error.message },
            { status: 500 }
        );
    }
}
