const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('Server will keep running. MongoDB will auto-reconnect when available.');
    // Retry connection after 10 seconds
    setTimeout(connectDB, 10000);
  }
};

module.exports = connectDB;
