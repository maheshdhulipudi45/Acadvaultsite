const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://maheshdhulipudi45_db_user:QCLmNKI7IMZPdrXY@cluster0.wwavi3s.mongodb.net/acadvault?retryWrites=true&w=majority';
  if (!uri) {
    console.error("Error: MONGODB_URI environment variable is missing.");
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
