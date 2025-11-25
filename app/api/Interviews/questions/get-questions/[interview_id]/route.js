import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";

export async function GET(req, { params }) {
    try {
        console.log("Params received:", params);
        const { interview_id } = await params; // no need for await here

        const questionSnapshot = await adminDB
            .collection("interview_qna")
            .where("interviewId", "==", interview_id)
            .get();

        if (questionSnapshot.empty) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        // Include Firestore document ID
        const questions = questionSnapshot.docs.map(doc => ({
            id: doc.id,        // <--- add this
            ...doc.data()
        }));

        return NextResponse.json({ questions }, { status: 200 });

    } catch (error) {
        console.error("Error fetching questions:", error);
        return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
    }
}
