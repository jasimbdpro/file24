import mongoose from "mongoose";
let isConnected = false;
export const connectToDb = async () => {
    mongoose.set("strictQuery", true);
    if (isConnected) {
        console.log("Mongodb is already connected")
        return;
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: "file24"
        })
        isConnected = true;
        console.log("MongoDB coonnected")
    } catch (error) {
        console.log(error)
    }
}