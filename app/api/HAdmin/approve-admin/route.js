import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth"

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

        const validRoles = ["HAdmin"];
        if (!validRoles.includes(decodedUser.role)) {
            return NextResponse.json({ error: "User role is not valid" }, { status: 403 });
        }

        const { approve_Application_id, Permissions } = await request.json();
        if (!approve_Application_id) {
            return NextResponse.json({ error: "Missing required fields: approve_Application_id" }, { status: 400 });
        }

        const appRef = adminDB.collection("admin_requests").doc(approve_Application_id);
        const appDoc = await appRef.get();
        if (!appDoc.exists) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        const userID = await appDoc.data()?.requested_by;

        if (!userID) {
            return NextResponse.json({ error: "User id NOT FOUND" }, { status: 404 });
        }


        const updatecnadidateref = await adminDB.collection("users").doc(userID);
        const updatecandidateDoc = await updatecnadidateref.get();

        if (!updatecandidateDoc.exists) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        await updatecnadidateref.update({ role: appDoc.data()?.role, status: "active", Permissions, approved_by: decodedUser.uid, is_verified: true });

        const deleteRef = await adminDB.collection("admin_requests").doc(approve_Application_id).delete();

        console.log("deleted", deleteRef);

        return NextResponse.json({ message: "Admin approved successfully" }, { status: 200 });


    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}