import mongoose from "mongoose";

async function connectDB(): Promise<void> {
  try {
    if (!process.env.CONNECTION_URL) {
      console.log('CONNECTION_URL not found in environment variables');
      return; // مش هنخرج من العملية
    }
    
    await mongoose.connect(process.env.CONNECTION_URL as string);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // احذف process.exit(1) في serverless environment
    // process.exit(1); // <-- احذف هذا السطر
  }
}

export default connectDB;