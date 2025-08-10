import mongoose from "mongoose";

async function connectDB(): Promise<void> {
  try {
    if (!process.env.CONNECTION_URL) {
      console.log('CONNECTION_URL not found in environment variables');
      return; 
    }
    
    await mongoose.connect(process.env.CONNECTION_URL as string);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
 
  }
}

export default connectDB;