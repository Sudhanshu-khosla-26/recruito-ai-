import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminDB } from "@/lib/firebase-admin";
import { getStorage } from "firebase-admin/storage";

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
        }

        const companyDoc = await adminDB.collection("companies").doc(id).get();

        if (!companyDoc.exists) {
            return NextResponse.json({ error: "Company not found" }, { status: 404 });
        }

        const companyData = { id: companyDoc.id, ...companyDoc.data() };

        return NextResponse.json(companyData);

    } catch (error) {
        console.error("Error fetching company:", error);
        return NextResponse.json(
            { error: "Failed to fetch company", details: error.message },
            { status: 500 }
        );
    }
}

// export async function PATCH(request, { params }) {
//     try {
//         const { id } = await params;

//         if (!id) {
//             return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
//         }

//         // Check if company exists
//         const companyDoc = await adminDB.collection("companies").doc(id).get();

//         if (!companyDoc.exists) {
//             return NextResponse.json({ error: "Company not found" }, { status: 404 });
//         }

//         // Parse FormData
//         const formData = await request.formData();

//         // Build update object with only provided fields
//         const updateData = {};

//         // Text fields
//         const textFields = [
//             'company_name',
//             'industry',
//             'admin_email',
//             'company_email',
//             'website',
//             'address',
//             'company_size',
//             'status',
//             'description'
//         ];

//         textFields.forEach(field => {
//             const value = formData.get(field);
//             if (value !== null && value !== undefined && value !== '') {
//                 updateData[field] = value;
//             }
//         });

//         // Handle logo file upload (if provided)
//         const logoFile = formData.get('logofile');
//         if (logoFile && logoFile.size > 0) {
//             try {
//                 const bucket = getStorage().bucket();
//                 const logoFileName = `company-logos/${id}-${Date.now()}-${logoFile.name}`;
//                 const file = bucket.file(logoFileName);

//                 const buffer = Buffer.from(await logoFile.arrayBuffer());
//                 await file.save(buffer, {
//                     metadata: {
//                         contentType: logoFile.type,
//                     },
//                 });

//                 await file.makePublic();
//                 const logoUrl = `https://storage.googleapis.com/${bucket.name}/${logoFileName}`;
//                 updateData.logo = logoUrl;

//                 // Optionally delete old logo
//                 const oldLogo = companyDoc.data().logo;
//                 if (oldLogo) {
//                     try {
//                         const oldFileName = oldLogo.split('/').pop();
//                         await bucket.file(`company-logos/${oldFileName}`).delete();
//                     } catch (err) {
//                         console.warn("Could not delete old logo:", err);
//                     }
//                 }
//             } catch (uploadError) {
//                 console.error("Error uploading logo:", uploadError);
//                 return NextResponse.json(
//                     { error: "Failed to upload logo", details: uploadError.message },
//                     { status: 500 }
//                 );
//             }
//         }

//         // Handle document uploads (if provided)
//         const documentFiles = formData.getAll('documents');
//         if (documentFiles && documentFiles.length > 0 && documentFiles[0].size > 0) {
//             try {
//                 const bucket = getStorage().bucket();
//                 const documentUrls = [];

//                 for (const doc of documentFiles) {
//                     if (doc.size > 0) {
//                         const docFileName = `company-documents/${id}-${Date.now()}-${doc.name}`;
//                         const file = bucket.file(docFileName);

//                         const buffer = Buffer.from(await doc.arrayBuffer());
//                         await file.save(buffer, {
//                             metadata: {
//                                 contentType: doc.type,
//                             },
//                         });

//                         await file.makePublic();
//                         const docUrl = `https://storage.googleapis.com/${bucket.name}/${docFileName}`;
//                         documentUrls.push(docUrl);
//                     }
//                 }

//                 if (documentUrls.length > 0) {
//                     // Merge with existing documents
//                     const existingDocs = companyDoc.data().documents || [];
//                     updateData.documents = [...existingDocs, ...documentUrls];
//                 }
//             } catch (uploadError) {
//                 console.error("Error uploading documents:", uploadError);
//                 return NextResponse.json(
//                     { error: "Failed to upload documents", details: uploadError.message },
//                     { status: 500 }
//                 );
//             }
//         }

//         // Add updated timestamp
//         updateData.updated_at = new Date();

//         // Update the company document
//         await adminDB.collection("companies").doc(id).update(updateData);

//         // Fetch and return updated company data
//         const updatedCompanyDoc = await adminDB.collection("companies").doc(id).get();
//         const updatedCompanyData = { id: updatedCompanyDoc.id, ...updatedCompanyDoc.data() };

//         return NextResponse.json({
//             message: "Company updated successfully",
//             company: updatedCompanyData
//         }, { status: 200 });

//     } catch (error) {
//         console.error("Error updating company:", error);
//         return NextResponse.json(
//             { error: "Failed to update company", details: error.message },
//             { status: 500 }
//         );
//     }
// }

// Alternative: PUT method for complete replacement


export async function PUT(request, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
        }

        // Check if company exists
        const companyDoc = await adminDB.collection("companies").doc(id).get();

        if (!companyDoc.exists) {
            return NextResponse.json({ error: "Company not found" }, { status: 404 });
        }

        // Parse FormData
        const formData = await request.formData();

        // Required fields validation
        const requiredFields = ['company_name', 'admin_email', 'company_email', 'address', 'industry'];
        for (const field of requiredFields) {
            if (!formData.get(field)) {
                return NextResponse.json(
                    { error: `${field} is required` },
                    { status: 400 }
                );
            }
        }

        // Build complete update object
        const updateData = {
            company_name: formData.get('company_name'),
            industry: formData.get('industry'),
            admin_email: formData.get('admin_email'),
            company_email: formData.get('company_email'),
            website: formData.get('website') || '',
            address: formData.get('address'),
            company_size: formData.get('company_size') || '11-50',
            status: formData.get('status') || companyDoc.data().status || 'active',
            description: formData.get('description') || '',
            updated_at: new Date(),
        };

        // Handle logo file upload
        const logoFile = formData.get('logofile');
        if (logoFile && logoFile.size > 0) {
            try {
                const bucket = getStorage().bucket();
                const logoFileName = `company-logos/${id}-${Date.now()}-${logoFile.name}`;
                const file = bucket.file(logoFileName);

                const buffer = Buffer.from(await logoFile.arrayBuffer());
                await file.save(buffer, {
                    metadata: {
                        contentType: logoFile.type,
                    },
                });

                await file.makePublic();
                updateData.logo = `https://storage.googleapis.com/${bucket.name}/${logoFileName}`;
            } catch (uploadError) {
                console.error("Error uploading logo:", uploadError);
                return NextResponse.json(
                    { error: "Failed to upload logo", details: uploadError.message },
                    { status: 500 }
                );
            }
        } else {
            // Keep existing logo
            updateData.logo = companyDoc.data().logo;
        }

        // Handle documents
        const documentFiles = formData.getAll('documents');
        if (documentFiles && documentFiles.length > 0 && documentFiles[0].size > 0) {
            try {
                const bucket = getStorage().bucket();
                const documentUrls = [];

                for (const doc of documentFiles) {
                    if (doc.size > 0) {
                        const docFileName = `company-documents/${id}-${Date.now()}-${doc.name}`;
                        const file = bucket.file(docFileName);

                        const buffer = Buffer.from(await doc.arrayBuffer());
                        await file.save(buffer, {
                            metadata: {
                                contentType: doc.type,
                            },
                        });

                        await file.makePublic();
                        documentUrls.push(`https://storage.googleapis.com/${bucket.name}/${docFileName}`);
                    }
                }

                updateData.documents = [...(companyDoc.data().documents || []), ...documentUrls];
            } catch (uploadError) {
                console.error("Error uploading documents:", uploadError);
                return NextResponse.json(
                    { error: "Failed to upload documents", details: uploadError.message },
                    { status: 500 }
                );
            }
        } else {
            // Keep existing documents
            updateData.documents = companyDoc.data().documents || [];
        }

        // Preserve created_at and created_by_id
        updateData.created_at = companyDoc.data().created_at;
        updateData.created_by_id = companyDoc.data().created_by_id;

        // Update the company document
        await adminDB.collection("companies").doc(id).set(updateData, { merge: false });

        // Fetch and return updated company data
        const updatedCompanyDoc = await adminDB.collection("companies").doc(id).get();
        const updatedCompanyData = { id: updatedCompanyDoc.id, ...updatedCompanyDoc.data() };

        return NextResponse.json({
            message: "Company updated successfully",
            company: updatedCompanyData
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating company:", error);
        return NextResponse.json(
            { error: "Failed to update company", details: error.message },
            { status: 500 }
        );
    }
}

// DELETE method for removing a company
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
        }

        const companyDoc = await adminDB.collection("companies").doc(id).get();

        if (!companyDoc.exists) {
            return NextResponse.json({ error: "Company not found" }, { status: 404 });
        }

        // Optional: Delete associated files from storage
        try {
            const bucket = getStorage().bucket();
            const companyData = companyDoc.data();

            // Delete logo
            if (companyData.logo) {
                const logoFileName = companyData.logo.split('/').pop();
                await bucket.file(`company-logos/${logoFileName}`).delete().catch(err => {
                    console.warn("Could not delete logo:", err);
                });
            }

            // Delete documents
            if (companyData.documents && companyData.documents.length > 0) {
                for (const docUrl of companyData.documents) {
                    const docFileName = docUrl.split('/').pop();
                    await bucket.file(`company-documents/${docFileName}`).delete().catch(err => {
                        console.warn("Could not delete document:", err);
                    });
                }
            }
        } catch (deleteFilesError) {
            console.warn("Error deleting files from storage:", deleteFilesError);
            // Continue with company deletion even if file deletion fails
        }

        // Delete the company document
        await adminDB.collection("companies").doc(id).delete();

        return NextResponse.json({
            message: "Company deleted successfully",
            id: id
        }, { status: 200 });

    } catch (error) {
        console.error("Error deleting company:", error);
        return NextResponse.json(
            { error: "Failed to delete company", details: error.message },
            { status: 500 }
        );
    }
}