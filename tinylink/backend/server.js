require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const linksRouter = require("./routes/links");
const Link = require("./models/Link");

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/links", linksRouter);

// Redirect route: GET /:shortCode -> redirects to original URL, logs a click
app.get("/:shortCode", async (req, res) => {
  try {
    const link = await Link.findOne({ shortCode: req.params.shortCode });
    if (!link) return res.status(404).send("Short link not found");

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

app.get("/", (req, res) => {
  res.send("TinyLink API is running.");
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/tinylink";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
