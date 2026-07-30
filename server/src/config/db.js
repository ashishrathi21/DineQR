import mongoose from "mongoose"
import dns from "dns"

dns.setDefaultResultOrder("ipv4first");

const databaseConnection = async () => {
    const primaryUri = process.env.MONGODB_URI;
    const fallbackUri = "mongodb://127.0.0.1:27017/dineqr";
    
    if (primaryUri) {
        try {
            console.log("Attempting database connection to primary Mongo URL...");
            await mongoose.connect(primaryUri);
            console.log("DataBase Connection Success (Primary) 🎉");
            return;
        } catch (err) {
            console.warn("Primary MongoDB connection failed. Retrying with local fallback...", err.message);
        }
    }

    try {
        await mongoose.connect(fallbackUri);
        console.log("DataBase Connection Success (Local Fallback) 💻");
    } catch (err) {
        console.error("Local DataBase Connection Failed: ", err.message);
        process.exit(1);
    }
}

export default databaseConnection;