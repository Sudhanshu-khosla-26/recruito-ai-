import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(request, { params }) {
    try {
        const { company_id } = await params;

        const settingsSnapshot = await adminDB
            .collection("company_settings")
            .where("company_id", "==", company_id)
            .limit(1)
            .get();

        if (settingsSnapshot.empty) {
            return NextResponse.json(
                { error: "Settings not found for this company." },
                { status: 404 }
            );
        }

        const settingsDoc = settingsSnapshot.docs[0];
        const settings = {
            id: settingsDoc.id,
            ...settingsDoc.data(),
        };

        return NextResponse.json({ settings }, { status: 200 });
    } catch (error) {
        console.error("Error fetching company settings:", error);
        return NextResponse.json(
            { error: "Failed to fetch settings.", details: error.message },
            { status: 500 }
        );
    }
}


// /api/company-settings/[company_id]/route.js (add PATCH)

export async function PATCH(request, { params }) {
    try {
        const { company_id } = await params;
        const body = await request.json();

        // Validate max_ai_interviews if provided
        if (body.max_ai_interviews !== undefined) {
            const maxAi = parseInt(body.max_ai_interviews);
            if (isNaN(maxAi) || maxAi < 1 || maxAi > 3) {
                return NextResponse.json(
                    { error: "max_ai_interviews must be between 1 and 3." },
                    { status: 400 }
                );
            }
            body.max_ai_interviews = maxAi;
        }

        // Find settings document
        const settingsSnapshot = await adminDB
            .collection("company_settings")
            .where("company_id", "==", company_id)
            .limit(1)
            .get();

        if (settingsSnapshot.empty) {
            return NextResponse.json(
                { error: "Settings not found for this company." },
                { status: 404 }
            );
        }

        const settingsDocId = settingsSnapshot.docs[0].id;

        // Only allow updating specific fields
        const allowedFields = [
            "max_ai_interviews",
            "allow_additional_rounds",
            "max_additional_rounds",
            "reminder_hours_before",
            "auto_reject_below_score",
        ];

        const updateData = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        updateData.updated_at = FieldValue.serverTimestamp();

        await adminDB
            .collection("company_settings")
            .doc(settingsDocId)
            .update(updateData);

        return NextResponse.json(
            { ok: true, message: "Settings updated successfully." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating company settings:", error);
        return NextResponse.json(
            { error: "Failed to update settings.", details: error.message },
            { status: 500 }
        );
    }
}