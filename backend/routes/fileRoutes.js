const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const protect = require("../middleware/authMiddleware");

const {
  uploadFile,
  getFiles,
  deleteFile,
  editFile,
  uploadBogusFile,
  getBogusFiles,
  deleteBogusFile,
  editBogusFile,
} = require("../controllers/fileController");

// -------- Real Users --------
router.post("/upload", protect, upload.single("file"), uploadFile);
router.get("/myfiles", protect, getFiles);
router.delete("/file/:fileId", protect, deleteFile);
router.put("/file/:fileId", protect, upload.single("file"), editFile);

// -------- Bogus Users --------
router.post("/bogus-upload", upload.single("file"), uploadBogusFile);
router.get("/bogus-myfiles", getBogusFiles);
router.delete("/bogus-file/:fileId", deleteBogusFile);
router.put("/bogus-file/:fileId", upload.single("file"), editBogusFile);

module.exports = router;