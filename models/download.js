import mongoose from 'mongoose';

const downloadSchema = new mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
});

const Download = mongoose.models.Download || mongoose.model('Download', downloadSchema);
export { Download };
