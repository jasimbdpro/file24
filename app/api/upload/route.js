import { NextResponse } from "next/server";
import { connectToDb } from "../../../lib/mongodb"; // MongoDB connection utility
import { Download } from "../../../models/download"; // MongoDB model for storing downloads
import { v2 as cloudinary } from "cloudinary"; // Cloudinary SDK

export async function POST(req) {
    try {
        // Parse form data
        const data = await req.formData();
        const file = data.get("file");
        const title = data.get("title");

        // Check for file and title input
        if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        if (!title) return NextResponse.json({ error: "No title provided" }, { status: 400 });

        // Generate file name and extension
        const originalFileName = file.name;
        const fileExtension = originalFileName.split('.').pop(); // Get the file extension
        const fileName = `${title}.${fileExtension}`; // Set file name to title + extension

        // Convert file to buffer for upload
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Cloudinary configuration
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        // Upload the file to Cloudinary
        const uploadResponse = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: "raw",    // Specify file type (raw files)
                    public_id: `downloads/${fileName}`, // Set a custom public ID
                    folder: 'downloads',  // Optional: Folder in Cloudinary for organization
                    flags: "attachment",  // Makes the file downloadable
                    type: "upload",       // Makes it publicly accessible
                },
                (error, result) => {
                    if (error) reject(error); // Reject if error
                    else resolve(result); // Resolve with result (upload response)
                }
            ).end(buffer); // Upload the file buffer
        });

        // Log the Cloudinary upload response
        console.log("Cloudinary upload response public id:", uploadResponse.public_id);  // This logs the response from Cloudinary

        // Connect to MongoDB and save the download data
        await connectToDb(); // Ensure MongoDB is connected

        // Create a new download entry in the database
        const newDownload = new Download({
            title: title,          // Save the title
            url: uploadResponse.secure_url,  // Save the Cloudinary URL
            cloudinaryId: uploadResponse.public_id,  // Save the Cloudinary public ID
        });

        // Save the document in MongoDB
        await newDownload.save();
        console.log("Saved Download:", newDownload);
        // Return success response with download details
        return NextResponse.json({
            message: "Download uploaded and saved successfully",
            data: {
                title: newDownload.title, // Title of the file
                url: newDownload.url, // URL of the file from Cloudinary
                publicId: newDownload.cloudinaryId,  // Cloudinary public ID
            },
        });

    } catch (error) {
        // Handle errors
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
