const fs = require("fs");
const path = require("path");
const User = require("../models/User");

// ---------------- Real Users ----------------
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.files) user.files = [];

    user.files.push({
      userId: user._id,
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      path: req.file.path,
    });

    await user.save();
    res.json({ message: "File uploaded successfully", file: req.file });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("files");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete file
exports.deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found" });

    const fileIndex = user.files.findIndex((f) => f._id.toString() === fileId);
    if (fileIndex === -1) return res.status(404).json({ message: "File not found" });

    // Remove from disk
    const filePath = path.join(__dirname, "..", user.files[fileIndex].path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // Remove from user
    user.files.splice(fileIndex, 1);
    await user.save();

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Edit (replace) file
exports.editFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    if (!req.file) return res.status(400).json({ message: "No new file uploaded" });

    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found" });

    const fileIndex = user.files.findIndex((f) => f._id.toString() === fileId);
    if (fileIndex === -1) return res.status(404).json({ message: "File not found" });

    // Delete old file from disk
    const oldFilePath = path.join(__dirname, "..", user.files[fileIndex].path);
    if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);

    // Replace with new file
    user.files[fileIndex] = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      path: req.file.path,
    };

    await user.save();
    res.json({ message: "File updated successfully", file: req.file });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ---------------- Bogus Users ----------------
const getOrCreateBogusUser = async () => {
  let user = await User.findOne({ email: "bogus@example.com" });
  if (!user) {
    user = await User.create({
      name: "Bogus User",
      email: "bogus@example.com",
      password: "bogus123",
      files: [],
    });
  }
  return user;
};

exports.uploadBogusFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const user = await getOrCreateBogusUser();
    user.files.push({
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      path: req.file.path,
    });

    await user.save();
    res.json({ message: "Bogus file uploaded successfully", file: req.file });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBogusFiles = async (req, res) => {
  try {
    const user = await getOrCreateBogusUser();
    res.json(user.files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBogusFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const user = await getOrCreateBogusUser();

    const fileIndex = user.files.findIndex((f) => f._id.toString() === fileId);
    if (fileIndex === -1) return res.status(404).json({ message: "File not found" });

    const filePath = path.join(__dirname, "..", user.files[fileIndex].path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    user.files.splice(fileIndex, 1);
    await user.save();

    res.json({ message: "Bogus file deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.editBogusFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    if (!req.file) return res.status(400).json({ message: "No new file uploaded" });

    const user = await getOrCreateBogusUser();
    const fileIndex = user.files.findIndex((f) => f._id.toString() === fileId);
    if (fileIndex === -1) return res.status(404).json({ message: "File not found" });

    const oldFilePath = path.join(__dirname, "..", user.files[fileIndex].path);
    if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);

    user.files[fileIndex] = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      path: req.file.path,
    };

    await user.save();
    res.json({ message: "Bogus file updated successfully", file: req.file });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};