const express = require("express");
const {
  signup,
  login,
  getUsers,
  forgotPasswordEmail,
  resetPassword,
} = require("../controllers/authController"); // make sure path is correct

const protect = require("../middleware/authMiddleware"); // make sure path is correct

const router = express.Router();

// Routes
router.post("/signup", signup);          // ✅ function reference
router.post("/login", login);            // ✅
router.get("/users", protect, getUsers); // ✅ protect + function
router.post("/forgot-password", forgotPasswordEmail); // ✅
router.post("/reset-password", resetPassword);        // ✅

module.exports = router;