import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function GET(request, { params }) {
    try {
        // ✅ Extract id from dynamic route
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: "Interview ID is required" },
                { status: 400 }
            );
        }


        // ✅ Fetch interview from Firestore
        const interviewRef = await adminDB.collection("interviews").doc(id).get();

        if (!interviewRef.exists) {
            return NextResponse.json(
                { error: "Interview not found" },
                { status: 404 }
            );
        }

        const interviewData = interviewRef.data();
        console.log("Interview Data:", interviewData);

        return NextResponse.json(
            { message: "Interview Details", interview: interviewData },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error starting interview:", error);
        return NextResponse.json(
            { message: "Error starting interview", details: error.message },
            { status: 500 }
        );
    }
}


export async function PATCH(request, { params }) {
    try {
        const session = await request.cookies.get("session")?.value;
        if (!session) {
            return NextResponse.json({ error: "No session found" }, { status: 400 });
        }
        console.log(session);

        let decodedUser;
        try {
            decodedUser = await getAuth().verifySessionCookie(session, true);
            const userDoc = await adminDB.collection("users").doc(decodedUser.uid).get();

            if (!userDoc.exists) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            decodedUser = userDoc.data();
        } catch (err) {
            console.error("Auth error:", err);
            return NextResponse.json({ error: "Invalid token" }, { status: 403 });
        }

        const validRoles = ["HR", "HM"];
        if (!validRoles.includes(decodedUser.role)) {
            return NextResponse.json({ error: "User role is not valid" }, { status: 403 });
        }

        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: "Interview ID is required" },
                { status: 400 }
            );
        }

        const { status, suggestion, result, started_at, comments } = await request.json();

        const interviewRef = adminDB.collection("interviews").doc(id);
        const interviewDoc = await interviewRef.get();

        if (!interviewDoc.exists) {
            return NextResponse.json(
                { error: "Interview not found" },
                { status: 404 }
            );
        }

        await interviewRef.update({
            ...(status && { status }),
            ...(suggestion && { suggestion }),
            ...(result && { result }),
            ...(started_at && { started_at }),
            ...(comments && { comments }),
        });

        return NextResponse.json(
            { message: "Interview updated successfully" },
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json(
            { message: "Error updating interview", details: error.message },
            { status: 500 }
        );
    }
}