import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function POST(request) {
    try {
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

        const validRoles = ["Admin"];
        if (!validRoles.includes(decodedUser.role)) {
            return NextResponse.json({ error: "User role is not valid" }, { status: 403 });
        }

        const role = "admin";
        const { companyId } = await request.json();

        const data = {
            role: role,
            company_id: companyId,
            requested_by: decodedUser.uid,
        };
        const adminReqDoc = await adminDB.collection("admin_requests").add(data);
        return NextResponse.json({ message: "Admin request submitted successfully", id: adminReqDoc.id }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}