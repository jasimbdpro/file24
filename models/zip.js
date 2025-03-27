import mongoose from 'mongoose';

const zipSchema = new mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
});

const Zip = mongoose.models.Zip || mongoose.model('Zip', zipSchema);
export { Zip };
