// pages/api/upload/route.ts
import { NextResponse } from "next/server";
import { connectToDb } from "../../../lib/mongodb"; // Your MongoDB connection utility
import { Zip } from "../../../models/zip"; // Your Zip model
import { v2 as cloudinary } from "cloudinary";

export async function POST(req) {
    try {
        const data = await req.formData();
        const file = data.get("file");
        const title = data.get("title");

        if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        if (!title) return NextResponse.json({ error: "No title provided" }, { status: 400 });

        let fileName = title;

        // Ensure uploaded file name has .zip extension
        if (!fileName.toLowerCase().endsWith(".zip")) {
            fileName += ".zip-sss";
        }

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
                { resource_type: "raw", public_id: `zips/${fileName}`, folder: 'zips', },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        // Connect to MongoDB and save the zip data
        await connectToDb(); // Ensure this method connects to your MongoDB
        const newZip = new Zip({
            title: title, // Save the zip title
            url: uploadResponse.secure_url, // Save the Cloudinary URL
        });

        await newZip.save(); // Save zip document in MongoDB

        // Return success response with zip URL
        return NextResponse.json({
            message: "Zip uploaded and saved successfully",
            data: {
                title: newZip.title,
                url: newZip.url,
            },
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
