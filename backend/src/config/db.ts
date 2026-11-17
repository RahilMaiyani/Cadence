import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error("MONGODB_URI is not defined.");
        process.exit(1);
    }

    try {
        mongoose.connection.on('connected', () => {
            console.log("MongoDB connection established successfully");
        });

        mongoose.connection.on("error", (err) => {
            console.error("MongoDB connection error: ", err);
        });

        mongoose.connection.on("disconnected", () => {
            console.warn("MongoDB connection disconnected.")
        });

        await mongoose.connect(uri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

    }
    catch (err) {
        console.error("Error occured while connecting to mongodb, Error: ", err);
        process.exit(1);
    }
}