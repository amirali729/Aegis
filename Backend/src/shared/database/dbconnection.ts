import mongoose from "mongoose";

const dbConnection = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGO_URI is missing in .env");
  }

  try {
    const connect = await mongoose.connect(uri);
    console.log(`Database connected on ${connect.connection.host}`);
  } catch (error) {
    // always wrap error in proper Error object
    console.error(`Error connecting to database: ${error}`);
    process.exit(1); // exit safely
  }
};

export default dbConnection;