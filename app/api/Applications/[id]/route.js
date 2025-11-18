import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(request, { paraams }) {
    try {
        const session = request.cookies.get("session")?.value;
        if (!session) {
            return NextResponse.json({ error: "No session found" }, { status: 400 });
        }
        let decodedUser;
        try {
            decodedUser = await getAuth().verifySessionCookie(session, true);
        } catch {
            return NextResponse.json({ error: "Invalid token" }, { status: 403 });
        }



        // const user = await adminDB.collection("users").doc(decodedUser.uid).get();
        // if (!user.exists) {
        //     return NextResponse.json({ error: "User does not exist" }, { status: 404 });
        // }
        // const decodedUserData = user.data();
        // if (!["jobseeker", "Admin", "HR", "HM", "HAdmin"].includes(decodedUserData.role)) {
        //     return NextResponse.json({ error: "User role is not valid" }, { status: 403 });
        // }

        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
        }

        const applicationDoc = await adminDB.collection("applications").doc(id).get();
        if (!applicationDoc.exists) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }
        const applicationData = applicationDoc.data();

        return NextResponse.json({ application: { id: applicationDoc.id, data: applicationData } }, { status: 200 });

    } catch (error) {
        console.error("Error retrieving application:", error);
        return NextResponse.json({ error: "Failed to retrieve application" }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {

        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
        }

        const { status, applicant_phone, applicant_name, applicant_email } = await request.json();

        const applicationRef = adminDB.collection("applications").doc(id);
        const applicationDoc = await applicationRef.get();
        if (!applicationDoc.exists) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        const updateData = {
            updated_at: FieldValue.serverTimestamp(),
        };

        if (status) updateData.status = status;
        if (applicant_phone) updateData.applicant_phone = applicant_phone;
        if (applicant_name) updateData.applicant_name = applicant_name;
        if (applicant_email) updateData.applicant_email = applicant_email;

        await applicationRef.update(updateData);
        return NextResponse.json({ message: "Application updated successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error updating application:", error);
        return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
    }
}