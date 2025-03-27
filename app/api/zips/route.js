import { NextResponse } from 'next/server';
import { connectToDb } from '../../../lib/mongodb';
import { Zip } from '../../../models/zip';


export async function GET() {
    try {
        await connectToDb();
        // Fetch all zips from MongoDB
        const zips = await Zip.find({});

        // Return the zip file data as JSON
        return NextResponse.json(zips, { status: 200 });
    } catch (error) {
        console.error('Fetching zips error:', error);
        return NextResponse.json({ error: 'Error fetching zips' }, { status: 500 });
    }
}
