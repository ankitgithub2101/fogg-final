const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const crypto = require("crypto");
const nodemailer = require("nodemailer");


// Temporary login attempt tracker (in-memory)
const loginAttempts = {};

// Signup
exports.signup = async (req, res) => {
  const { name, email, password, favFood } = req.body;

  try {
    if (!name || !email || !password || !favFood) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Hash favFood
    const hashedFavFood = await bcrypt.hash(favFood.toLowerCase(), 10); // convert to lower case for consistency

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      favFood: hashedFavFood,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Login
// Temporary login attempt tracker
// controllers/authController.js
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // ❌ User not found → normal error, do not count for bogus mode
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // ✅ Correct password → reset attempts
      delete loginAttempts[email];

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      return res.json({
        success: true,
        token,
        user: {
          name: user.name,
          email: user.email,
        },
      });
    }

    // ❌ Wrong password → increment attempts only for that email
    loginAttempts[email] = (loginAttempts[email] || 0) + 1;

    const attemptsLeft = 3 - loginAttempts[email];

    if (loginAttempts[email] >= 3) {
      delete loginAttempts[email]; // reset after redirect
      return res.json({ success: false, redirectBogus: true });
    }

    return res.json({
      success: false,
      attemptsLeft,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// forgetpass
exports.forgotPasswordEmail = async (req, res) => {
  const { email, favFood } = req.body;

  if (!email || !favFood)
    return res.status(400).json({ message: "Email and favFood required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isFavFoodCorrect = await bcrypt.compare(favFood.toLowerCase(), user.favFood);
    if (!isFavFoodCorrect)
      return res.status(401).json({ message: "Favorite food does not match" });

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Try sending email
    try {
    //   const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: process.env.GMAIL_USER,
    //     pass: process.env.GMAIL_PASS,
    //   },
    // });

    const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

transporter.verify((err, success) => {
  if (err) console.error("Transporter verification failed:", err);
  else console.log("Email transporter is ready");
});

      const resetURL = `https://fogg-final.netlify.app/reset-password?token=${token}`;
      await transporter.sendMail({
        to: user.email,
        subject: "Password Reset Request",
        html: `<p>Click <a href="${resetURL}">here</a> to reset your password. Token expires in 1 hour.</p>`,
      });

      return res.json({ message: "Reset link sent to your email" });
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);
      return res.status(200).json({
        message:
          "Reset token generated but email could not be sent. Contact admin.",
        token, // optional: only for testing, remove in production
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
// resetpass
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword)
    return res.status(400).json({ message: "Token and new password required" });

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: "Token invalid or expired" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


