import config from "../config/config.js";
import mongoose from "mongoose";


async function connectDB() {
    try{
        await mongoose.connect(config.MONGO_URI);
        console.log("Connected to the Database");
    }
    catch(err){
        console.error("Error connecting to database", err);
    }
}

export default connectDB;