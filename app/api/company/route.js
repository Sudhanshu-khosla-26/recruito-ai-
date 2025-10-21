import { NextResponse } from "next/server";
import { adminDB, bucket } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { v4 as uuidv4 } from "uuid";

// ✅ Helper: upload file to Firebase Storage
async function uploadFileToStorage(file, folder, companyName) {
    const fileExtension = file.name.split(".").pop();
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    const filePath = `${folder}/${companyName}/${uniqueFilename}`;
    const fileRef = bucket.file(filePath);
    const buffer = Buffer.from(await file.arrayBuffer());

    await fileRef.save(buffer, {
        metadata: {
            contentType: file.type,
            metadata: {
                originalName: file.name,
                uploadedAt: new Date().toISOString(),
                companyName,
            },
        },
    });

    await fileRef.makePublic();
    const downloadURL = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    return {
        url: downloadURL,
        path: filePath,
        originalName: file.name,
        size: file.size,
        type: file.type,
    };
}

// ✅ Helper: validate file type and size
function validateFile(file, allowedTypes, maxSizeInMB = 5) {
    if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type for ${file.name}`);
    }
    const maxSize = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSize) {
        throw new Error(
            `File ${file.name} is too large. Max size: ${maxSizeInMB}MB`
        );
    }
}

export async function POST(request) {
    try {
        const formData = await request.formData();
        console.log("Received form data:", formData);

        const company_name = formData.get("company_name");
        const admin_email = formData.get("admin_email");
        const company_email = formData.get("company_email");
        const industry = formData.get("industry");
        const company_size = formData.get("company_size");
        const website = formData.get("website");
        const description = formData.get("description");
        const address = formData.get("address");
        const created_by_id = formData.get("created_by_id");

        const logoFile = formData.get("logofile");
        const documentFiles = formData.getAll("documents");

        if (
            !company_name ||
            !admin_email ||
            !company_email ||
            !company_size ||
            !industry ||
            !address
        ) {
            return NextResponse.json(
                { error: "All required fields must be filled." },
                { status: 400 }
            );
        }

        if (!logoFile) {
            return NextResponse.json(
                { error: "Company logo is required." },
                { status: 400 }
            );
        }

        if (!documentFiles || documentFiles.length === 0) {
            return NextResponse.json(
                { error: "At least one document is required." },
                { status: 400 }
            );
        }

        const duplicateCheck = await adminDB
            .collection("companies")
            .where("company_name", "==", company_name.trim())
            .get();

        if (!duplicateCheck.empty) {
            return NextResponse.json(
                { error: "Company with this name already exists." },
                { status: 400 }
            );
        }

        const logoAllowedTypes = ["image/jpeg", "image/png", "image/webp"];
        const documentAllowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "image/jpeg",
            "image/png",
        ];

        validateFile(logoFile, logoAllowedTypes, 2);
        documentFiles.forEach((file) => {
            if (file.size > 0) validateFile(file, documentAllowedTypes, 10);
        });

        const logoUploadResult = await uploadFileToStorage(
            logoFile,
            "company-logos",
            company_name
        );

        const documentUploadPromises = documentFiles.map(async (file) => {
            if (file.size > 0) {
                return await uploadFileToStorage(
                    file,
                    "company-documents",
                    company_name
                );
            }
            return null;
        });

        const documentUploadResults = await Promise.all(documentUploadPromises);
        const uploadedDocuments = documentUploadResults.filter((res) => res !== null);

        const companyData = {
            company_name: company_name.trim(),
            admin_email: admin_email.trim(),
            company_email: company_email.trim(),
            industry: industry.trim(),
            company_size: company_size.trim(),
            website: website?.trim() || null,
            description: description?.trim() || null,
            address: address.trim(),
            logo: logoUploadResult.url || null,
            documents: uploadedDocuments.map((doc) => doc.url) || [],
            status: "inactive",
            created_at: FieldValue.serverTimestamp(),
            updated_at: FieldValue.serverTimestamp(),
            created_by_id: created_by_id,
        };

        const docRef = await adminDB.collection("companies").add(companyData);

        return NextResponse.json(
            {
                ok: true,
                id: docRef.id,
                message: "Company created successfully.",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating company:", error);
        return NextResponse.json(
            {
                error: "Failed to create company.",
                details: error.message,
            },
            { status: 500 }
        );
    }
}
