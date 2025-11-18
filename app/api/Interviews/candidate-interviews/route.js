import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";

// export async function GET(request) {
//     try {
//         const session = request.cookies.get("session")?.value;
//         if (!session) {
//             return NextResponse.json({ error: "No session found" }, { status: 400 });
//         }

//         let decodedUser;
//         try {
//             decodedUser = await getAuth().verifySessionCookie(session, true);
//             const user = await adminDB.collection("users").doc(decodedUser.uid).get();
//             if (!user.exists) {
//                 return NextResponse.json({ error: "User not found" }, { status: 404 });
//             }
//             const data = user.data();
//             decodedUser = data;
//         } catch (err) {
//             console.log(err);
//             return NextResponse.json({ error: "Invalid token" }, { status: 403 });
//         }

//         const validRoles = ["jobseeker"];
//         if (!validRoles.includes(decodedUser.role)) {
//             return NextResponse.json({ error: "User role is not valid" }, { status: 403 });
//         }

//         const interviewsDocs = await adminDB.collection("interviews")
//             .where("candidate_email", "==", decodedUser.email)
//             .get();

//         const interviews = interviewsDocs.docs.map(doc => ({
//             id: doc.id,
//             ...doc.data()
//         }));

//         return NextResponse.json({
//             interviews
//         });

//     } catch (error) {
//         console.error("Error fetching candidate interviews:", error);
//         return NextResponse.json({ error: "Failed to fetch candidate interviews" }, { status: 500 });
//     }
// }

export async function GET(request) {
    try {
        const session = request.cookies.get("session")?.value;
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let decodedUser;
        try {
            const auth = await getAuth().verifySessionCookie(session, true);
            const userDoc = await adminDB.collection("users").doc(auth.uid).get();
            if (!userDoc.exists) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }
            decodedUser = { uid: auth.uid, ...userDoc.data() };
        } catch {
            return NextResponse.json({ error: "Invalid session" }, { status: 403 });
        }

        // Get all interviews for this candidate
        const interviewsSnapshot = await adminDB
            .collection("interviews")
            .where("candidate_email", "==", decodedUser.email)
            .orderBy("created_at", "desc")
            .get();

        const interviews = [];
        interviewsSnapshot.forEach(doc => {
            interviews.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return NextResponse.json({
            interviews,
            total: interviews.length
        }, { status: 200 });

    } catch (error) {
        console.error("[candidate-interviews.get]", error);
        return NextResponse.json({
            error: "Failed to fetch interviews",
            details: error.message
        }, { status: 500 });
    }
}