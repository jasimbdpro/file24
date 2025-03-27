// pages/api/upload/route.ts
import { NextResponse } from "next/server";
import { connectToDb } from "../../../lib/mongodb"; // Your MongoDB connection utility
import { Download } from "../../../models/download"; // Your download model
import { v2 as cloudinary } from "cloudinary";

export async function POST(req) {
    try {
        const data = await req.formData();
        const file = data.get("file");
        const title = data.get("title");

        if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        if (!title) return NextResponse.json({ error: "No title provided" }, { status: 400 });

        const originalFileName = file.name;
        const fileExtension = originalFileName.split('.').pop(); // Get the file extension
        const fileName = `${title}.${fileExtension}`; // Ensure the title includes the extension




        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Cloudinary configuration
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        const uploadResponse = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: "raw",
                    public_id: `downloads/${fileName}`,
                    folder: 'downloads',
                    flags: "attachment", // Ensures file is downloadable
                    type: "upload", // Ensures it's publicly accessible
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });


        // Connect to MongoDB and save the download data
        await connectToDb(); // Ensure this method connects to your MongoDB
        const newDownload = new Download({
            title: title, // Save the download title
            url: uploadResponse.secure_url, // Save the Cloudinary URL
        });

        await newDownload.save(); // Save download document in MongoDB

        // Return success response with download URL
        return NextResponse.json({
            message: "Download uploaded and saved successfully",
            data: {
                title: newDownload.title,
                url: newDownload.url,
            },
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
