import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function DELETE(request, { params }) {
    try {
        const session = request.cookies.get("session")?.value;
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

        if (decodedUser.role !== "Admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Get user document to delete
        const userDocToDelete = await adminDB.collection("users").doc(id).get();

        if (!userDocToDelete.exists) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userDataToDelete = userDocToDelete.data();

        // Check company ownership
        if (userDataToDelete?.company_id !== decodedUser.company_id) {
            return NextResponse.json({
                error: "Forbidden: Not your company employee"
            }, { status: 403 });
        }

        // Prevent deleting another Admin
        if (userDataToDelete?.role === "Admin") {
            return NextResponse.json({
                error: "Cannot delete another Admin"
            }, { status: 403 });
        }

        try {
            // Delete from Firebase Auth first
            try {
                await getAuth().deleteUser(id);
                console.log("User deleted from Firebase Auth:", id);
            } catch (authError) {
                console.error("Error deleting from Auth:", authError);
                // Continue with Firestore deletion
            }

            // Delete from Firestore
            await adminDB.collection("users").doc(id).delete();
            console.log("User deleted from Firestore:", id);

            return NextResponse.json({
                message: "User deleted successfully from both Auth and Database",
                deletedUser: {
                    id: id,
                    email: userDataToDelete.email,
                    name: userDataToDelete.name
                }
            }, { status: 200 });

        } catch (deleteError) {
            console.error("Error during deletion:", deleteError);
            return NextResponse.json({
                error: "Failed to delete user completely",
                details: deleteError.message
            }, { status: 500 });
        }

    } catch (err) {
        console.error("Delete user error:", err);
        return NextResponse.json({
            error: "Internal Server Error",
            details: err.message
        }, { status: 500 });
    }
}