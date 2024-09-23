const mongoose = require('mongoose');
require('dotenv').config();

console.log(process.env.MONGODB_URI);
const mongoURI = process.env.MONGODB_URI;

async function connectToMongo() {
  try {
  await mongoose.connect(mongoURI);

    console.log("Connected to MongoDB successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

module.exports = connectToMongo;
