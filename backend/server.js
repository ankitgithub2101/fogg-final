const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: "https://fogg-final.netlify.app", // allow your Netlify frontend
  credentials: true, // if sending cookies
}));

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>My API</title>
      </head>
      <body>
        <h1>🚀 Server is Running</h1>
        <p>Welcome to the API home page.</p>
      </body>
    </html>
  `);
});

app.use("/api", require("./routes/authRoutes"));

app.use("/api/files", require("./routes/fileRoutes"));
// Make uploads folder static so frontend can access files
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);