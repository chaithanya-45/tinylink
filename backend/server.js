require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const linksRouter = require("./routes/links");
const Link = require("./models/Link");

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/links", linksRouter);

// Redirect Route
app.get("/:shortCode", async (req, res) => {
  try {
    const link = await Link.findOne({ shortCode: req.params.shortCode });

    if (!link) {
      return res.status(404).send("Short link not found");
    }

    link.clicks.push({
      timestamp: new Date(),
      referrer: req.get("referer") || "direct",
    });

    await link.save();

    res.redirect(link.originalUrl);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Home Route
app.get("/", (req, res) => {
  res.send("TinyLink API is running.");
});

// ========================
// MongoDB Connection
// ========================

const MONGO_URI = process.env.MONGO_URI;

// Debug (does NOT print your password)
console.log("MONGO_URI exists:", !!MONGO_URI);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

// Export for Vercel
module.exports = app;