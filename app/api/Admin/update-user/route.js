import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function PATCH(request) {
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

        const { role, candidateID, status } = await request.json();

        if (!candidateID) {
            return NextResponse.json({
                error: "candidateID is required"
            }, { status: 400 });
        }

        // Get user to update
        const userRef = adminDB.collection("users").doc(candidateID);
        const userDocToUpdate = await userRef.get();

        if (!userDocToUpdate.exists) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userData = userDocToUpdate.data();

        // Ensure user belongs to same company
        if (userData.company_id !== decodedUser.company_id) {
            return NextResponse.json({
                error: "You can only update users from your company"
            }, { status: 403 });
        }

        // Build update object
        const updateData = {
            updated_at: new Date()
        };

        if (role) {
            // Validate allowed roles
            const allowedRoles = ["HHR", "HR", "HM"];
            if (!allowedRoles.includes(role)) {
                return NextResponse.json({
                    error: "Invalid role. Can only assign HHR, HR, or HM roles"
                }, { status: 400 });
            }
            updateData.role = role;
        }

        if (status) {
            updateData.status = status;
        }

        await userRef.update(updateData);

        return NextResponse.json({
            message: "User updated successfully",
            updatedFields: updateData
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message
        }, { status: 500 });
    }
}