import { NextResponse } from 'next/server';

import { connectToDb } from '../../../lib/mongodb';
import { deleteFromCloudinary } from '../../../lib/cloudinary';
import { Download } from '../../../models/download';

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing file ID' }, { status: 400 });
        }

        await connectToDb();

        const fileDoc = await Download.findById(id);
        if (!fileDoc) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const cloudinaryPublicId = fileDoc.cloudinaryId;

        await deleteFromCloudinary(cloudinaryPublicId); // delete from Cloudinary
        await Download.findByIdAndDelete(id); // then delete from MongoDB

        return NextResponse.json({ success: true, message: 'File deleted' });
    } catch (error) {
        console.error('DELETE ERROR:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
