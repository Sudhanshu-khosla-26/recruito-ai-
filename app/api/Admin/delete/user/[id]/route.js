import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function DELETE(
    request,
    { params }
) {
    try {
        const session = request.cookies.get("session")?.value;
        if (!session) {
            return NextResponse.json({ error: "No session found" }, { status: 400 });
        }

        // Verify session with Admin SDK
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

        // Role check
        if (decodedUser.role !== "Admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const docRef = await adminDB.collection("users").doc(id);
        const userDoc = await docRef.get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (userDoc.data()?.company_id !== decodedUser.company_id) {
            return NextResponse.json({ error: "Forbidden: Not your company Employee" }, { status: 403 });
        }

        if (userDoc.data()?.role === "Admin") {
            return NextResponse.json({ error: "Cannot delete another Admin" }, { status: 403 });
        }

        await docRef.delete();
        return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    } catch (err) {
        console.error("Delete user error:", err);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}

