import { NextResponse } from 'next/server';
import { connectToDb } from '../../../lib/mongodb';
import { Download } from '../../../models/download';


export async function GET() {
    try {
        await connectToDb();
        // Fetch all downloads from MongoDB
        const downloads = await Download.find({});

        // Return the download file data as JSON
        return NextResponse.json(downloads, { status: 200 });
    } catch (error) {
        console.error('Fetching downloads error:', error);
        return NextResponse.json({ error: 'Error fetching downloads' }, { status: 500 });
    }
}
