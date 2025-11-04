import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function DELETE(request, { params }) {
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

        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Prevent self-deletion
        if (id === decodedUser.uid) {
            return NextResponse.json({
                error: "Cannot delete your own account"
            }, { status: 403 });
        }

        // Step 1: Get user document to verify it exists
        const userDocToDelete = await adminDB.collection("users").doc(id).get();

        if (!userDocToDelete.exists) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userData = userDocToDelete.data();

        try {
            // Step 2: Delete from Firebase Authentication
            if (userData.uid || id) {
                try {
                    await getAuth().deleteUser(userData.uid || id);
                    console.log("User deleted from Firebase Auth:", userData.uid || id);
                } catch (authError) {
                    console.error("Error deleting from Auth:", authError);
                    // Continue with Firestore deletion even if Auth deletion fails
                    // User might not exist in Auth but exists in Firestore
                    if (authError.code !== 'auth/user-not-found') {
                        // If it's not a "user not found" error, we might want to stop
                        console.warn("Non-standard auth deletion error:", authError.code);
                    }
                }
            }

            // Step 3: Delete from Firestore
            await adminDB.collection("users").doc(id).delete();
            console.log("User deleted from Firestore:", id);

            return NextResponse.json({
                message: "User deleted successfully from both Auth and Database",
                deletedUser: {
                    id: id,
                    email: userData.email,
                    name: userData.name
                }
            }, { status: 200 });

        } catch (deleteError) {
            console.error("Error during deletion:", deleteError);
            return NextResponse.json({
                error: "Failed to delete user completely",
                details: deleteError.message
            }, { status: 500 });
        }

    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message
        }, { status: 500 });
    }
}