// models/User.js
const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: String,      // name stored on server
  originalname: String,  // original file name
  mimetype: String,
  path: String,          // file path on server
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    favFood: { type: String, required: true }, // <-- new field for security question
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    files: [
      {
        filename: String,
        originalname: String,
        mimetype: String,
        path: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);