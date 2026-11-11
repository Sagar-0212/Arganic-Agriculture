import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sendriya', {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.dbConnected = true;
  } catch (error) {
    console.error(`Database Connection Error (Non-Fatal for Demo): ${error.message}`);
    global.dbConnected = false;
  }
};

export default connectDB;
